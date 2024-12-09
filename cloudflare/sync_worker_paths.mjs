import fs from "fs/promises";
import fs_sync from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const ignored_domains = [
  "unirep.io",
  "ashlang.org",
  "keccak-doomsday.com",
  "rstark.net",
  "trusted-setup.com",
  "zkchess.org",
];

const { API_TOKEN, ACCOUNT_ID } = process.env;

const route_paths = (await fs.readdir(".."))
  .filter((filename) =>
    fs_sync.statSync(path.join("..", filename)).isDirectory(),
  )
  .map((filename) => [filename, path.join("..", filename, "routes.js")])
  .filter(([_filename, filepath]) => fs_sync.existsSync(filepath));

const zones = await load_zones();

const routes = [];
for (const [script, module_path] of route_paths) {
  const imported = (await import(module_path)).default();
  routes.push(...imported.map((pattern) => [script, pattern]));
}

const worker_paths = [];
const dns_entries = [];
for (const [script, pattern] of routes) {
  // determine the domain in the path
  const zone_matches = zones.filter(({ name }) => pattern.includes(name));
  if (zone_matches === 0) {
    console.error(
      `in worker ${script} no domain matches ${pattern}, skipping...`,
    );
    process.exit(1);
  }
  if (zone_matches > 1) {
    console.error(
      `in worker ${script} multiple domains matche ${pattern}, skipping...`,
    );
    process.exit(1);
  }
  const [zone] = zone_matches;
  dns_entries.push({
    zoneId: zone.id,
    name: pattern.split("/")[0],
  });
  worker_paths.push({
    zoneId: zone.id,
    script,
    pattern,
  });
}

/// first we'll setup the worker routes

console.log("creating worker routes");
const _routes = await load_worker_routes();
for (const data of worker_paths) {
  await create_or_update_route(data, _routes);
}

console.log("creating dns entries");
for (const data of dns_entries) {
  await create_or_update_dns(data);
}

console.log("cleaning up dns entries");
const existing_dns = await load_dns_routes();
for (const { zoneId, name, id } of existing_dns) {
  const specced = dns_entries.find(
    (d) => d.zoneId === zoneId && d.name === name,
  );
  if (specced) continue;
  await cfetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${id}`,
    { method: "DELETE", msg: `${name}` },
  );
}

console.log("cleaning up worker routes");
const existing_routes = await load_worker_routes();
for (const { zoneId, script, pattern, id } of existing_routes) {
  const specced = worker_paths.find(
    (r) => zoneId === r.zoneId && r.pattern === pattern && r.script === script,
  );
  if (specced) continue;
  // otherwise delete
  await cfetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes/${id}`,
    {
      method: "DELETE",
      msg: `${script} ${pattern}`,
    },
  );
}

////////////////////////////////////////

async function create_or_update_dns({ zoneId, name }) {
  const params = new URLSearchParams({
    per_page: 50,
    comment: "f101",
    name,
  });
  const { result } = await cfetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?${params}`,
  );
  if (result.length === 1) {
    // the record already exists, leave it
    return;
    // const [record] = result;
    // await cfetch(
    //   `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${record.id}`,
    //   { method: "DELETE" },
    // );
  } else if (result.length > 1) {
    console.log("multiple records found, expected 1");
    process.exit(1);
  }
  await cfetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
    {
      method: "POST",
      body: {
        name,
        type: "A",
        comment: "f101",
        proxied: true,
        content: "211.122.211.122",
      },
    },
  );
}

async function create_or_update_route(
  { zoneId, script, pattern },
  existing_routes,
) {
  const existing_route = existing_routes.find(
    (r) => r.zoneId === zoneId && r.pattern === pattern,
  );
  if (existing_route) {
    if (existing_route.script === script) {
      // no operation needed
      return;
    }
    // delete the existing route and replace it
    await cfetch(
      `https://api.cloudflare.com/client/v4/zones/${existing_route.zoneId}/workers/routes/${existing_route.id}`,
      {
        method: "DELETE",
        msg: `${script} ${pattern}`,
      },
    );
  }
  // and create the route we need
  await cfetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/workers/routes`,
    {
      method: "POST",
      body: { pattern, script },
    },
  );
}

async function load_dns_routes() {
  const out = [];
  for (const z of zones) {
    if (ignored_domains.includes(z.name)) {
      continue;
    }
    const params = new URLSearchParams({
      per_page: 50,
      comment: "f101",
    });
    const { result } = await cfetch(
      `https://api.cloudflare.com/client/v4/zones/${z.id}/dns_records?${params}`,
    );
    out.push(result.map((data) => ({ ...data, zoneId: z.id })));
  }
  return out.flat();
}

async function load_worker_routes() {
  const out = [];
  for (const z of zones) {
    if (ignored_domains.includes(z.name)) {
      continue;
    }
    const { result } = await cfetch(
      `https://api.cloudflare.com/client/v4/zones/${z.id}/workers/routes`,
    );
    /*
  [{
    "id": "023e105f4ecef8ad9ca31a8372d0c353",
    "pattern": "example.net/*",
    "script": "this-is_my_script-01"
  }]
*/
    out.push(...result.map((record) => ({ ...record, zoneId: z.id })));
  }
  return out;
}

async function load_zones() {
  // TODO: pagination
  const params = new URLSearchParams({
    per_page: 50,
  });
  const url = `https://api.cloudflare.com/client/v4/zones?${params}`;
  const { result } = await cfetch(url);
  return result;
}

async function cfetch(url, data = {}) {
  if (process.env.VERBOSE) {
    const parsed = new URL(url);
    console.log(data.method || "GET", parsed.pathname);
  }
  if (process.env.DRY_RUN) {
    if (
      typeof data.method !== "undefined" &&
      data.method.toLowerCase() !== "get"
    ) {
      console.log("--");
      console.log(`${data.method || "GET"} ${url}`);
      if (data.body) console.log(JSON.stringify(data.body));
      if (data.msg) console.log(data.msg);
      return;
    }
  }
  /// authorized header
  const headers = new Headers();
  headers.append("authorization", `Bearer ${API_TOKEN}`);
  headers.append("content-type", `application/json`);
  const r = await fetch(url, {
    headers,
    ...data,
    ...(typeof data.body === "object"
      ? { body: JSON.stringify(data.body) }
      : {}),
  });
  if (!r.ok) {
    console.log("request errored ", url);
    console.log(data);
    console.log("-- response");
    console.log(await r.text());
    process.exit(1);
  }
  return r.json();
}

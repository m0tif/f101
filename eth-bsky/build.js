const esbuild = require("esbuild");
const path = require("path");
require("dotenv").config();

esbuild
  .build({
    entryPoints: [path.join(__dirname, "../webworker.mjs")],
    bundle: true,
    outfile: "dist/worker.mjs",
    format: "esm",
    define: {
      // DefinePlugin equivalents
      WORKER_DIR: JSON.stringify(__dirname),
      process: JSON.stringify({
        env: {
          RPC_URL: process.env.RPC_URL,
          WEBWORKER: true,
          SERVER_URL: "https://eth-bsky.app",
        },
      }),
      "global.Buffer": "Buffer",
    },
    alias: {
      entry_module: path.join(__dirname, "index.mjs"),
    },
    external: [
      "fs",
      "path",
      "stream",
      "crypto",
      "http",
      "https",
      "async_hooks",
      "os",
      "process",
      "util",
      "url",
      "querystring",
      "zlib",
      "string_decoder",
      "tls",
      "net",
      "assert",
    ],
    inject: ["./buffer-shim.js"],
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

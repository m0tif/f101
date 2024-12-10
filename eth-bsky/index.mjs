import { ethers } from "ethers";

const { RPC_URL, WEBWORKER, SERVER_URL } =
  typeof process === "object" ? process.env : CONFIG;
if (!RPC_URL) {
  throw new Error("RPC_URL env var is required");
}

const domains = [
  "eth-bsky.app",
  "eth.band",
  "eth.br.com",
  "eth.cn.com",
  "eth.co.bz",
  "eth.com.im",
  "eth.furniture",
  "eth.gr.com",
  "eth.hu.net",
  "eth.net.im",
  "eth.net.pe",
  "eth.net.ph",
  "eth.net.vc",
  "eth.org.im",
  "eth.org.mx",
  "eth.org.pe",
  "eth.org.ph",
  "eth.org.vc",
];

const state = {
  // map address strings to did strings
  ADDR_DID_MAP: {},
  LOCAL: !WEBWORKER,
  domains,
  load_ens_name,
  RPC_URL,
  URL: SERVER_URL || "http://localhost:3000",
  eth_rpc_req,
  chainId: eth_rpc_req("eth_chainId", []).then((v) => Number(v)),
  resolve_ens,
};

export default async (app) => {
  (
    await Promise.all([
      import("./src/index.mjs"),
      import("./src/get_did.mjs"),
      import("./src/set_did.mjs"),
      import("./src/resolve_ens.mjs"),
    ])
  ).map((v) => v.default(app, state));
};

function load_ens_name(req) {
  const url = new URL(
    state.LOCAL
      ? req.protocol + "://" + req.get("host") + req.originalUrl
      : req.url,
  );

  let ens_name;
  for (const d of domains) {
    if (url.hostname.indexOf(d) === -1) continue;
    const remaining = url.hostname.replace(d, "");
    if (/^[a-zA-Z0-9]+\.$/.test(remaining)) {
      ens_name = remaining + "eth";
      break;
    }
  }
  return ens_name;
}

async function eth_rpc_req(method, params) {
  const response = await fetch(RPC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Math.random().toString(),
      method,
      params,
    }),
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`RPC Error: ${data.error.message}`);
  }
  return data.result;
}

// ENS Registry Contract ABI (minimal for resolver lookup)
const ENS_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: "node",
        type: "bytes32",
      },
    ],
    name: "resolver",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    type: "function",
  },
];

// ENS Resolver ABI (minimal for address lookup)
const RESOLVER_ABI = [
  {
    constant: true,
    inputs: [
      {
        name: "node",
        type: "bytes32",
      },
    ],
    name: "addr",
    outputs: [
      {
        name: "",
        type: "address",
      },
    ],
    type: "function",
  },
];

async function resolve_ens(ens_name) {
  try {
    // ENS Registry Contract namehash method
    const blockNum = await eth_rpc_req("eth_blockNumber", []);
    const safeBlock = parseInt(blockNum, 16) - 20; // ~5 mins worth of blocks
    const safeBlockHex = "0x" + safeBlock.toString(16);
    console.log("safe block", safeBlockHex);

    // ENS Registry Contract Address on Mainnet
    const ENS_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

    // 1. Get the namehash of the ENS domain
    const node = ethers.namehash(ens_name);

    // 2. Get the resolver address from the ENS Registry
    const resolver_addr = await eth_rpc_req("eth_call", [
      {
        to: ENS_ADDRESS,
        data: `0x0178b8bf${node.slice(2)}`, // resolver(bytes32)
      },
      safeBlockHex,
    ]).catch((e) => null);

    if (resolver_addr === null || BigInt(resolver_addr) === 0n) {
      return { ens_name, resolved_addr: null, resolver_addr: null };
    }

    // 3. Get the address from the resolver
    const address = await eth_rpc_req("eth_call", [
      {
        to: `0x${resolver_addr.slice(2 + 24)}`,
        data: `0x3b3b57de${node.slice(2)}`, // addr(bytes32)
      },
      safeBlockHex,
    ]).catch((e) => console.log(e) || null);

    if (address === null) {
      return { ens_name, resolved_addr: null, resolver_addr };
    }

    // Clean up the address
    const resolved_addr = `0x${address.slice(-40)}`;

    return {
      ens_name,
      resolved_addr,
      resolver_addr,
    };
  } catch (error) {
    console.error("Error resolving ENS name:", error);
    throw error;
  }
}

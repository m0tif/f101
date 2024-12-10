import { recoverTypedSignature } from "@metamask/eth-sig-util";

const domain = {
  name: "ens zketh",
  version: "1",
  chainId: 1,
};

const types = {
  DID: [{ name: "identifier", type: "string" }],
};

export default (app, { kv_put }) => {
  app.get("/set_did", async (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    const { did, signature, ens_name } = req.query;
    const addr = recoverTypedSignature({
      data: {
        types,
        primaryType: "DID",
        domain,
        message: { identifier: did },
      },
      signature,
      version: "V4",
    });
    // update the address map
    await kv_put(req, "eth_bsky", addr, did);
    res.status(200).end();
  });
};

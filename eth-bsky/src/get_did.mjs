export default (app, { resolve_ens, load_ens_name, kv_get }) => {
  // Route handler for .well-known/atproto-did
  app.get("/.well-known/atproto-did", async (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    try {
      const ens_name = load_ens_name(req);
      // Return the extracted subdomain
      // load the ens address for the subdomain
      const ens_res = await resolve_ens(ens_name);
      const { resolved_addr } = ens_res;
      if (resolved_addr === null) {
        res.status(404).end(`no address found for ${ens_name}`);
        return;
      }
      // check a database mapping ens address to :did
      const did = await kv_get(req, "eth_bsky", resolved_addr);
      if (!did) {
        res.status(404).end(`no DID associated with address ${resolved_addr}`);
        return;
      }

      res.end(did);
    } catch (error) {
      console.error("Error processing request:", error);
      res.status(500).json({
        msg: "Internal server error",
        error: error.toString(),
      });
    }
  });
};

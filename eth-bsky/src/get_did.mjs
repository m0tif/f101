export default (app, { LOCAL, ADDR_DID_MAP, resolve_ens, load_ens_name }) => {
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
      let did;
      if (LOCAL) {
        did = ADDR_DID_MAP[resolved_addr];
      } else {
        const { eth_bsky } = req.env;
        did = await eth_bsky.get(resolved_addr);
      }
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

import { get_url } from "../common/get_url.mjs";

export default async (app) => {
  app.get("*", (req, res) => {
    const url = get_url(req);
    res.redirect(301, "https://forums.pse.dev" + url.pathname);
  });
};

export default async (app) => {
  app.get("*", (req, res) => {
    res.redirect(301, "https://forums.pse.dev" + req.url.pathname);
  });
};

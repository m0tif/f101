export default (app, state) => {
  app.get("/hello_world", (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("content-type", "text/html");
    res.json({ null: "hello, my server state is", state });
  });
};

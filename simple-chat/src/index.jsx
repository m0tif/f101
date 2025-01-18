import React from "react";
import Router from "../client/Router.jsx";
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";

export default (app) => {
  app.get("*", (req, res) => {
    const html = renderToString(
      React.createElement(() => (
        <StaticRouter location={req.mdn_url}>
          <Router />
        </StaticRouter>
      )),
    );
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("content-type", "text/html");
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script type="module" src="/public/bundle.js" defer></script>
        <title>Mote ai</title>
      </head>
      <body>
        <div id="root">${html}</div>
      </body>
    </html>
          `);
  });
};

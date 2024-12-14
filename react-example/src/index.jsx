import React from "react";
import App from "../client/App.jsx";
import { renderToString } from "react-dom/server";

export default (app) => {
  app.get("*", (req, res) => {
    const html = renderToString(React.createElement(App));
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("content-type", "text/html");
    res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>SSR React App</title>
      </head>
      <body>
        <div id="root">${html}</div>
      </body>
    </html>
          `);
  });
};

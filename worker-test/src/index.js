/// TODO: stick a react rendering system in here, try npmjs.com/uhtml
module.exports = (app) => {
  app.get("/", (req, res) => {
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("content-type", "text/html");
    res.end(`
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
  <p>Homepage</p>
</body>
</html>
`);
  });
};

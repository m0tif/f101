const path = require("path");
const express = require("express");

const input = process.argv[2];
const worker_dir = path.isAbsolute(input)
  ? input
  : path.join(__dirname, process.argv[2]);

require("dotenv").config({
  path: path.join(worker_dir, ".env"),
});

const port = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(worker_dir, "public")));

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

import(path.join(__dirname, "./f101_middleware.mjs"))
  .then(({ default: f101 }) => app.use("*", f101))
  .then(() => import(path.join(worker_dir, "index.mjs")))
  .then((v) => v.default(app));

const path = require("path");
const express = require("express");

const worker_dir = path.join(__dirname, process.argv[2]);
require("dotenv").config({
  path: path.join(worker_dir, ".env"),
});

const port = process.env.PORT || 3000;

const app = express();

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

require(path.join(worker_dir, "index.js"))(app);

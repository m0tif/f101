const webpack = require("webpack");
const path = require("path");

module.exports = {
  mode: "production",
  target: "webworker",
  entry: "../webworker.js",
  output: {
    filename: "worker.js",
    path: path.join(__dirname, "dist"),
  },
  plugins: [
    new webpack.DefinePlugin({
      WORKER_DIR: JSON.stringify(__dirname),
    }),
  ],
};

const esbuild = require("esbuild");
const path = require("path");

esbuild
  .build({
    entryPoints: [path.join(__dirname, "../webworker.mjs")],
    bundle: true,
    outfile: "dist/worker.mjs",
    format: "esm",
    alias: {
      entry_module: path.join(__dirname, "index.mjs"),
    },
    minify: true,
  })
  .catch(() => process.exit(1));

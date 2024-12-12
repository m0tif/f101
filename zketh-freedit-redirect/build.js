const esbuild = require("esbuild");
const path = require("path");

esbuild
  .build({
    entryPoints: [path.join(__dirname, "../webworker.mjs")],
    alias: {
      entry_module: path.join(__dirname, "index.mjs"),
    },
    bundle: true,
    outfile: "dist/worker.mjs",
    format: "esm",
    minify: true,
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

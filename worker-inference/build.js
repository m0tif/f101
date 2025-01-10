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
    define: {
      "process.env.WEBWORKER": "true",
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    },
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

const esbuild = require("esbuild");
const path = require("path");

// Main build configuration
esbuild
  .build({
    entryPoints: [path.join(__dirname, "../webworker.mjs")],
    alias: {
      entry_module: path.join(__dirname, "index.mjs"),
    },
    inject: ["polyfills.js"],
    bundle: true,
    outfile: "dist/worker.mjs",
    format: "esm",
    treeShaking: true,
    // minify: process.env.NODE_ENV === "production",
    loader: {
      ".jsx": "jsx",
      ".css": "css",
      ".svg": "file",
      ".png": "file",
      ".jpg": "file",
      ".gif": "file",
    },
    // external: ["react", "react-dom"],
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

esbuild
  .build({
    entryPoints: [path.join(__dirname, "./index.mjs")],
    bundle: true,
    outfile: "dist/node/index.mjs",
    format: "esm",
    sourcemap: true,
    loader: {
      ".jsx": "jsx",
      ".css": "css",
      ".svg": "file",
      ".png": "file",
      ".jpg": "file",
      ".gif": "file",
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    },
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

// Web bundle for browser
esbuild
  .build({
    entryPoints: [path.join(__dirname, "client/entrypoint.jsx")],
    bundle: true,
    outfile: path.join(__dirname, "public", "bundle.js"),
    format: "esm",
    sourcemap: true,
    loader: {
      ".jsx": "jsx",
      ".css": "css",
      ".svg": "file",
      ".png": "file",
      ".jpg": "file",
      ".gif": "file",
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(
        process.env.NODE_ENV || "development",
      ),
    },
    // Add React support
    jsxFactory: "React.createElement",
    jsxFragment: "React.Fragment",
  })
  .then(() => {
    console.log("Web bundle generated successfully in public folder");
  })
  .catch((e) => {
    console.error("Error generating web bundle:", e);
    process.exit(1);
  });

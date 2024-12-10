const state = {
  _phantom: { null: "global state" },
};

// receives an express-like app
export default async (app) => {
  // load relevant files
  (
    await Promise.all([
      import("./src/index.mjs"),
      import("./src/hello_world.mjs"),
    ])
  ).map((v) => v.default(app, state));
};

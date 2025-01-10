const state = {
  _phantom: { null: "global state" },
};

// receives an express-like app
export default async (app) => {
  // load relevant files
  (await Promise.all([import("./src/prompt.mjs")])).map((v) =>
    v.default(app, state),
  );
};

const state = {
  _phantom: { null: "global state" },
};

// receives an express-like app
module.exports = (app) => {
  // load relevant files
  require("./src/index")(app, state);
  require("./src/hello_world")(app, state);
};

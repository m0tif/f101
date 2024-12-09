const { router, handleRequest } = require("express-flare");

const app = router();

require(WORKER_DIR)(app);

addEventListener("fetch", (event, env) => {
  event.respondWith(
    handleRequest({
      event,
      env,
      router: app,
      // careful this will make pages not run js in the worker
      // cacheTime: 3600,
    }),
  );
});

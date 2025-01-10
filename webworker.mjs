import { handleRequest, router } from "express-flare";
import f101 from "./f101_middleware.mjs";

const app = router();
app.use(f101);

// aliased using esbuild
import entry from "entry_module";
const p = entry(app);

export default {
  async fetch(request, env, context) {
    try {
      await p;
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Max-Age": "86400",
          },
        });
      }

      return await handleRequest({
        request,
        env,
        context,
        router: app,
        cacheTime: 0,
      });
    } catch (e) {
      return new Response(e);
    }
  },
};

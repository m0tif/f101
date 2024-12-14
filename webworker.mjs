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

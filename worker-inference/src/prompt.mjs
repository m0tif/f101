export default (app, state) => {
  app.post("/prompt", async (req, res) => {
    const { env } = req;
    const { history, text, temperature, max_new_tokens } = req.bodyContent;
    res.setHeader("access-control-allow-origin", "*");
    res.setHeader("content-type", "text/html");
    const { response } = await env.AI.run("@cf/meta/llama-3.1-70b-instruct", {
      messages: [
        ...(history || []),
        {
          role: "user",
          content: text,
        },
      ],
      temperature:
        typeof temperature !== "undefined" ? Number(temperature) : undefined,
      max_tokens:
        typeof max_new_tokens !== "undefined"
          ? Number(max_new_tokens)
          : undefined,
      stream: false,
    });
    res.json({ text: response });
  });
};

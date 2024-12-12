export function get_url(req) {
  return new URL(
    process.env.WEBWORKER
      ? req.url
      : req.protocol + "://" + req.get("host") + req.originalUrl,
  );
}

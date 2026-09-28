// Railway Function (Bun): relay for Wowhead's model viewer files, adding CORS headers + in-memory cache.
const UPSTREAM = "https://wow.zamimg.com/modelviewer/classicplus/";
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
};
const cache = new Map<string, { body: ArrayBuffer; type: string; status: number }>();
const MAX_CACHE_BYTES = 400 * 1024 * 1024;
let cacheBytes = 0;

Bun.serve({
  port: Number(Bun.env.PORT ?? 3000),
  async fetch(req) {
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    if (req.method !== "GET" && req.method !== "HEAD") return new Response("method not allowed", { status: 405, headers: CORS });
    const url = new URL(req.url);
    if (url.pathname === "/healthz") return new Response("ok", { headers: CORS });
    const path = url.pathname.replace(/^\/+/, "");
    if (!path || path.includes("..")) return new Response("not found", { status: 404, headers: CORS });
    const key = path + url.search;

    let entry = cache.get(key);
    if (!entry) {
      const up = await fetch(UPSTREAM + key, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; HyjalFittingRoom/1.0)", "Referer": "https://www.wowhead.com/", "Accept": "*/*" },
      });
      const body = await up.arrayBuffer();
      entry = { body, type: up.headers.get("content-type") ?? "application/octet-stream", status: up.status };
      if (up.ok && body.byteLength < 50 * 1024 * 1024) {
        cache.set(key, entry); cacheBytes += body.byteLength;
        while (cacheBytes > MAX_CACHE_BYTES && cache.size) { const [k, v] = cache.entries().next().value; cache.delete(k); cacheBytes -= v.body.byteLength; }
      }
    }
    const h = new Headers(CORS);
    h.set("Content-Type", entry.type);
    h.set("Cache-Control", "public, max-age=86400");
    return new Response(req.method === "HEAD" ? null : entry.body, { status: entry.status, headers: h });
  },
});
console.log("hyjal relay listening on", Bun.env.PORT ?? 3000);

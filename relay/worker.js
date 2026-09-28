// Cloudflare Worker: relay for Wowhead's model viewer files, adding CORS headers and caching.
// Deploy at dash.cloudflare.com → Workers & Pages → Create → "Hello World" → paste this → Deploy.
// Then put the worker URL (e.g. https://hyjal-relay.<you>.workers.dev/) into RELAYS in index.html.

const UPSTREAM = 'https://wow.zamimg.com/modelviewer/classicplus/';
const ALLOWED_ORIGINS = [/\.github\.io$/, /^localhost$/, /^127\.0\.0\.1$/];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const cors = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Method not allowed', { status: 405, headers: cors });

    // Only relay files under the model viewer path; nothing else on Wowhead.
    const path = url.pathname.replace(/^\/+/, '');
    if (!path || path.includes('..')) return new Response('Not found', { status: 404, headers: cors });

    const upstream = UPSTREAM + path + url.search;
    const cacheKey = new Request(upstream, { method: 'GET' });
    const cache = caches.default;
    let res = await cache.match(cacheKey);
    if (!res) {
      const up = await fetch(upstream, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HyjalFittingRoom/1.0)',
          'Referer': 'https://www.wowhead.com/',
          'Accept': '*/*',
        },
        cf: { cacheTtl: 86400, cacheEverything: true },
      });
      res = new Response(up.body, up);
      res.headers.set('Cache-Control', 'public, max-age=86400');
      if (up.ok) ctx.waitUntil(cache.put(cacheKey, res.clone()));
    }
    res = new Response(res.body, res);
    for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
    res.headers.delete('set-cookie');
    return res;
  },
};

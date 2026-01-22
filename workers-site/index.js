/**
 * Cloudflare Worker - Static Site Handler for Vue/Ionic SPA
 * Serves files from the Wrangler [assets] binding with SPA fallback routing.
 */

function withSecurityHeaders(headers) {
  const h = new Headers(headers);
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('X-Frame-Options', 'DENY');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return h;
}

function isAssetPath(pathname) {
  return (
    pathname.startsWith('/assets/') ||
    /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map|json|wasm)$/i.test(pathname)
  );
}

/**
 * Handle all incoming requests
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Determine if this is index.html (should not be cached)
    const isIndexHtml = pathname === '/' || pathname === '/index.html';

    // First: try to serve as a real static asset
    let response = await env.ASSETS.fetch(request);

    // If found, return it (with headers/caching rules)
    if (response.status !== 404) {
      const headers = withSecurityHeaders(response.headers);

      if (isIndexHtml) {
        // Never cache index.html so new deployments update fast.
        headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
        headers.set('Pragma', 'no-cache');
        headers.set('Expires', '0');
        headers.set('Surrogate-Control', 'no-store');
        headers.set('ETag', `"${Date.now()}"`);
      }

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    // Not found: return 404 for missing assets (don’t SPA-fallback them)
    if (isAssetPath(pathname)) {
      return new Response(`Asset not found: ${pathname}`, {
        status: 404,
        headers: withSecurityHeaders({ 'Content-Type': 'text/plain' }),
      });
    }

    // SPA fallback: serve index.html for client-side routes
    const indexRequest = new Request(new URL('/index.html', request.url), request);
    response = await env.ASSETS.fetch(indexRequest);

    const headers = withSecurityHeaders(response.headers);
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('Surrogate-Control', 'no-store');
    headers.set('ETag', `"${Date.now()}"`);

    return new Response(response.body, {
      status: 200,
      headers,
    });
  },
};

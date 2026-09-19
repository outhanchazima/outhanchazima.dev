import { AngularAppEngine, createRequestHandler } from '@angular/ssr';
import { applySecurityHeaders } from './security-headers';

/**
 * Platform-neutral SSR entry for Cloudflare Workers.
 *
 * Built with `ssr.platform: "neutral"` (see the `workers` configuration in
 * angular.json) so the bundle stays off Node APIs. Cloudflare serves
 * prerendered HTML + hashed assets from Workers Assets first; this handler
 * is the SSR / 404 fallback.
 */
const angularApp = new AngularAppEngine({
  // localhost is safe: wrangler dev uses it, and Cloudflare will not present
  // `localhost` as the Host in production. Wildcards cover the
  // <worker>.<account>.workers.dev URL assigned on first deploy.
  allowedHosts: [
    'localhost',
    '127.0.0.1',
    'outhanchazima.dev',
    'www.outhanchazima.dev',
    '*.workers.dev',
  ],
});

async function handleRequest(request: Request): Promise<Response> {
  const { pathname } = new URL(request.url);
  if (pathname === '/healthz') {
    return applySecurityHeaders(
      new Response(JSON.stringify({ status: 'ok' }), {
        headers: { 'content-type': 'application/json; charset=utf-8' },
      }),
    );
  }

  const response = await angularApp.handle(request);
  return applySecurityHeaders(response ?? new Response('Page not found.', { status: 404 }));
}

/**
 * Request handler used by the Angular CLI (dev-server and during build)
 * and by Cloudflare Workers as `export default { fetch }`.
 */
export const reqHandler = createRequestHandler(handleRequest);

export default { fetch: reqHandler };

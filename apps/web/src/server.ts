import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

// Don't advertise the framework.
app.disable('x-powered-by');

/**
 * Content-Security-Policy scoped to the origins this site actually talks to:
 *  - 'unsafe-inline' (script + style) is required — Angular inlines critical CSS,
 *    a no-flash theme-bootstrap inline script, and SSR hydration markers.
 *  - app.cal.com           → booking embed (script + iframe + its API calls)
 *  - *.posthog.com / *.i.posthog.com → analytics script, asset CDN, ingest
 *  - api.web3forms.com     → contact-form submission (fetch)
 *  - fonts.googleapis.com / fonts.gstatic.com → web fonts
 * If something legitimate gets blocked, the browser console names the directive.
 */
const CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'self'",
  "form-action 'self' https://api.web3forms.com",
  "script-src 'self' 'unsafe-inline' https://app.cal.com https://*.posthog.com https://*.i.posthog.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: https:",
  "connect-src 'self' https://api.web3forms.com https://app.cal.com https://cal.com https://*.posthog.com https://*.i.posthog.com",
  "frame-src https://cal.com https://app.cal.com",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests',
].join('; ');

/** Security headers applied to every response (static assets + SSR). */
app.use((_req, res, next) => {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), browsing-topics=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
});

/**
 * Liveness/readiness probe. Defined before the Angular handler so it bypasses
 * SSR (and its host allow-list) — used by Docker and the Cloudflare tunnel.
 */
app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

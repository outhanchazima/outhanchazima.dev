/**
 * Security headers shared by the Node/Express server and the Cloudflare
 * Workers handler so the two deploy targets stay in lockstep.
 *
 * Content-Security-Policy is scoped to the origins this site talks to:
 *  - 'unsafe-inline' (script + style) is required — Angular inlines critical CSS,
 *    a no-flash theme-bootstrap inline script, and SSR hydration markers.
 *  - app.cal.com           → booking embed (script + iframe + its API calls)
 *  - *.posthog.com / *.i.posthog.com → analytics script, asset CDN, ingest
 *  - api.web3forms.com     → contact-form submission (fetch)
 *  - fonts.googleapis.com / fonts.gstatic.com → web fonts
 * If something legitimate gets blocked, the browser console names the directive.
 */
export const CSP = [
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

export const SECURITY_HEADERS: Readonly<Record<string, string>> = {
  'Content-Security-Policy': CSP,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

/** Apply the shared security headers to a Web-standard Response (Workers). */
export function applySecurityHeaders(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * PostHog configuration.
 *
 * The PostHog *project API key* (`phc_…`) is a PUBLIC key — it is designed to
 * ship in client-side code, so it is safe to commit. Grab yours from
 * PostHog → Settings → Project → "Project API Key" and paste it below.
 *
 * While the key is left as the placeholder, analytics stays fully disabled
 * (no script loads, no network calls), so local dev and SSR never error.
 *
 * Region: US Cloud. If you ever move to EU Cloud, swap the hosts to
 * `https://eu.i.posthog.com` / `https://eu.posthog.com`.
 */
export const ANALYTICS = {
  posthogKey: 'phc_qHH3Nt7JvBWUGb4HaDweVn7HayhnqfXWzpbBdPw6YqAj',
  posthogHost: 'https://us.i.posthog.com',
  posthogUiHost: 'https://us.posthog.com',
} as const;

/** True only once a real key has been filled in. */
export const ANALYTICS_ENABLED =
  ANALYTICS.posthogKey.startsWith('phc_') && !ANALYTICS.posthogKey.includes('REPLACE');

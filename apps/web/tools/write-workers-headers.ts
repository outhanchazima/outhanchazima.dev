import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SECURITY_HEADERS } from '../src/security-headers';

/**
 * Emit a Cloudflare Workers Assets `_headers` file next to the prerendered
 * browser build so static responses get the same security headers as SSR.
 * This file is not committed under public/ — Express would otherwise serve it.
 */
const browserDir = join(dirname(fileURLToPath(import.meta.url)), '../dist/workers/browser');
const dest = join(browserDir, '_headers');

const lines = [
  '/*',
  ...Object.entries(SECURITY_HEADERS).map(([name, value]) => `  ${name}: ${value}`),
  '',
  '/*.js',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
  '/*.css',
  '  Cache-Control: public, max-age=31536000, immutable',
  '',
  // Preview URLs on workers.dev should not be indexed alongside the apex.
  'https://:worker.:subdomain.workers.dev/*',
  '  X-Robots-Tag: noindex',
  '',
];

mkdirSync(browserDir, { recursive: true });
writeFileSync(dest, lines.join('\n'));
console.log(`Wrote ${dest}`);

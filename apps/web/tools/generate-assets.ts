/**
 * Generates raster assets (Open Graph image + apple-touch-icon) from inline SVG
 * using @resvg/resvg-js. Run with: `bun run tools/generate-assets.ts`.
 *
 * Kept as a build-time tool so the committed PNGs can always be regenerated
 * from source rather than being opaque binaries.
 */
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = join(import.meta.dir, '..', 'public');
mkdirSync(PUBLIC_DIR, { recursive: true });

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#060a14"/>
      <stop offset="1" stop-color="#0b1120"/>
    </linearGradient>
    <linearGradient id="mark" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d9488"/>
      <stop offset="1" stop-color="#2dd4bf"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.5" cy="0" r="0.8">
      <stop offset="0" stop-color="#2dd4bf" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#2dd4bf" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="#1e293b" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#grid)" opacity="0.5"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <g transform="translate(80, 90)">
    <rect width="96" height="96" rx="22" fill="url(#mark)"/>
    <text x="48" y="48" dy="0.34em" text-anchor="middle"
          font-family="sans-serif" font-size="46" font-weight="800" fill="#ffffff" letter-spacing="-1">OC</text>
  </g>

  <text x="80" y="320" font-family="sans-serif" font-size="74" font-weight="800" fill="#e8eef7">Outhan Chazima</text>
  <text x="82" y="392" font-family="sans-serif" font-size="40" font-weight="700" fill="#5eead4">Senior Software Engineer</text>
  <text x="82" y="448" font-family="monospace" font-size="26" fill="#94a3b8">System Design &amp; Architecture</text>

  <g font-family="monospace" font-size="22" fill="#94a3b8">
    <rect x="80" y="510" width="170" height="48" rx="10" fill="#111a2e" stroke="#1e293b"/>
    <text x="165" y="540" text-anchor="middle">Kafka</text>
    <rect x="266" y="510" width="180" height="48" rx="10" fill="#111a2e" stroke="#1e293b"/>
    <text x="356" y="540" text-anchor="middle">Kubernetes</text>
    <rect x="462" y="510" width="150" height="48" rx="10" fill="#111a2e" stroke="#1e293b"/>
    <text x="537" y="540" text-anchor="middle">Django</text>
    <rect x="628" y="510" width="150" height="48" rx="10" fill="#111a2e" stroke="#1e293b"/>
    <text x="703" y="540" text-anchor="middle">NestJS</text>
    <rect x="794" y="510" width="160" height="48" rx="10" fill="#111a2e" stroke="#1e293b"/>
    <text x="874" y="540" text-anchor="middle">Angular</text>
  </g>

  <text x="1120" y="565" text-anchor="end" font-family="monospace" font-size="26" fill="#2dd4bf">outhanchazima.dev</text>
</svg>`;

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0d9488"/>
      <stop offset="1" stop-color="#2dd4bf"/>
    </linearGradient>
  </defs>
  <rect width="180" height="180" rx="40" fill="url(#g)"/>
  <text x="90" y="90" dy="0.34em" text-anchor="middle" font-family="sans-serif"
        font-size="86" font-weight="800" fill="#ffffff" letter-spacing="-2">OC</text>
</svg>`;

function render(svg: string, width: number, out: string): void {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
  const png = resvg.render().asPng();
  const path = join(PUBLIC_DIR, out);
  writeFileSync(path, png);
  console.log(`✓ ${out} (${png.length} bytes)`);
}

render(ogSvg, 1200, 'og-image.png');
render(iconSvg, 180, 'apple-touch-icon.png');
render(iconSvg, 512, 'icon-512.png');
render(iconSvg, 192, 'icon-192.png');

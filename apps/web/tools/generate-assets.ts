/**
 * Generates raster assets (Open Graph image + icons) from inline SVG using
 * @resvg/resvg-js. Run with: `bun run tools/generate-assets.ts`.
 *
 * The artwork matches the site's "blueprint" theme: deep navy drafting sheet,
 * amber signal accent, cyan data-flow. Kept as a build-time tool so the PNGs
 * can always be regenerated from source.
 */
import { Resvg } from '@resvg/resvg-js';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const PUBLIC_DIR = join(import.meta.dir, '..', 'public');
mkdirSync(PUBLIC_DIR, { recursive: true });

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="g28" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M28 0H0V28" fill="none" stroke="#1a2546" stroke-width="1"/>
    </pattern>
    <pattern id="g140" width="140" height="140" patternUnits="userSpaceOnUse">
      <path d="M140 0H0V140" fill="none" stroke="#243156" stroke-width="1"/>
    </pattern>
    <radialGradient id="vig" cx="0.5" cy="0" r="0.9">
      <stop offset="0.3" stop-color="#0b1020" stop-opacity="0"/>
      <stop offset="1" stop-color="#070a16" stop-opacity="0.9"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="#0b1020"/>
  <rect width="1200" height="630" fill="url(#g28)"/>
  <rect width="1200" height="630" fill="url(#g140)"/>
  <rect width="1200" height="630" fill="url(#vig)"/>

  <!-- registration marks -->
  <path d="M48 48 H86 M48 48 V86" stroke="#243156" stroke-width="1.5"/>
  <path d="M1152 582 H1114 M1152 582 V544" stroke="#243156" stroke-width="1.5"/>

  <!-- schematic label -->
  <g transform="translate(80,150)">
    <rect width="26" height="2" y="9" fill="#ffb224"/>
    <text x="42" y="15" font-family="monospace" font-size="16" letter-spacing="3.5" fill="#ffb224">SYSTEMS ARCHITECT &amp; SOFTWARE ENGINEER · NAIROBI, KE</text>
  </g>

  <!-- headline (Fraunces not embedded in resvg → serif fallback) -->
  <text x="78" y="290" font-family="Georgia, serif" font-size="76" fill="#e9edf7">I design systems that <tspan font-style="italic" fill="#ffb224">scale</tspan></text>
  <text x="78" y="378" font-family="Georgia, serif" font-size="76" fill="#e9edf7">and architectures that <tspan font-style="italic" fill="#ffb224">last</tspan>.</text>

  <text x="80" y="452" font-family="monospace" font-size="22" fill="#8b97b8">System design &amp; architecture — resilient, distributed systems.</text>

  <!-- mini topology -->
  <g transform="translate(80,510)">
    <rect x="0" y="14" width="150" height="40" rx="4" fill="#0f1730" stroke="#5fd4d0"/>
    <text x="75" y="39" text-anchor="middle" font-family="monospace" font-size="12" letter-spacing="2" fill="#e9edf7">CLIENTS</text>
    <path d="M150 34 H210" stroke="#5fd4d0" stroke-width="1.5" stroke-dasharray="6 6"/>
    <rect x="210" y="14" width="170" height="40" rx="4" fill="#0f1730" stroke="#ffb224"/>
    <text x="295" y="39" text-anchor="middle" font-family="monospace" font-size="12" letter-spacing="2" fill="#ffb224">API GATEWAY</text>
    <path d="M380 34 H440" stroke="#5fd4d0" stroke-width="1.5" stroke-dasharray="6 6"/>
    <rect x="440" y="14" width="170" height="40" rx="4" fill="#0f1730" stroke="#5fd4d0"/>
    <text x="525" y="39" text-anchor="middle" font-family="monospace" font-size="12" letter-spacing="2" fill="#e9edf7">SERVICES</text>
  </g>

  <text x="1120" y="548" text-anchor="end" font-family="monospace" font-size="22" letter-spacing="2" fill="#ffb224">outhanchazima.dev</text>
</svg>`;

const iconSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#0b1020"/>
  <rect x="40" y="40" width="432" height="432" rx="68" fill="none" stroke="#243156" stroke-width="3"/>
  <circle cx="256" cy="170" r="34" fill="#ffb224"/>
  <text x="256" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="150" font-weight="600" fill="#e9edf7" letter-spacing="-4">OC</text>
</svg>`;

function render(svg: string, width: number, out: string): void {
  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width } });
  const png = resvg.render().asPng();
  writeFileSync(join(PUBLIC_DIR, out), png);
  console.log(`✓ ${out} (${png.length} bytes)`);
}

render(ogSvg, 1200, 'og-image.png');
render(iconSvg, 180, 'apple-touch-icon.png');
render(iconSvg, 512, 'icon-512.png');
render(iconSvg, 192, 'icon-192.png');

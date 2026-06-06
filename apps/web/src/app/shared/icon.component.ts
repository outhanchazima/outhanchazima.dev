import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export type IconName =
  | 'github'
  | 'linkedin'
  | 'email'
  | 'phone'
  | 'location'
  | 'resume'
  | 'sun'
  | 'moon'
  | 'arrow-right'
  | 'arrow-up'
  | 'external'
  | 'architecture'
  | 'code'
  | 'server'
  | 'layout'
  | 'database'
  | 'cloud'
  | 'check'
  | 'menu'
  | 'close'
  | 'spark';

/**
 * Lightweight inline-SVG icon set. Renders the full <svg> markup so the HTML
 * parser places children in the correct SVG namespace. Markup is static and
 * trusted, so we bypass sanitisation to preserve stroke attributes.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="inline-flex" [innerHTML]="svg()"></span>`,
  host: { class: 'inline-flex items-center justify-center' },
})
export class IconComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly filled = input(false);

  protected readonly svg = computed<SafeHtml>(() => {
    const size = this.size();
    const fill = this.filled() ? 'currentColor' : 'none';
    const inner = PATHS[this.name()] ?? '';
    const markup =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
      `viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="1.8" ` +
      `stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${inner}</svg>`;
    return this.sanitizer.bypassSecurityTrustHtml(markup);
  });
}

/* Raw SVG inner markup keyed by icon name. */
const PATHS: Record<IconName, string> = {
  github:
    '<path d="M12 2A10 10 0 0 0 8.84 21.5c.5.08.66-.22.66-.48v-1.7C6.73 19.91 6.14 18 6.14 18a2.27 2.27 0 0 0-.95-1.25c-.78-.53.06-.52.06-.52a1.8 1.8 0 0 1 1.31.88 1.82 1.82 0 0 0 2.5.71 1.82 1.82 0 0 1 .54-1.14c-2.18-.25-4.47-1.09-4.47-4.85a3.8 3.8 0 0 1 1-2.64 3.54 3.54 0 0 1 .1-2.6s.83-.27 2.72 1a9.34 9.34 0 0 1 4.94 0c1.89-1.27 2.72-1 2.72-1a3.54 3.54 0 0 1 .1 2.6 3.8 3.8 0 0 1 1 2.64c0 3.77-2.3 4.6-4.49 4.84a2.04 2.04 0 0 1 .58 1.59v2.36c0 .26.16.57.67.48A10 10 0 0 0 12 2Z"/>',
  linkedin:
    '<rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/><path d="M10 9h3.8v1.7h.06A4.16 4.16 0 0 1 17.6 8.4c4 0 4.4 2.4 4.4 5.6V21h-4v-5.5c0-1.3 0-3-1.9-3s-2.1 1.4-2.1 2.9V21h-4Z"/>',
  email:
    '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  phone:
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>',
  location:
    '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
  resume:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h8M8 9h2"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>',
  'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>',
  'arrow-up': '<path d="M12 19V5M6 11l6-6 6 6"/>',
  external:
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>',
  architecture:
    '<path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/><path d="M9 11h.01M15 11h.01"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6M14 4l-4 16"/>',
  server:
    '<rect x="2" y="3" width="20" height="8" rx="2"/><rect x="2" y="13" width="20" height="8" rx="2"/><path d="M6 7h.01M6 17h.01"/>',
  layout: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 5v14c0 1.66-4 3-9 3s-9-1.34-9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/>',
  cloud: '<path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6 6 0 1 0 6 16"/><path d="M8 17v4M12 19v3M16 18v4"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>',
};

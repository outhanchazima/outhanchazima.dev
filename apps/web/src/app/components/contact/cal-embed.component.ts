import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type EmbedSnippet from '@calcom/embed-snippet';
import { ThemeService } from '../../core/services/theme.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { CONTACT } from '../../core/config/contact.config';

type CalApi = ReturnType<typeof EmbedSnippet>;

/** `https://cal.com/<link>` → `<link>` (the calLink the embed expects). */
function deriveCalLink(url: string): string {
  return url
    .trim()
    .replace(/^https?:\/\/(www\.)?cal\.com\//i, '')
    .replace(/\/+$/, '');
}

/**
 * Inline Cal.com booking calendar — the same integration style as the reference
 * site: an embedded month-view calendar themed to match the page, branding
 * hidden. Loads the embed only in the browser (dynamic import, SSR-safe) and
 * reports successful bookings to analytics.
 */
@Component({
  selector: 'app-cal-embed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (calLink) {
      <div #host class="cal-embed"></div>
    }
  `,
})
export class CalEmbedComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly theme = inject(ThemeService);
  private readonly analytics = inject(AnalyticsService);
  private readonly host = viewChild<ElementRef<HTMLElement>>('host');
  private cal?: CalApi;

  protected readonly calLink = deriveCalLink(CONTACT.bookingUrl);

  constructor() {
    afterNextRender(() => {
      if (isPlatformBrowser(this.platformId) && this.calLink) {
        void this.init();
      }
    });
    // Keep the embed's theme in sync with the site's light/dark toggle.
    effect(() => {
      const dark = this.theme.isDark();
      this.cal?.('ui', { theme: dark ? 'dark' : 'light' });
    });
  }

  private async init(): Promise<void> {
    const el = this.host()?.nativeElement;
    if (!el) {
      return;
    }
    const { default: EmbedSnippetFn } = await import('@calcom/embed-snippet');
    const cal = EmbedSnippetFn();
    this.cal = cal;

    cal('inline', {
      elementOrSelector: el,
      calLink: this.calLink,
      config: { layout: 'month_view' },
    });
    cal('ui', {
      theme: this.theme.isDark() ? 'dark' : 'light',
      layout: 'month_view',
      hideEventTypeDetails: false,
    });
    cal('on', {
      action: 'bookingSuccessful',
      callback: () => this.analytics.capture('booking_completed'),
    });
  }
}

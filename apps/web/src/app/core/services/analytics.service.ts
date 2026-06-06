import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { PostHog } from 'posthog-js';
import { ANALYTICS, ANALYTICS_ENABLED } from '../config/analytics.config';

type Consent = 'granted' | 'denied';
const CONSENT_KEY = 'analytics_consent';

/**
 * SSR-safe wrapper around PostHog. `posthog-js` is loaded via dynamic import so
 * it never touches the server bundle and only downloads in the browser *after*
 * the visitor opts in. Captures pageviews, autocapture clicks, Core Web Vitals
 * and masked session replays; `capture()` records explicit conversion events.
 */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private posthog?: PostHog;
  private starting = false;

  /** `null` = visitor hasn't chosen yet (show the banner). */
  readonly consent = signal<Consent | null>(null);

  /** Call once in the browser after the app has mounted. */
  bootstrap(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const stored = this.read();
    this.consent.set(stored);
    if (stored === 'granted') {
      void this.init();
    }
  }

  /** Visitor accepted analytics. */
  grant(): void {
    this.write('granted');
    this.consent.set('granted');
    void this.init();
  }

  /** Visitor declined — never initialise, and opt out if somehow already on. */
  deny(): void {
    this.write('denied');
    this.consent.set('denied');
    this.posthog?.opt_out_capturing();
  }

  /** Record an explicit event (no-op until consent + a real key are present). */
  capture(event: string, properties?: Record<string, unknown>): void {
    this.posthog?.capture(event, properties);
  }

  private async init(): Promise<void> {
    if (this.posthog || this.starting || !ANALYTICS_ENABLED || !isPlatformBrowser(this.platformId)) {
      return;
    }
    this.starting = true;
    const { default: posthog } = await import('posthog-js');
    posthog.init(ANALYTICS.posthogKey, {
      api_host: ANALYTICS.posthogHost,
      ui_host: ANALYTICS.posthogUiHost,
      person_profiles: 'identified_only',
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      // Core Web Vitals (LCP, CLS, INP, …)
      capture_performance: { web_vitals: true },
      // Session replay with privacy-preserving masking
      session_recording: { maskAllInputs: true },
    });
    posthog.opt_in_capturing();
    this.posthog = posthog;
  }

  private read(): Consent | null {
    try {
      const v = this.document.defaultView?.localStorage.getItem(CONSENT_KEY);
      return v === 'granted' || v === 'denied' ? v : null;
    } catch {
      return null;
    }
  }

  private write(value: Consent): void {
    try {
      this.document.defaultView?.localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* storage blocked — choice simply won't persist */
    }
  }
}

import { DOCUMENT, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Sections to scroll-spy, in document order. `top` is the hero. */
const SECTION_IDS = [
  'top',
  'expertise',
  'skills',
  'work',
  'experience',
  'principles',
  'writing',
  'credentials',
  'contact',
] as const;

/**
 * Tracks scroll progress (0–100) and the currently in-view section, powering
 * the scroll-spy nav, the progress bar and the HUD readout. Browser-only — on
 * the server the signals keep their defaults, so SSR output is stable.
 */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private observer?: IntersectionObserver;
  private started = false;

  readonly progress = signal(0);
  readonly activeId = signal<string>('top');

  /** Call once after the full view (all sections) is in the DOM. */
  init(): void {
    if (this.started || !isPlatformBrowser(this.platformId)) {
      return;
    }
    this.started = true;

    const win = this.document.defaultView!;
    let ticking = false;
    const update = () => {
      const el = this.document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      this.progress.set(max > 0 ? Math.min(100, Math.round((el.scrollTop / max) * 100)) : 0);
      ticking = false;
    };
    win.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          win.requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
    update();

    this.initParallax(win);

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    // Active-section detection: a band across the middle of the viewport.
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            this.activeId.set(entry.target.id);
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    for (const id of SECTION_IDS) {
      const node = this.document.getElementById(id);
      if (node) {
        this.observer.observe(node);
      }
    }
  }

  /** Subtle cursor-parallax on the blueprint grid via CSS variables. */
  private initParallax(win: Window): void {
    if (win.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const root = this.document.documentElement;
    let ticking = false;
    win.addEventListener(
      'pointermove',
      (event) => {
        if (ticking) {
          return;
        }
        ticking = true;
        win.requestAnimationFrame(() => {
          const dx = (event.clientX / win.innerWidth - 0.5) * -16;
          const dy = (event.clientY / win.innerHeight - 0.5) * -16;
          root.style.setProperty('--gx', `${dx.toFixed(1)}px`);
          root.style.setProperty('--gy', `${dy.toFixed(1)}px`);
          ticking = false;
        });
      },
      { passive: true },
    );
  }
}

import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  inject,
  input,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Animates the leading number of a stat (e.g. "100M+", "6+", "100%") from zero
 * when it scrolls into view, preserving any suffix. SSR renders the final value
 * (bound in the template), so this only enhances in the browser and is disabled
 * under prefers-reduced-motion.
 */
@Directive({
  selector: '[appCountUp]',
})
export class CountUpDirective implements AfterViewInit, OnDestroy {
  /** The final display value, e.g. "100M+". */
  readonly appCountUp = input.required<string>();

  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly platformId = inject(PLATFORM_ID);
  private observer?: IntersectionObserver;
  private frame?: number;

  ngAfterViewInit(): void {
    const target = this.appCountUp();
    if (!isPlatformBrowser(this.platformId) || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const match = /^([\d.]+)(.*)$/.exec(target);
    if (reduced || !match) {
      return; // leave the SSR-rendered final value untouched
    }

    const end = parseFloat(match[1]);
    const suffix = match[2];
    const decimals = match[1].includes('.') ? match[1].split('.')[1].length : 0;
    const node = this.el.nativeElement;

    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.observer?.disconnect();
          node.textContent = `0${suffix}`;
          this.animate(end, suffix, decimals, node);
        }
      },
      { threshold: 0.4 },
    );
    this.observer.observe(node);
  }

  private animate(end: number, suffix: string, decimals: number, node: HTMLElement): void {
    const duration = 1100;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      node.textContent = (end * eased).toFixed(decimals) + suffix;
      if (t < 1) {
        this.frame = requestAnimationFrame(step);
      } else {
        node.textContent = end.toFixed(decimals) + suffix;
      }
    };
    this.frame = requestAnimationFrame(step);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    if (this.frame) {
      cancelAnimationFrame(this.frame);
    }
  }
}

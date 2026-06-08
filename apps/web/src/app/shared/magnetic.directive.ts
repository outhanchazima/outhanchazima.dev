import {
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  inject,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Subtle "magnetic" hover — the element drifts toward the cursor while hovered
 * and springs back on leave. Browser-only, skipped on touch and under
 * prefers-reduced-motion. Listeners run outside Angular's zone.
 */
@Directive({
  selector: '[appMagnetic]',
  host: { class: 'is-magnetic' },
})
export class MagneticDirective {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const platformId = inject(PLATFORM_ID);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!isPlatformBrowser(platformId)) return;
      if (matchMedia('(pointer: coarse)').matches) return;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const strength = 0.4;
      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${dx * strength}px, ${dy * strength}px)`;
      };
      const reset = () => {
        el.style.transform = '';
      };
      zone.runOutsideAngular(() => {
        el.addEventListener('pointermove', onMove, { passive: true });
        el.addEventListener('pointerleave', reset);
      });
      destroyRef.onDestroy(() => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', reset);
      });
    });
  }
}

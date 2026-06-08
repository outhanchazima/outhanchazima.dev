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
 * Cursor-tracking "spotlight" glow. Updates `--mx` / `--my` CSS variables to the
 * pointer position over the host so a CSS radial highlight can follow the cursor
 * (see `.has-spotlight::after` in styles.scss). Listeners run outside Angular's
 * zone (no change detection), browser-only, and are skipped on touch devices.
 */
@Directive({
  selector: '[appSpotlight]',
  host: { class: 'has-spotlight' },
})
export class SpotlightDirective {
  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const zone = inject(NgZone);
    const platformId = inject(PLATFORM_ID);
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (!isPlatformBrowser(platformId) || matchMedia('(pointer: coarse)').matches) return;

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      };
      zone.runOutsideAngular(() => el.addEventListener('pointermove', onMove, { passive: true }));
      destroyRef.onDestroy(() => el.removeEventListener('pointermove', onMove));
    });
  }
}

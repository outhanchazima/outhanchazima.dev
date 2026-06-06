import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ViewportService } from '../../core/services/viewport.service';

const LABELS: Record<string, string> = {
  top: 'INDEX',
  expertise: 'SYSTEMS',
  skills: 'STACK',
  work: 'DEPLOYMENTS',
  experience: 'BUILD LOG',
  principles: 'PHILOSOPHY',
  writing: 'OUTPUT',
  credentials: 'CREDENTIALS',
  contact: 'CONTACT',
};

/**
 * Decorative "instrument" chrome that reinforces the blueprint/CAD theme:
 * fixed corner registration marks framing the viewport, plus a live HUD
 * readout of the current section and scroll progress. Purely presentational
 * (aria-hidden) and hidden on small screens.
 */
@Component({
  selector: 'app-hud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="frame" aria-hidden="true">
      <span class="fc tl"></span>
      <span class="fc tr"></span>
      <span class="fc bl"></span>
      <span class="fc br"></span>
    </div>

    <div class="hud" aria-hidden="true">
      <span class="hud-loc">LOC // {{ label() }}</span>
      <span class="hud-bar"><i [style.width.%]="viewport.progress()"></i></span>
      <span class="hud-pct">{{ viewport.progress() }}%</span>
    </div>
  `,
})
export class HudComponent {
  protected readonly viewport = inject(ViewportService);
  protected readonly label = computed(() => LABELS[this.viewport.activeId()] ?? 'INDEX');
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { CountUpDirective } from '../../shared/count-up.directive';

@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, CountUpDirective],
  template: `
    <section class="metrics" aria-label="Production track record">
      <div class="wrap metrics-grid">
        @for (stat of stats; track stat.label) {
          <div class="metric" appReveal>
            <div class="v" [appCountUp]="stat.value">{{ stat.value }}</div>
            <div class="l">{{ stat.label }}</div>
            <div class="d">{{ stat.detail }}</div>
          </div>
        }
      </div>
    </section>
  `,
})
export class StatsComponent {
  protected readonly stats = PORTFOLIO.stats;
}

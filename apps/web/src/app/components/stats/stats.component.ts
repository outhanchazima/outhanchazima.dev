import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section class="border-y border-border bg-surface/50">
      <div class="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-4 sm:px-6 lg:grid-cols-4">
        @for (stat of stats; track stat.label) {
          <div appReveal class="px-4 py-8 text-center sm:px-6">
            <div class="text-3xl font-extrabold tracking-tight text-accent-ink sm:text-4xl">
              {{ stat.value }}
            </div>
            <div class="mt-1 text-sm font-semibold text-ink">{{ stat.label }}</div>
            <div class="mt-1 text-xs leading-snug text-faint">{{ stat.detail }}</div>
          </div>
        }
      </div>
    </section>
  `,
})
export class StatsComponent {
  protected readonly stats = PORTFOLIO.stats;
}

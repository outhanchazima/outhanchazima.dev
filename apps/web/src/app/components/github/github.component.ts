import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { GithubService } from '../../core/services/github.service';
import { RevealDirective } from '../../shared/reveal.directive';

interface Metric {
  value: string;
  label: string;
}

function compact(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : `${n}`;
}

/**
 * Live GitHub stat band. Numbers are fetched during SSR (transferred to the
 * client), falling back to static figures if the API is unavailable.
 */
@Component({
  selector: 'app-github',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <aside class="metrics gh" aria-label="Live GitHub statistics" appReveal>
      <div class="wrap gh-cap"><span class="tag">Live · github.com/outhanchazima</span></div>
      <div class="metrics-grid">
        @for (m of metrics(); track m.label) {
          <div class="metric">
            <div class="v">{{ m.value }}</div>
            <div class="l">{{ m.label }}</div>
          </div>
        }
      </div>
    </aside>
  `,
})
export class GithubComponent {
  private readonly github = inject(GithubService);
  private readonly stats = toSignal(this.github.load(), { initialValue: null });

  protected readonly metrics = computed<Metric[]>(() => {
    const s = this.stats();
    return [
      { value: s ? `${s.repos}` : '145+', label: 'Public repos' },
      { value: s ? compact(s.stars) : '—', label: 'Stars earned' },
      { value: s ? `${s.followers}` : '—', label: 'Followers' },
      { value: s ? s.topLanguage : 'Python', label: 'Top language' },
    ];
  });
}

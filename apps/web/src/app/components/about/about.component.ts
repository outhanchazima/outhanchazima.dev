import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="about" class="scroll-mt-20 py-20 sm:py-28">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div class="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div appReveal>
            <p class="font-mono text-sm font-medium text-accent-ink">01 / About</p>
            <h2 class="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Engineering for scale &amp; reliability
            </h2>
          </div>
          <div appReveal class="space-y-5 text-base leading-relaxed text-muted sm:text-lg">
            @for (paragraph of summary; track $index) {
              <p>{{ paragraph }}</p>
            }
            <div class="flex flex-wrap gap-3 pt-2">
              @for (cert of certifications; track cert.title) {
                <div class="rounded-lg border border-border bg-surface px-4 py-3">
                  <div class="text-sm font-semibold text-ink">{{ cert.title }}</div>
                  <div class="text-xs text-faint">{{ cert.issuer }} · {{ cert.year }}</div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class AboutComponent {
  protected readonly summary = PORTFOLIO.profile.summary;
  protected readonly certifications = PORTFOLIO.certifications;
}

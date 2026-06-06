import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, IconComponent],
  template: `
    <section id="experience" class="scroll-mt-20 py-20 sm:py-28">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div appReveal class="max-w-2xl">
          <p class="font-mono text-sm font-medium text-accent-ink">03 / Experience</p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Where I've shipped
          </h2>
        </div>

        <ol class="mt-12 space-y-4">
          @for (role of experience; track role.company) {
            <li
              appReveal
              class="relative rounded-card border border-border bg-surface p-6 sm:p-8"
            >
              <div class="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
                <div>
                  <h3 class="text-lg font-bold text-ink">{{ role.role }}</h3>
                  <p class="font-medium text-accent-ink">{{ role.company }}</p>
                </div>
                <div class="text-right">
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-xs text-muted"
                  >
                    @if (role.current) {
                      <span class="h-1.5 w-1.5 rounded-full bg-accent"></span>
                    }
                    {{ role.period }}
                  </span>
                  <p class="mt-1 text-xs text-faint">{{ role.location }}</p>
                </div>
              </div>

              <p class="mt-4 text-muted">{{ role.summary }}</p>

              <ul class="mt-4 space-y-2.5">
                @for (highlight of role.highlights; track $index) {
                  <li class="flex gap-3 text-sm leading-relaxed text-muted">
                    <span class="mt-0.5 shrink-0 text-accent-ink">
                      <app-icon name="check" [size]="16" />
                    </span>
                    <span>{{ highlight }}</span>
                  </li>
                }
              </ul>

              <ul class="mt-5 flex flex-wrap gap-2">
                @for (tech of role.stack; track tech) {
                  <li class="rounded-md bg-surface-2 px-2.5 py-1 font-mono text-xs text-muted">
                    {{ tech }}
                  </li>
                }
              </ul>
            </li>
          }
        </ol>
      </div>
    </section>
  `,
})
export class ExperienceComponent {
  protected readonly experience = PORTFOLIO.experience;
}

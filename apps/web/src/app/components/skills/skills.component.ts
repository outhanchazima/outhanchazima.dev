import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { IconComponent, IconName } from '../../shared/icon.component';

@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, IconComponent],
  template: `
    <section id="skills" class="scroll-mt-20 border-t border-border bg-surface/40 py-20 sm:py-28">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div appReveal class="max-w-2xl">
          <p class="font-mono text-sm font-medium text-accent-ink">02 / Skills</p>
          <h2 class="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            The stack I build production systems with
          </h2>
          <p class="mt-4 text-muted">
            From event-driven architecture down to the infrastructure that runs it.
          </p>
        </div>

        <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          @for (group of groups; track group.title) {
            <div
              appReveal
              class="rounded-card border border-border bg-surface p-6 transition-colors hover:border-accent/60"
            >
              <div class="flex items-center gap-3">
                <span class="grid h-10 w-10 place-items-center rounded-lg bg-accent-soft text-accent-ink">
                  <app-icon [name]="iconFor(group.icon)" [size]="20" />
                </span>
                <h3 class="font-semibold text-ink">{{ group.title }}</h3>
              </div>
              <ul class="mt-4 flex flex-wrap gap-2">
                @for (skill of group.skills; track skill) {
                  <li
                    class="rounded-md border border-border bg-surface-2 px-2.5 py-1 text-sm text-muted"
                  >
                    {{ skill }}
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class SkillsComponent {
  protected readonly groups = PORTFOLIO.skillGroups;

  protected iconFor(icon: string): IconName {
    return icon as IconName;
  }
}

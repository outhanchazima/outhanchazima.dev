import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, IconComponent],
  template: `
    <section id="work" class="scroll-mt-20 border-t border-border bg-surface/40 py-20 sm:py-28">
      <div class="mx-auto max-w-6xl px-4 sm:px-6">
        <div appReveal class="flex flex-wrap items-end justify-between gap-4">
          <div class="max-w-2xl">
            <p class="font-mono text-sm font-medium text-accent-ink">04 / Selected work</p>
            <h2 class="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Systems running in production
            </h2>
            <p class="mt-4 text-muted">
              Payment rails, real-time analytics and platforms moving millions in transactions.
            </p>
          </div>
          <button
            type="button"
            (click)="showAll.set(!showAll())"
            class="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent"
          >
            {{ showAll() ? 'Show featured' : 'Show all projects' }}
          </button>
        </div>

        <div class="mt-12 grid gap-6 md:grid-cols-2">
          @for (project of visible(); track project.name) {
            <article
              appReveal
              class="group flex flex-col rounded-card border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:border-accent/60 hover:shadow-lg hover:shadow-black/5 sm:p-8"
            >
              <div class="flex items-center justify-between">
                <span
                  class="rounded-full bg-accent-soft px-3 py-1 font-mono text-xs font-medium text-accent-ink"
                >
                  {{ project.tag }}
                </span>
                @if (project.repo) {
                  <a
                    [href]="project.repo"
                    target="_blank"
                    rel="noopener noreferrer"
                    [attr.aria-label]="'View ' + project.name + ' on GitHub'"
                    class="text-faint transition-colors hover:text-accent-ink"
                  >
                    <app-icon name="external" [size]="18" />
                  </a>
                }
              </div>

              <h3 class="mt-4 text-xl font-bold text-ink">{{ project.name }}</h3>
              <p class="font-mono text-xs text-faint">{{ project.context }}</p>
              <p class="mt-3 flex-1 text-sm leading-relaxed text-muted">{{ project.description }}</p>

              <ul class="mt-5 space-y-2">
                @for (item of project.impact; track item) {
                  <li class="flex items-center gap-2 text-sm font-medium text-ink">
                    <span class="text-accent-ink"><app-icon name="spark" [size]="15" /></span>
                    {{ item }}
                  </li>
                }
              </ul>

              <ul class="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
                @for (tech of project.stack; track tech) {
                  <li class="rounded-md bg-surface-2 px-2.5 py-1 font-mono text-xs text-muted">
                    {{ tech }}
                  </li>
                }
              </ul>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class ProjectsComponent {
  private readonly projects = PORTFOLIO.projects;
  protected readonly showAll = signal(false);

  protected readonly visible = computed(() =>
    this.showAll() ? this.projects : this.projects.filter((p) => p.featured),
  );
}

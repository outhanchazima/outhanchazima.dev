import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-projects',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="work" class="section">
      <div class="wrap">
        <div class="sec-head" appReveal>
          <div><span class="tag">Selected work</span><h2>Deployments</h2></div>
          <span class="sec-num">SEC.03 / DEPLOYMENTS</span>
        </div>

        <div class="work">
          @for (project of visible(); track project.name) {
            <article class="work-card" appReveal>
              <div class="work-top">
                <span class="work-tag">{{ project.tag }}</span>
                @if (project.repo) {
                  <a
                    class="work-ext"
                    [href]="project.repo"
                    target="_blank"
                    rel="noopener noreferrer"
                    [attr.aria-label]="'View ' + project.name + ' on GitHub'"
                    >↗</a
                  >
                }
              </div>
              <h3>{{ project.name }}</h3>
              <div class="work-ctx">{{ project.context }}</div>
              <p>{{ project.description }}</p>
              <ul class="work-impact">
                @for (item of project.impact; track item) {
                  <li>{{ item }}</li>
                }
              </ul>
              <div class="chips">
                @for (tech of project.stack; track tech) {
                  <span class="chip">{{ tech }}</span>
                }
              </div>
            </article>
          }
        </div>

        <div style="margin-top:28px;text-align:center">
          <button type="button" class="toggle-btn" (click)="showAll.set(!showAll())">
            {{ showAll() ? '— Show featured only' : '+ Show all projects' }}
          </button>
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

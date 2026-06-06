import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="skills" class="section">
      <div class="wrap">
        <div class="sec-head" appReveal>
          <div><span class="tag">Tools of the trade</span><h2>Stack</h2></div>
          <span class="sec-num">SEC.02 / STACK</span>
        </div>
        <div class="stack">
          @for (group of groups; track group.id) {
            <div class="stack-card" appReveal>
              <span class="stack-id">{{ group.id }}</span>
              <h3>{{ group.title }}</h3>
              <div class="chips">
                @for (skill of group.skills; track skill) {
                  <span class="chip">{{ skill }}</span>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class SkillsComponent {
  protected readonly groups = PORTFOLIO.skillGroups;
}

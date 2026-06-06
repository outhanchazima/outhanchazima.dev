import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { EchoTitleDirective } from '../../shared/echo-title.directive';

@Component({
  selector: 'app-experience',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, EchoTitleDirective],
  template: `
    <section id="experience" class="section">
      <div class="wrap">
        <div class="sec-head" appReveal>
          <div><span class="tag">Where I've built</span><h2 echo>Build log</h2></div>
          <span class="sec-num">SEC.02 / EXPERIENCE</span>
        </div>

        <div class="pipeline">
          @for (job of experience; track job.company) {
            <article class="job" appReveal>
              <div class="job-top">
                <div>
                  <h3>{{ job.role }}</h3>
                  <div class="co">{{ job.company }}</div>
                </div>
                <span class="when">{{ job.when }}</span>
              </div>
              <p>{{ job.summary }}</p>
              @if (job.highlights.length) {
                <ul>
                  @for (highlight of job.highlights; track $index) {
                    <li>{{ highlight }}</li>
                  }
                </ul>
              }
              @if (job.chips.length) {
                <div class="chips">
                  @for (chip of job.chips; track chip) {
                    <span class="chip">{{ chip }}</span>
                  }
                </div>
              }
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class ExperienceComponent {
  protected readonly experience = PORTFOLIO.experience;
}

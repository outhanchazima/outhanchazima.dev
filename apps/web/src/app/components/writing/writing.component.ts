import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';

@Component({
  selector: 'app-writing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="writing" class="section">
      <div class="wrap">
        <div class="sec-head" appReveal>
          <div><span class="tag">Knowledge sharing</span><h2>Writing &amp; notes</h2></div>
          <span class="sec-num">SEC.04 / OUTPUT</span>
        </div>
        <div class="posts">
          @for (post of writing; track post.ref) {
            <a class="post" appReveal [href]="post.url" target="_blank" rel="noopener noreferrer">
              <span class="pn">{{ post.ref }}</span>
              <div>
                <h3>{{ post.title }}</h3>
                <small>{{ post.blurb }}</small>
              </div>
              <span class="arr" aria-hidden="true">→</span>
            </a>
          }
        </div>
      </div>
    </section>
  `,
})
export class WritingComponent {
  protected readonly writing = PORTFOLIO.writing;
}

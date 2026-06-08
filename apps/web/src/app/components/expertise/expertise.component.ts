import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { EchoTitleDirective } from '../../shared/echo-title.directive';
import { SpotlightDirective } from '../../shared/spotlight.directive';

@Component({
  selector: 'app-expertise',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, EchoTitleDirective, SpotlightDirective],
  template: `
    <section id="expertise" class="section">
      <div class="wrap">
        <div class="sec-head" appReveal>
          <div><span class="tag">What I do</span><h2 echo>Core expertise</h2></div>
          <span class="sec-num">SEC.01 / SYSTEMS</span>
        </div>
        <div class="nodes">
          @for (node of nodes; track node.id) {
            <div class="node" appReveal appSpotlight>
              <span class="node-id">{{ node.id }}</span>
              <h3>{{ node.title }}</h3>
              <p>{{ node.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class ExpertiseComponent {
  protected readonly nodes = PORTFOLIO.expertise;
}

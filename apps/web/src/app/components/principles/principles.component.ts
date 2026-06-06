import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { EchoTitleDirective } from '../../shared/echo-title.directive';

@Component({
  selector: 'app-principles',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, EchoTitleDirective],
  template: `
    <section id="principles" class="section">
      <div class="wrap">
        <div class="sec-head" appReveal>
          <div><span class="tag">How I think</span><h2 echo>Design principles</h2></div>
          <span class="sec-num">SEC.03 / PHILOSOPHY</span>
        </div>
        <div class="princ">
          @for (item of principles; track item.num) {
            <div class="p-item" appReveal>
              <div class="num">{{ item.num }}</div>
              <div>
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
})
export class PrinciplesComponent {
  protected readonly principles = PORTFOLIO.principles;
}

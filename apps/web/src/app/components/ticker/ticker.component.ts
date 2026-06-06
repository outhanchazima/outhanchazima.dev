import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';

@Component({
  selector: 'app-ticker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ticker" aria-hidden="true">
      <div class="ticker-inner">
        <!-- rendered twice so the -50% translate loop is seamless -->
        @for (pass of [0, 1]; track pass) {
          @for (item of items; track item) {
            <span><i>◆</i>{{ item }}</span>
          }
        }
      </div>
    </div>
  `,
})
export class TickerComponent {
  protected readonly items = PORTFOLIO.ticker;
}

import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="wrap foot-inner">
        <span>© {{ year }} OUTHAN CHAZIMA — NAIROBI, KENYA</span>
        <span>BLUEPRINT REV. 2.0 · BUILT WITH ANGULAR · BUN · SSR</span>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly year = new Date().getFullYear();
}

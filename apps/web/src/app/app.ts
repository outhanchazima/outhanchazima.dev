import { ChangeDetectionStrategy, Component, AfterViewInit, afterNextRender, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { HudComponent } from './components/hud/hud.component';
import { BootComponent } from './components/boot/boot.component';
import { FooterComponent } from './components/footer/footer.component';
import { ConsentComponent } from './components/consent/consent.component';
import { ViewportService } from './core/services/viewport.service';
import { AnalyticsService } from './core/services/analytics.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, BootComponent, NavbarComponent, HudComponent, FooterComponent, ConsentComponent],
  template: `
    <app-boot />
    <a href="#main" class="skip-link">Skip to content</a>
    <app-navbar />
    <app-hud />
    <main id="main">
      <router-outlet />
    </main>
    <app-footer />
    <app-consent />
  `,
})
export class App implements AfterViewInit {
  private readonly viewport = inject(ViewportService);
  private readonly analytics = inject(AnalyticsService);

  constructor() {
    // Browser-only: restore consent + start PostHog if previously granted.
    afterNextRender(() => this.analytics.bootstrap());
  }

  ngAfterViewInit(): void {
    // Scroll progress + parallax (works on every route).
    this.viewport.init();
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { AnalyticsService } from '../../core/services/analytics.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <button
      type="button"
      class="toggle"
      (click)="onToggle()"
      [attr.aria-label]="theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
      [attr.aria-pressed]="theme.isDark()"
      title="Toggle theme"
    >
      <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="17" />
    </button>
  `,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
  private readonly analytics = inject(AnalyticsService);

  protected onToggle(): void {
    this.theme.toggle();
    this.analytics.capture('theme_toggled', { theme: this.theme.isDark() ? 'dark' : 'light' });
  }
}

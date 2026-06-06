import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '../../core/services/theme.service';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <button
      type="button"
      (click)="theme.toggle()"
      class="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-accent-ink hover:border-accent"
      [attr.aria-label]="theme.isDark() ? 'Switch to light theme' : 'Switch to dark theme'"
      [attr.aria-pressed]="theme.isDark()"
      title="Toggle theme"
    >
      @if (theme.isDark()) {
        <app-icon name="sun" [size]="18" />
      } @else {
        <app-icon name="moon" [size]="18" />
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  protected readonly theme = inject(ThemeService);
}

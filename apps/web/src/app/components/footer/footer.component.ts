import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <footer class="border-t border-border bg-surface/50">
      <div
        class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 sm:flex-row sm:px-6"
      >
        <div class="text-center sm:text-left">
          <a href="#top" class="font-mono text-sm font-semibold text-ink"
            >outhanchazima<span class="text-accent">.dev</span></a
          >
          <p class="mt-1 text-xs text-faint">
            © {{ year }} {{ profile.name }}. Built with Angular, Bun &amp; TailwindCSS.
          </p>
        </div>

        <div class="flex items-center gap-3">
          @for (social of profile.socials; track social.url) {
            <a
              [href]="social.url"
              [attr.aria-label]="social.label"
              target="_blank"
              rel="noopener noreferrer"
              class="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-accent-ink hover:border-accent"
            >
              <app-icon [name]="social.icon" [size]="16" />
            </a>
          }
          <a
            href="#top"
            aria-label="Back to top"
            class="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-accent-ink hover:border-accent"
          >
            <app-icon name="arrow-up" [size]="16" />
          </a>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  protected readonly profile = PORTFOLIO.profile;
  protected readonly year = new Date().getFullYear();
}

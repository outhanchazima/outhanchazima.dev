import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { IconComponent } from '../../shared/icon.component';

interface NavLink {
  readonly label: string;
  readonly fragment: string;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ThemeToggleComponent, IconComponent],
  template: `
    <header
      class="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-bg/80 backdrop-blur-md"
    >
      <nav
        class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6"
        aria-label="Primary"
      >
        <a
          href="#top"
          class="group inline-flex items-center gap-2 font-mono text-sm font-semibold text-ink"
        >
          <span
            class="grid h-8 w-8 place-items-center rounded-lg bg-accent text-white shadow-sm"
            aria-hidden="true"
            >OC</span
          >
          <span class="hidden sm:inline">outhanchazima<span class="text-accent">.dev</span></span>
        </a>

        <div class="hidden items-center gap-1 md:flex">
          @for (link of links; track link.fragment) {
            <a
              [href]="'#' + link.fragment"
              class="rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-ink hover:bg-surface-2"
              >{{ link.label }}</a
            >
          }
        </div>

        <div class="flex items-center gap-2">
          <a
            href="#contact"
            class="hidden rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-bg transition-opacity hover:opacity-90 sm:inline-flex"
            >Get in touch</a
          >
          <app-theme-toggle />
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted md:hidden"
            [attr.aria-expanded]="open()"
            aria-controls="mobile-menu"
            aria-label="Toggle navigation menu"
            (click)="open.set(!open())"
          >
            <app-icon [name]="open() ? 'close' : 'menu'" [size]="18" />
          </button>
        </div>
      </nav>

      @if (open()) {
        <div id="mobile-menu" class="border-t border-border bg-surface md:hidden">
          <div class="mx-auto flex max-w-6xl flex-col px-4 py-2">
            @for (link of links; track link.fragment) {
              <a
                [href]="'#' + link.fragment"
                (click)="open.set(false)"
                class="rounded-lg px-3 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >{{ link.label }}</a
              >
            }
            <a
              href="#contact"
              (click)="open.set(false)"
              class="mt-1 rounded-lg bg-ink px-3 py-3 text-center text-sm font-semibold text-bg"
              >Get in touch</a
            >
          </div>
        </div>
      }
    </header>
  `,
})
export class NavbarComponent {
  protected readonly open = signal(false);

  protected readonly links: readonly NavLink[] = [
    { label: 'About', fragment: 'about' },
    { label: 'Skills', fragment: 'skills' },
    { label: 'Experience', fragment: 'experience' },
    { label: 'Work', fragment: 'work' },
    { label: 'Contact', fragment: 'contact' },
  ];
}

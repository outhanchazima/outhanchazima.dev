import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { IconComponent } from '../../shared/icon.component';
import { ViewportService } from '../../core/services/viewport.service';

interface NavLink {
  readonly label: string;
  readonly fragment: string;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ThemeToggleComponent, IconComponent, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav" [class.menu-open]="menuOpen()">
      <div class="nav-inner">
        <a routerLink="/" fragment="top" class="logo" (click)="closeMenu()">
          <span class="dot"></span>OUTHAN.CHAZIMA
        </a>
        <div class="nav-right">
          <div class="nav-links" id="nav-menu">
            @for (link of links; track link.fragment) {
              <a
                routerLink="/"
                [fragment]="link.fragment"
                (click)="closeMenu()"
                [class.active]="onHome() && viewport.activeId() === link.fragment"
              >
                {{ link.label }}
              </a>
            }
            <a routerLink="/blog" routerLinkActive="active" (click)="closeMenu()">Blog</a>
          </div>
          <app-theme-toggle />
          <button
            type="button"
            class="nav-toggle"
            (click)="toggleMenu()"
            [attr.aria-expanded]="menuOpen()"
            aria-controls="nav-menu"
            [attr.aria-label]="menuOpen() ? 'Close menu' : 'Open menu'"
          >
            <app-icon [name]="menuOpen() ? 'close' : 'menu'" [size]="18" />
          </button>
        </div>
      </div>
      <div class="nav-progress" [style.width.%]="viewport.progress()"></div>
    </nav>
  `,
})
export class NavbarComponent {
  protected readonly viewport = inject(ViewportService);
  private readonly router = inject(Router);

  protected readonly menuOpen = signal(false);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  protected readonly onHome = computed(() => !this.url().startsWith('/blog'));

  protected readonly links: readonly NavLink[] = [
    { label: 'Work', fragment: 'work' },
    { label: 'Experience', fragment: 'experience' },
    { label: 'Contact', fragment: 'contact' },
  ];

  constructor() {
    // Close the mobile menu whenever the route changes.
    effect(() => {
      this.url();
      this.menuOpen.set(false);
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}

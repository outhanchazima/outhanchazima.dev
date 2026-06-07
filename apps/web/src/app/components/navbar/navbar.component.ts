import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { ViewportService } from '../../core/services/viewport.service';

interface NavLink {
  readonly num: string;
  readonly label: string;
  readonly fragment: string;
}

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ThemeToggleComponent, RouterLink, RouterLinkActive],
  template: `
    <nav class="nav">
      <div class="nav-inner">
        <a routerLink="/" fragment="top" class="logo"><span class="dot"></span>OUTHAN.CHAZIMA</a>
        <div class="nav-right">
          <div class="nav-links">
            @for (link of links; track link.fragment) {
              <a
                routerLink="/"
                [fragment]="link.fragment"
                [class.active]="onHome() && viewport.activeId() === link.fragment"
              >
                <span>{{ link.num }}</span>{{ link.label }}
              </a>
            }
            <a routerLink="/blog" routerLinkActive="active"><span>08</span>Blog</a>
          </div>
          <app-theme-toggle />
        </div>
      </div>
      <div class="nav-progress" [style.width.%]="viewport.progress()"></div>
    </nav>
  `,
})
export class NavbarComponent {
  protected readonly viewport = inject(ViewportService);
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );
  protected readonly onHome = computed(() => !this.url().startsWith('/blog'));

  protected readonly links: readonly NavLink[] = [
    { num: '01', label: 'Expertise', fragment: 'expertise' },
    { num: '02', label: 'Stack', fragment: 'skills' },
    { num: '03', label: 'Work', fragment: 'work' },
    { num: '04', label: 'Experience', fragment: 'experience' },
    { num: '05', label: 'Principles', fragment: 'principles' },
    { num: '06', label: 'Writing', fragment: 'writing' },
    { num: '07', label: 'Contact', fragment: 'contact' },
  ];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, IconComponent],
  template: `
    <section id="contact" class="scroll-mt-20 py-20 sm:py-28">
      <div class="mx-auto max-w-4xl px-4 sm:px-6">
        <div
          appReveal
          class="relative overflow-hidden rounded-card border border-border bg-surface p-8 text-center sm:p-14"
        >
          <div
            class="pointer-events-none absolute left-1/2 top-0 -z-0 h-40 w-96 -translate-x-1/2 rounded-full bg-accent/20 blur-[80px]"
            aria-hidden="true"
          ></div>

          <p class="relative font-mono text-sm font-medium text-accent-ink">05 / Contact</p>
          <h2 class="relative mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Let's build something that scales
          </h2>
          <p class="relative mx-auto mt-4 max-w-lg text-muted">
            I'm open to senior and staff engineering roles, architecture consulting, and
            collaborations. The fastest way to reach me is email.
          </p>

          <div class="relative mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              [href]="'mailto:' + profile.email"
              class="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <app-icon name="email" [size]="18" />
              {{ profile.email }}
            </a>
            @for (social of profile.socials; track social.url) {
              @if (social.icon !== 'email') {
                <a
                  [href]="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent"
                >
                  <app-icon [name]="social.icon" [size]="18" />
                  {{ social.label }}
                </a>
              }
            }
          </div>

          <p class="relative mt-6 inline-flex items-center gap-2 text-sm text-faint">
            <app-icon name="phone" [size]="16" />
            {{ profile.phone }}
            <span class="mx-1">·</span>
            <app-icon name="location" [size]="16" />
            {{ profile.location }}
          </p>
        </div>
      </div>
    </section>
  `,
})
export class ContactComponent {
  protected readonly profile = PORTFOLIO.profile;
}

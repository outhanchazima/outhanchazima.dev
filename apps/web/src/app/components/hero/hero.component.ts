import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <section id="top" class="relative overflow-hidden">
      <div class="grid-bg pointer-events-none absolute inset-0 -z-10 h-[120%]" aria-hidden="true"></div>
      <div
        class="pointer-events-none absolute left-1/2 top-0 -z-10 h-72 w-[40rem] -translate-x-1/2 rounded-full bg-accent/20 blur-[100px]"
        aria-hidden="true"
      ></div>

      <div class="mx-auto max-w-6xl px-4 pb-16 pt-32 sm:px-6 sm:pt-40">
        <div class="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <span
              class="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted"
            >
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                <span class="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
              </span>
              Available for senior & staff engineering roles
            </span>

            <h1 class="mt-6 text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
              {{ profile.name }}
            </h1>
            <p class="mt-3 text-xl font-semibold text-accent-ink sm:text-2xl">
              {{ profile.role }}
            </p>
            <p class="mt-1 font-mono text-sm text-muted">
              {{ profile.specialism }}
            </p>

            <p class="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {{ profile.tagline }}
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#work"
                class="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white shadow-sm transition-transform hover:-translate-y-0.5"
              >
                View my work
                <app-icon name="arrow-right" [size]="18" />
              </a>
              <a
                href="/Outhan-Chazima-Resume.pdf"
                class="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent"
                download
              >
                <app-icon name="resume" [size]="18" />
                Download résumé
              </a>
            </div>

            <div class="mt-8 flex items-center gap-3">
              @for (social of profile.socials; track social.url) {
                <a
                  [href]="social.url"
                  [attr.aria-label]="social.label"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="grid h-10 w-10 place-items-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-accent-ink hover:border-accent"
                >
                  <app-icon [name]="social.icon" [size]="18" />
                </a>
              }
              <span class="inline-flex items-center gap-1.5 pl-1 text-sm text-faint">
                <app-icon name="location" [size]="16" />
                {{ profile.location }}
              </span>
            </div>
          </div>

          <!-- Architecture "blueprint" card -->
          <div class="relative" aria-hidden="true">
            <div
              class="overflow-hidden rounded-card border border-border bg-surface shadow-xl shadow-black/5"
            >
              <div class="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-3">
                <span class="h-3 w-3 rounded-full bg-red-400/80"></span>
                <span class="h-3 w-3 rounded-full bg-amber-400/80"></span>
                <span class="h-3 w-3 rounded-full bg-emerald-400/80"></span>
                <span class="ml-2 font-mono text-xs text-faint">system-design.ts</span>
              </div>
              <pre
                class="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-muted"
                [innerHTML]="codeHtml"
              ></pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HeroComponent {
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly profile = PORTFOLIO.profile;

  /** Syntax-highlighted hero snippet. Static & trusted — bypasses sanitisation. */
  protected readonly codeHtml: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    [
      `<span class="text-faint">// scalable by design</span>`,
      `<span class="text-accent-ink">const</span> platform = architect({`,
      `  ingest:   <span class="text-accent-ink">'Kafka'</span>,`,
      `  store:    [<span class="text-accent-ink">'Cassandra'</span>, <span class="text-accent-ink">'PostgreSQL'</span>],`,
      `  cache:    <span class="text-accent-ink">'Redis'</span>,`,
      `  services: [<span class="text-accent-ink">'Django'</span>, <span class="text-accent-ink">'NestJS'</span>],`,
      `  edge:     <span class="text-accent-ink">'Angular + SSR'</span>,`,
      `  deploy:   [<span class="text-accent-ink">'Docker'</span>, <span class="text-accent-ink">'Kubernetes'</span>],`,
      `});`,
      ``,
      `platform.<span class="text-ink">scale</span>(<span class="text-accent-ink">'production'</span>);`,
      `<span class="text-faint">// → 2M+ KES / day, 100% cashless</span>`,
    ].join('\n'),
  );
}

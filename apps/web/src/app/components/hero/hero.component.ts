import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PORTFOLIO } from '../../core/data/portfolio.data';

@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header id="top" class="hero">
      <div class="wrap hero-grid">
        <div>
          <span class="tag reveal d1">{{ profile.role }} · {{ profile.location }}</span>
          <h1 class="reveal d2" [innerHTML]="headline"></h1>
          <p class="hero-sub reveal d3" [innerHTML]="tagline"></p>

          <div class="btn-row reveal d4">
            <a class="btn primary" href="#contact">Start a conversation</a>
            <a class="btn ghost" href="#experience">View the build log ↓</a>
          </div>

          <div class="hero-meta reveal d5">
            @for (item of profile.meta; track item.label) {
              <div><b>{{ item.value }}</b>{{ item.label }}</div>
            }
          </div>
        </div>

        <!-- Animated architecture schematic: clients → gateway → services → data -->
        <div class="diagram reveal d6" aria-hidden="true">
          <svg viewBox="-52 -38 564 502" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- drafting dimension lines (annotations) -->
            <g class="dg-dim">
              <line x1="-30" y1="22" x2="-30" y2="380" />
              <line x1="-35" y1="22" x2="-25" y2="22" />
              <line x1="-35" y1="380" x2="-25" y2="380" />
            </g>
            <text class="dg-dim-text" x="-38" y="201" text-anchor="middle" transform="rotate(-90 -38 201)">
              4 TIERS
            </text>
            <g class="dg-dim">
              <line x1="50" y1="-20" x2="410" y2="-20" />
              <line x1="50" y1="-25" x2="50" y2="-15" />
              <line x1="410" y1="-25" x2="410" y2="-15" />
            </g>
            <text class="dg-dim-text" x="230" y="-26" text-anchor="middle">SPAN ·3 SVC</text>
            <!-- leader annotation on the gateway -->
            <g class="dg-dim">
              <line x1="305" y1="120" x2="452" y2="96" />
              <circle cx="305" cy="120" r="2" />
            </g>
            <text class="dg-dim-text" x="455" y="92" text-anchor="start">LOAD·BAL</text>

            <path class="flow dg-flow-cyan" d="M230 64 V108" stroke-width="1.4" />
            <path class="flow dg-flow-cyan" d="M230 156 V186 H110 V216" stroke-width="1.4" />
            <path class="flow dg-flow-cyan" d="M230 156 V216" stroke-width="1.4" />
            <path class="flow dg-flow-cyan" d="M230 156 V186 H350 V216" stroke-width="1.4" />
            <path class="flow dg-flow-amber" d="M110 268 V300 H190 V330" stroke-width="1.4" />
            <path class="flow dg-flow-amber" d="M230 268 V330" stroke-width="1.4" />
            <path class="flow dg-flow-amber" d="M350 268 V300 H270 V330" stroke-width="1.4" />

            <rect class="dg-box" x="170" y="22" width="120" height="42" rx="4" />
            <text class="dg-text" x="230" y="48" text-anchor="middle" font-family="IBM Plex Mono" font-size="11" letter-spacing="2">CLIENTS</text>

            <rect class="dg-box-amber node-pulse" x="155" y="108" width="150" height="48" rx="4" />
            <text class="dg-text-amber" x="230" y="136" text-anchor="middle" font-family="IBM Plex Mono" font-size="11" letter-spacing="2">API GATEWAY</text>

            <rect class="dg-box-cyan" x="50" y="216" width="120" height="52" rx="4" />
            <text class="dg-text" x="110" y="246" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" letter-spacing="1.5">PAYMENTS</text>
            <rect class="dg-box-cyan" x="170" y="216" width="120" height="52" rx="4" />
            <text class="dg-text" x="230" y="246" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" letter-spacing="1.5">BOOKINGS</text>
            <rect class="dg-box-cyan" x="290" y="216" width="120" height="52" rx="4" />
            <text class="dg-text" x="350" y="246" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" letter-spacing="1.5">NOTIFICATIONS</text>

            <rect class="dg-box-amber node-pulse" x="140" y="330" width="180" height="50" rx="4" />
            <text class="dg-text-amber" x="230" y="359" text-anchor="middle" font-family="IBM Plex Mono" font-size="10" letter-spacing="2">DATA / EVENT BUS</text>

            <path class="dg-mark" d="M10 10 H30 M10 10 V30" />
            <path class="dg-mark" d="M450 410 H430 M450 410 V390" />
          </svg>
          <div class="caption">
            <span>FIG. 01 — REFERENCE TOPOLOGY</span>
            <span>{{ uptime() }}</span>
          </div>
        </div>
      </div>
    </header>
  `,
})
export class HeroComponent implements OnInit, OnDestroy {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly platformId = inject(PLATFORM_ID);
  private timer?: ReturnType<typeof setInterval>;
  private startMs = 0;

  protected readonly profile = PORTFOLIO.profile;
  protected readonly headline: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    PORTFOLIO.profile.headlineHtml,
  );
  protected readonly tagline: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(
    PORTFOLIO.profile.taglineHtml,
  );

  /** Playful "uptime" clock in the diagram caption — browser-only. */
  protected readonly uptime = signal('UPTIME 00:00:00');

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.startMs = Date.now();
    this.timer = setInterval(() => this.tick(), 1000);
    this.tick();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private tick(): void {
    const s = Math.floor((Date.now() - this.startMs) / 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    this.uptime.set(
      `UPTIME ${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`,
    );
  }
}

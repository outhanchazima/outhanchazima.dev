import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  OnDestroy,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

interface BootLine {
  readonly body: string;
  readonly status?: string;
}

const STORAGE_KEY = 'oc_booted';

/**
 * One-time terminal-style boot overlay shown on first load of a session.
 * Reveals a short systems "boot log", then fades to expose the hero.
 *
 * - Browser-only: rendered behind a signal that is false during SSR/hydration,
 *   so it never appears in the prerendered HTML (no FOUC, crawler-safe).
 * - Shown once per session (sessionStorage), skippable (click / Esc), and fully
 *   disabled under prefers-reduced-motion.
 */
@Component({
  selector: 'app-boot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'skip()' },
  template: `
    @if (show()) {
      <div class="boot" [class.boot--out]="fading()" (click)="skip()" aria-hidden="true">
        <div class="boot-inner">
          <div class="boot-head">[ BOOT ] outhan.chazima / systems</div>
          @for (line of lines; track line.body; let i = $index) {
            @if (i < visible()) {
              <div class="boot-line">
                <span class="bp">&gt;</span> {{ line.body }}
                @if (line.status) {
                  <span class="bs">{{ line.status }}</span>
                }
                @if (i === visible() - 1 && !fading()) {
                  <span class="bc"></span>
                }
              </div>
            }
          }
          <div class="boot-skip">press esc · click to skip</div>
        </div>
      </div>
    }
  `,
})
export class BootComponent implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly timers: ReturnType<typeof setTimeout>[] = [];

  protected readonly show = signal(false);
  protected readonly fading = signal(false);
  protected readonly visible = signal(0);

  protected readonly lines: readonly BootLine[] = [
    { body: 'loading reference topology', status: 'ok' },
    { body: 'mounting services [payments · bookings · notifications]' },
    { body: 'establishing data / event bus', status: 'ok' },
    { body: 'calibrating blueprint grid', status: 'ok' },
    { body: 'render(portfolio)', status: 'ready' },
  ];

  constructor() {
    afterNextRender(() => this.maybeBoot());
  }

  private maybeBoot(): void {
    const win = this.document.defaultView;
    const reduced = win?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false;
    let booted = false;
    try {
      booted = sessionStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      /* storage blocked — treat as booted to avoid replays */
      booted = true;
    }
    if (reduced || booted) {
      return;
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {
      /* non-fatal */
    }

    this.show.set(true);
    this.document.documentElement.style.overflow = 'hidden';

    const reveal = (index: number) => {
      this.visible.set(index + 1);
      if (index + 1 < this.lines.length) {
        this.timers.push(setTimeout(() => reveal(index + 1), 240));
      } else {
        this.timers.push(setTimeout(() => this.fadeOut(), 650));
      }
    };
    this.timers.push(setTimeout(() => reveal(0), 180));
  }

  private fadeOut(): void {
    this.fading.set(true);
    this.timers.push(setTimeout(() => this.dismiss(), 360));
  }

  protected skip(): void {
    if (this.show() && !this.fading()) {
      this.fadeOut();
    }
  }

  private dismiss(): void {
    this.show.set(false);
    this.document.documentElement.style.overflow = '';
  }

  ngOnDestroy(): void {
    this.timers.forEach(clearTimeout);
    this.document.documentElement.style.overflow = '';
  }
}

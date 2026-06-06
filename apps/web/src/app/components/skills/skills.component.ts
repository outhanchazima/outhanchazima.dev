import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  NgZone,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';

type Cat = 'ai' | 'lang' | 'tool';

interface GlobeTag {
  label: string;
  cat: Cat;
  color: string;
}

/** On-theme colour per skill category — drives both globe tags and the legend.
   Applied AI takes the amber "signal" accent so it reads as the headline skill. */
const CAT_COLOR: Record<Cat, string> = {
  ai: 'var(--signal)',
  lang: 'var(--paper)',
  tool: 'var(--cyan)',
};

function categorize(title: string): Cat {
  if (/\bAI\b|\bML\b/.test(title)) return 'ai';
  if (title === 'Languages') return 'lang';
  return 'tool';
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Interactive 3D "skill globe": every skill sits on a sphere (Fibonacci
 * distribution) that rotates continuously, follows the pointer, and pulses a
 * random tag with a glow. The animation runs browser-only and outside Angular's
 * zone (direct DOM writes per frame). On the server, with no JS, or under
 * prefers-reduced-motion it renders a static, readable spec-list fallback —
 * which is also the initial render, so hydration stays in sync.
 */
@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section id="skills" class="section">
      <div class="wrap">
        <div class="sec-head" appReveal>
          <div><span class="tag">Tools of the trade</span><h2>Stack</h2></div>
          <span class="sec-num">SEC.02 / STACK</span>
        </div>

        @if (animate()) {
          <div class="globe-wrap" appReveal>
            <div #stage class="globe-stage" role="group" aria-label="Skill globe — rotate with your cursor">
              <span class="globe-core" aria-hidden="true"></span>
              @for (t of tags; track t.label) {
                <button type="button" class="globe-tag" [style.color]="t.color">{{ t.label }}</button>
              }
            </div>
            <ul class="globe-legend">
              @for (l of legend; track l.label) {
                <li><i [style.background]="l.color"></i>{{ l.label }}</li>
              }
            </ul>
          </div>
        } @else {
          <div class="stack">
            @for (group of groups; track group.id) {
              <div class="stack-row" appReveal>
                <div class="stack-meta">
                  <span class="stack-id">{{ group.id }}</span>
                  <h3>{{ group.title }}</h3>
                </div>
                <div class="chips">
                  @for (skill of group.skills; track skill) {
                    <span class="chip">{{ skill }}</span>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </section>
  `,
})
export class SkillsComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly stage = viewChild<ElementRef<HTMLElement>>('stage');

  protected readonly groups = PORTFOLIO.skillGroups;
  protected readonly tags: GlobeTag[] = this.groups.flatMap((g) => {
    const cat = categorize(g.title);
    return g.skills.map((label) => ({ label, cat, color: CAT_COLOR[cat] }));
  });
  protected readonly legend = [
    { label: 'Applied AI / ML', color: CAT_COLOR.ai },
    { label: 'Languages', color: CAT_COLOR.lang },
    { label: 'Frameworks & Infra', color: CAT_COLOR.tool },
  ];
  protected readonly animate = signal(false);

  /** Unit-sphere base position per tag (Fibonacci sphere). */
  private readonly base = this.tags.map((_, i, arr) => {
    const y = arr.length > 1 ? 1 - (i / (arr.length - 1)) * 2 : 0;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * GOLDEN_ANGLE;
    return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
  });
  /** Per-tag highlight amount (0..1), eased toward its target each frame. */
  private readonly hl = this.tags.map(() => 0);

  private els: HTMLElement[] = [];
  private raf = 0;
  private timer = 0;
  private size = 480;
  // rotation state: angle, velocity and pointer-driven target velocity
  private ax = 0.35;
  private ay = 0;
  private vx = 0;
  private vy = 0;
  private tvx = 0;
  private tvy = 0;
  private overStage = false;
  private held = -1;
  private active = -1;

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;
      const reduce = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce) return; // keep the static spec-list fallback
      this.animate.set(true);
      this.zone.runOutsideAngular(() => this.start());
      destroyRef.onDestroy(() => this.stop());
    });
  }

  private start(): void {
    const win = this.document.defaultView!;
    const ro = new ResizeObserver(() => this.measure());

    const loop = () => {
      const stageEl = this.stage()?.nativeElement;
      if (!stageEl) {
        this.raf = win.requestAnimationFrame(loop);
        return;
      }
      if (this.els.length === 0) {
        this.els = Array.from(stageEl.querySelectorAll<HTMLElement>('.globe-tag'));
        if (this.els.length === 0) {
          this.raf = win.requestAnimationFrame(loop);
          return;
        }
        this.bindEvents(stageEl, win);
        ro.observe(stageEl);
        this.measure();
        this.startHighlighter(win);
      }
      this.frame();
      this.raf = win.requestAnimationFrame(loop);
    };

    this.raf = win.requestAnimationFrame(loop);
    this.disconnectRo = () => ro.disconnect();
  }

  private disconnectRo = () => {};
  private unbind = () => {};

  private measure(): void {
    const el = this.stage()?.nativeElement;
    if (el) this.size = Math.min(el.clientWidth, el.clientHeight);
  }

  /** Project the rotating sphere to 2D and write transforms straight to the DOM. */
  private frame(): void {
    if (!this.overStage) {
      // gentle auto-rotation when the pointer isn't steering
      this.tvy = 0.0022;
      this.tvx = 0;
    }
    this.vx += (this.tvx - this.vx) * 0.07;
    this.vy += (this.tvy - this.vy) * 0.07;
    this.ax += this.vx;
    this.ay += this.vy;

    const sinX = Math.sin(this.ax);
    const cosX = Math.cos(this.ax);
    const sinY = Math.sin(this.ay);
    const cosY = Math.cos(this.ay);
    const R = this.size * 0.5 * 0.84;

    for (let i = 0; i < this.els.length; i++) {
      const b = this.base[i];
      // rotate around Y, then X
      const x1 = b.x * cosY - b.z * sinY;
      const z1 = b.x * sinY + b.z * cosY;
      const y2 = b.y * cosX - z1 * sinX;
      const z2 = b.y * sinX + z1 * cosX;

      const depth = (z2 + 1) / 2; // 0 = back, 1 = front
      const target = this.held === i || (this.held < 0 && this.active === i) ? 1 : 0;
      this.hl[i] += (target - this.hl[i]) * 0.12;
      const h = this.hl[i];

      const sx = x1 * R * (0.78 + depth * 0.42);
      const sy = y2 * R * (0.78 + depth * 0.42);
      const sc = (0.68 + depth * 0.46) * (1 + h * 0.5);

      const el = this.els[i];
      el.style.transform = `translate(-50%,-50%) translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px) scale(${sc.toFixed(3)})`;
      el.style.opacity = Math.min(1, 0.46 + depth * 0.54 + h * 0.5).toFixed(2);
      el.style.zIndex = String(Math.round(depth * 100 + h * 50));
      // Soften tags toward the back for real depth; keep highlighted ones crisp.
      const blur = Math.max(0, 0.5 - depth) * (1 - h) * 4;
      el.style.filter = blur > 0.15 ? `blur(${blur.toFixed(1)}px)` : 'none';
      // Only let the front-facing hemisphere capture the pointer.
      el.style.pointerEvents = depth < 0.4 ? 'none' : 'auto';
      if (h > 0.5) el.classList.add('is-active');
      else el.classList.remove('is-active');
    }
  }

  private bindEvents(stageEl: HTMLElement, win: Window): void {
    const onMove = (e: PointerEvent) => {
      const rect = stageEl.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      this.tvy = nx * 0.05;
      this.tvx = -ny * 0.05;
      this.overStage = true;
    };
    const onLeave = () => (this.overStage = false);
    const idx = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return el?.classList?.contains('globe-tag') ? this.els.indexOf(el) : -1;
    };
    const over = (e: Event) => {
      const i = idx(e.target);
      if (i >= 0) this.held = i;
    };
    const out = (e: Event) => {
      const i = idx(e.target);
      if (i >= 0 && this.held === i) this.held = -1;
    };

    stageEl.addEventListener('pointermove', onMove, { passive: true });
    stageEl.addEventListener('pointerleave', onLeave);
    stageEl.addEventListener('pointerover', over, { passive: true });
    stageEl.addEventListener('pointerout', out, { passive: true });
    stageEl.addEventListener('focusin', over);
    stageEl.addEventListener('focusout', out);

    this.unbind = () => {
      stageEl.removeEventListener('pointermove', onMove);
      stageEl.removeEventListener('pointerleave', onLeave);
      stageEl.removeEventListener('pointerover', over);
      stageEl.removeEventListener('pointerout', out);
      stageEl.removeEventListener('focusin', over);
      stageEl.removeEventListener('focusout', out);
    };
  }

  /** Pulse a random tag on a loose interval for the "highlight in random" effect. */
  private startHighlighter(win: Window): void {
    const tick = () => {
      this.active = Math.floor(Math.random() * this.els.length);
      this.timer = win.setTimeout(tick, 1200 + Math.random() * 1000);
    };
    this.timer = win.setTimeout(tick, 700);
  }

  private stop(): void {
    const win = this.document.defaultView;
    win?.cancelAnimationFrame(this.raf);
    win?.clearTimeout(this.timer);
    this.disconnectRo();
    this.unbind();
  }
}

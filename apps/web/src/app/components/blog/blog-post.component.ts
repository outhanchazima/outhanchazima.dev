import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe, NgOptimizedImage, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgZone } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';
import { ThemeService } from '../../core/services/theme.service';
import { ArticleActionsComponent } from './article-actions.component';

const SITE_URL = 'https://outhanchazima.dev';

@Component({
  selector: 'app-blog-post',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, NgOptimizedImage, ArticleActionsComponent],
  host: {
    '(document:keydown.escape)': 'closeLightbox()',
    '(document:keydown.arrowleft)': 'goPrev($event)',
    '(document:keydown.arrowright)': 'goNext($event)',
  },
  template: `
    @if (post(); as p) {
      <div class="read-progress" [style.width.%]="readPct()" aria-hidden="true"></div>
      <article class="section blog-post">
        <div class="wrap">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a routerLink="/">Home</a> <span aria-hidden="true">/</span>
            <a routerLink="/blog">Blog</a> <span aria-hidden="true">/</span>
            <span class="breadcrumb-current">{{ p.title }}</span>
          </nav>

          <header class="post-head">
            <div class="post-meta">
              <time [attr.datetime]="p.date">{{ p.date | date: 'longDate' }}</time>
              <span aria-hidden="true">·</span>
              <span>{{ p.readingTime }}</span>
              @if (p.updated) {
                <span aria-hidden="true">·</span>
                <span>Updated {{ p.updated | date: 'mediumDate' }}</span>
              }
              <app-article-actions
                class="post-actions"
                [url]="url()"
                [title]="p.title"
                [markdownUrl]="'/blog/' + p.slug + '.md'"
              />
            </div>
            <h1>{{ p.title }}</h1>
            <p class="post-lede">{{ p.description }}</p>
            <div class="chips post-tags">
              @for (t of p.tags; track t) {
                <span class="chip">{{ t }}</span>
              }
            </div>
          </header>

          @if (p.cover) {
            <div class="post-cover">
              <img [ngSrc]="p.cover" fill [alt]="p.title" priority sizes="(max-width: 920px) 100vw, 860px" />
            </div>
          }

          <div class="post-layout">
            @if (p.toc.length > 1) {
              <aside class="post-toc" aria-label="Table of contents">
                <span class="post-toc-title">On this page</span>
                <ul>
                  @for (item of p.toc; track item.id) {
                    <li [class.toc-sub]="item.level === 3">
                      <a [href]="'#' + item.id" [class.active]="activeTocId() === item.id">{{ item.text }}</a>
                    </li>
                  }
                </ul>
              </aside>
            }

            <div class="prose" [innerHTML]="safeHtml()" (click)="onProseClick($event)"></div>
          </div>

          <nav class="post-nav" aria-label="More posts">
            @if (adjacent().prev; as prev) {
              <a class="post-nav-link prev" [routerLink]="['/blog', prev.slug]">
                <span class="post-nav-dir">← Older</span>
                <span class="post-nav-title">{{ prev.title }}</span>
              </a>
            } @else {
              <span></span>
            }
            @if (adjacent().next; as next) {
              <a class="post-nav-link next" [routerLink]="['/blog', next.slug]">
                <span class="post-nav-dir">Newer →</span>
                <span class="post-nav-title">{{ next.title }}</span>
              </a>
            }
          </nav>

          @if (related().length) {
            <section class="post-related">
              <span class="tag">Related reading</span>
              <div class="blog-grid">
                @for (r of related(); track r.slug) {
                  <a class="blog-card" [routerLink]="['/blog', r.slug]">
                    <span class="blog-card-body">
                      <span class="blog-card-meta">{{ r.readingTime }}</span>
                      <h3>{{ r.title }}</h3>
                      <p>{{ r.description }}</p>
                    </span>
                  </a>
                }
              </div>
            </section>
          }

          <div class="post-foot">
            <a class="post-back" routerLink="/blog">← All posts</a>
            <a class="post-rss" href="/rss.xml" target="_blank" rel="noopener noreferrer">
              Subscribe via RSS ↗
            </a>
          </div>
        </div>
      </article>
    } @else {
      <section class="section">
        <div class="wrap blog-missing">
          <h1>Post not found</h1>
          <p>That article doesn’t exist (or was moved).</p>
          <a class="btn primary" routerLink="/blog">Back to the blog</a>
        </div>
      </section>
    }

    @if (lightbox(); as lb) {
      <div class="lightbox" role="dialog" aria-modal="true" aria-label="Image preview" (click)="closeLightbox()">
        <button type="button" class="lightbox-close" aria-label="Close preview">✕</button>
        <img [src]="lb.src" [alt]="lb.alt" />
      </div>
    }

    @if (showTop()) {
      <button type="button" class="to-top" (click)="scrollTop()" aria-label="Back to top">↑</button>
    }
  `,
})
export class BlogPostComponent {
  private readonly blog = inject(BlogService);
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly theme = inject(ThemeService);
  private readonly elRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private tocObserver?: IntersectionObserver;
  private scrollBound = false;

  /** Bound from the `:slug` route param (withComponentInputBinding). */
  readonly slug = input<string>('');

  /** Currently-in-view heading id, for TOC highlighting. */
  protected readonly activeTocId = signal('');
  /** Open image preview, or null. */
  protected readonly lightbox = signal<{ src: string; alt: string } | null>(null);
  /** Article reading progress (0–100) and back-to-top visibility. */
  protected readonly readPct = signal(0);
  protected readonly showTop = signal(false);

  protected readonly post = computed(() => this.blog.bySlug(this.slug()));
  protected readonly adjacent = computed(() => this.blog.adjacent(this.slug()));
  protected readonly related = computed(() => this.blog.related(this.slug()));

  protected readonly safeHtml = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(this.post()?.html ?? ''),
  );

  protected readonly url = computed(() => `${SITE_URL}/blog/${this.slug()}`);

  constructor() {
    effect(() => {
      const p = this.post();
      if (!p) return;
      const image = `${SITE_URL}${p.ogImage ?? p.cover ?? '/og-image.png'}`;
      this.seo.apply({
        title: `${p.title} | Outhan Chazima`,
        description: p.description,
        url: this.url(),
        image,
        type: 'article',
        keywords: p.keywords,
        publishedTime: p.date,
        modifiedTime: p.updated ?? p.date,
      });
      this.seo.setJsonLd({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            headline: p.title,
            description: p.description,
            datePublished: p.date,
            dateModified: p.updated ?? p.date,
            author: { '@type': 'Person', name: p.author, url: `${SITE_URL}/` },
            publisher: { '@type': 'Person', name: p.author, url: `${SITE_URL}/` },
            image,
            keywords: p.keywords,
            articleSection: p.tags[0] ?? 'Engineering',
            url: this.url(),
            mainEntityOfPage: { '@type': 'WebPage', '@id': this.url() },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
              { '@type': 'ListItem', position: 3, name: p.title, item: this.url() },
            ],
          },
        ],
      });
    });

    // Progressive enhancements once the article HTML is in the DOM, and again
    // whenever the post or theme changes. All browser-only.
    afterNextRender(() => {
      this.enhance();
      this.bindScroll();
    });
    effect(() => {
      this.post();
      this.theme.isDark();
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => this.enhance(), 0);
      }
    });
    inject(DestroyRef).onDestroy(() => this.tocObserver?.disconnect());
  }

  /** Code-copy buttons, TOC scroll-spy, and Mermaid rendering. */
  private enhance(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.addCopyButtons();
    this.observeToc();
    void this.renderMermaid();
  }

  private addCopyButtons(): void {
    const blocks = this.elRef.nativeElement.querySelectorAll<HTMLElement>('pre.shiki');
    blocks.forEach((pre) => {
      if (pre.querySelector('.code-copy')) return;
      const btn = this.document.createElement('button');
      btn.type = 'button';
      btn.className = 'code-copy';
      btn.textContent = 'Copy';
      btn.addEventListener('click', async () => {
        const code = pre.querySelector('code')?.textContent ?? '';
        try {
          await this.document.defaultView?.navigator.clipboard.writeText(code);
          btn.textContent = 'Copied!';
          this.document.defaultView?.setTimeout(() => (btn.textContent = 'Copy'), 1500);
        } catch {
          /* clipboard blocked */
        }
      });
      pre.appendChild(btn);
    });
  }

  private observeToc(): void {
    if (typeof IntersectionObserver === 'undefined') return;
    this.tocObserver?.disconnect();
    const headings = this.elRef.nativeElement.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]');
    if (!headings.length) return;
    this.tocObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) this.activeTocId.set(e.target.id);
        }
      },
      { rootMargin: '-90px 0px -68% 0px', threshold: 0 },
    );
    headings.forEach((h) => this.tocObserver!.observe(h));
  }

  protected onProseClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target?.tagName === 'IMG') {
      const img = target as HTMLImageElement;
      this.openLightbox(img.currentSrc || img.src, img.alt);
    }
  }

  private openLightbox(src: string, alt: string): void {
    this.lightbox.set({ src, alt });
    if (isPlatformBrowser(this.platformId)) this.document.body.style.overflow = 'hidden';
  }

  protected closeLightbox(): void {
    if (!this.lightbox()) return;
    this.lightbox.set(null);
    if (isPlatformBrowser(this.platformId)) this.document.body.style.overflow = '';
  }

  /** Reading-progress bar + back-to-top visibility, throttled with rAF. */
  private bindScroll(): void {
    if (this.scrollBound || !isPlatformBrowser(this.platformId)) return;
    this.scrollBound = true;
    const win = this.document.defaultView!;
    let ticking = false;
    const update = () => {
      ticking = false;
      const article = this.elRef.nativeElement.querySelector<HTMLElement>('.blog-post');
      if (article) {
        const span = article.offsetHeight - win.innerHeight;
        const scrolled = win.scrollY - article.offsetTop;
        this.readPct.set(span > 0 ? Math.min(100, Math.max(0, (scrolled / span) * 100)) : 0);
      }
      this.showTop.set(win.scrollY > 700);
    };
    this.zone.runOutsideAngular(() => {
      win.addEventListener(
        'scroll',
        () => {
          if (!ticking) {
            ticking = true;
            win.requestAnimationFrame(update);
          }
        },
        { passive: true },
      );
    });
    update();
  }

  protected scrollTop(): void {
    this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected goPrev(event: Event): void {
    if (this.typingTarget(event)) return;
    const prev = this.adjacent().prev;
    if (prev) void this.router.navigate(['/blog', prev.slug]);
  }

  protected goNext(event: Event): void {
    if (this.typingTarget(event)) return;
    const next = this.adjacent().next;
    if (next) void this.router.navigate(['/blog', next.slug]);
  }

  /** Don't hijack arrow keys while the visitor is typing or zoomed in. */
  private typingTarget(event: Event): boolean {
    if (this.lightbox()) return true;
    const el = event.target as HTMLElement | null;
    const tag = el?.tagName;
    return tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable === true;
  }

  /** Mermaid theme variables read live from the site's CSS palette. */
  private mermaidThemeVars(): Record<string, string> {
    const cs = this.document.defaultView!.getComputedStyle(this.document.documentElement);
    const v = (name: string) => cs.getPropertyValue(name).trim();
    const signal = v('--signal');
    const cyan = v('--cyan');
    const ink = v('--ink');
    const ink2 = v('--ink-2');
    const ink3 = v('--ink-3');
    const paper = v('--paper');
    const muted = v('--muted');
    const line = v('--line');
    return {
      fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
      background: 'transparent',
      primaryColor: ink2,
      primaryBorderColor: signal,
      primaryTextColor: paper,
      secondaryColor: ink3,
      secondaryBorderColor: cyan,
      secondaryTextColor: paper,
      tertiaryColor: ink3,
      tertiaryBorderColor: line,
      tertiaryTextColor: paper,
      lineColor: muted,
      textColor: paper,
      mainBkg: ink2,
      nodeBorder: signal,
      clusterBkg: ink,
      clusterBorder: line,
      edgeLabelBackground: ink,
      titleColor: paper,
      actorBkg: ink2,
      actorBorder: signal,
      actorTextColor: paper,
      actorLineColor: muted,
      signalColor: muted,
      signalTextColor: paper,
      noteBkgColor: ink3,
      noteTextColor: paper,
      noteBorderColor: line,
      labelBoxBkgColor: ink2,
      labelBoxBorderColor: line,
      labelTextColor: paper,
    };
  }

  private async renderMermaid(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    const nodes = Array.from(
      this.elRef.nativeElement.querySelectorAll<HTMLElement>('.mermaid'),
    );
    if (!nodes.length) return;

    const { default: mermaid } = await import('mermaid');
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      theme: 'base',
      themeVariables: this.mermaidThemeVars(),
      fontFamily: 'IBM Plex Mono, ui-monospace, monospace',
    });
    // Restore the original definition (mermaid replaces it with SVG on run).
    for (const node of nodes) {
      const raw = node.getAttribute('data-mermaid');
      if (raw) {
        node.removeAttribute('data-processed');
        node.textContent = decodeURIComponent(raw);
      }
    }
    try {
      await mermaid.run({ nodes });
    } catch {
      /* invalid diagram — leave the source text visible */
    }
  }
}

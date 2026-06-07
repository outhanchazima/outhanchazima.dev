import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { DatePipe, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';
import { ArticleActionsComponent } from './article-actions.component';

const SITE_URL = 'https://outhanchazima.dev';

@Component({
  selector: 'app-blog-post',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, NgOptimizedImage, ArticleActionsComponent],
  template: `
    @if (post(); as p) {
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
                      <a [href]="'#' + item.id">{{ item.text }}</a>
                    </li>
                  }
                </ul>
              </aside>
            }

            <div class="prose" [innerHTML]="safeHtml()"></div>
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

          <a class="post-back" routerLink="/blog">← All posts</a>
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
  `,
})
export class BlogPostComponent {
  private readonly blog = inject(BlogService);
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);

  /** Bound from the `:slug` route param (withComponentInputBinding). */
  readonly slug = input<string>('');

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
      const image = p.cover ? `${SITE_URL}${p.cover}` : `${SITE_URL}/og-image.png`;
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
  }
}

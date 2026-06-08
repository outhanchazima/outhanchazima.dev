import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';
import { EchoTitleDirective } from '../../shared/echo-title.directive';
import { SpotlightDirective } from '../../shared/spotlight.directive';

const SITE_URL = 'https://outhanchazima.dev';

@Component({
  selector: 'app-blog-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, NgOptimizedImage, EchoTitleDirective, SpotlightDirective],
  template: `
    <section class="section blog-index">
      <div class="wrap">
        <div class="sec-head">
          <div><span class="tag">Engineering notes</span><h2 echo>Blog</h2></div>
          <a class="sec-num blog-rss" href="/rss.xml" target="_blank" rel="noopener">RSS ↗</a>
        </div>

        <div class="blog-controls">
          <input
            type="search"
            class="blog-search"
            placeholder="Search posts…"
            aria-label="Search posts"
            [value]="query()"
            (input)="query.set($any($event.target).value)"
          />
          <div class="blog-tags" role="group" aria-label="Filter by tag">
            <button type="button" class="topic-pill" [class.active]="!activeTag()" (click)="activeTag.set(null)">
              All
            </button>
            @for (t of tags; track t) {
              <button
                type="button"
                class="topic-pill"
                [class.active]="activeTag() === t"
                (click)="toggleTag(t)"
              >
                {{ t }}
              </button>
            }
          </div>
        </div>

        <div class="blog-grid">
          @for (post of filtered(); track post.slug) {
            <a class="blog-card" [routerLink]="['/blog', post.slug]" appSpotlight>
              @if (post.cover) {
                <span class="blog-card-cover">
                  <img [ngSrc]="post.cover" fill [alt]="post.title" sizes="(max-width: 760px) 100vw, 360px" />
                </span>
              }
              <span class="blog-card-body">
                <span class="blog-card-meta">
                  <time [attr.datetime]="post.date">{{ post.date | date: 'mediumDate' }}</time>
                  <span aria-hidden="true">·</span>
                  <span>{{ post.readingTime }}</span>
                </span>
                <h3>{{ post.title }}</h3>
                <p>{{ post.description }}</p>
                <span class="chips">
                  @for (t of post.tags; track t) {
                    <span class="chip">{{ t }}</span>
                  }
                </span>
              </span>
            </a>
          } @empty {
            <p class="blog-empty">No posts match your search.</p>
          }
        </div>
      </div>
    </section>
  `,
})
export class BlogListComponent implements OnInit {
  private readonly blog = inject(BlogService);
  private readonly seo = inject(SeoService);

  protected readonly tags = this.blog.tags();
  protected readonly query = signal('');
  protected readonly activeTag = signal<string | null>(null);

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const tag = this.activeTag();
    return this.blog.posts.filter((p) => {
      const matchesTag = !tag || p.tags.includes(tag);
      const matchesQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q));
      return matchesTag && matchesQuery;
    });
  });

  protected toggleTag(tag: string): void {
    this.activeTag.update((t) => (t === tag ? null : tag));
  }

  ngOnInit(): void {
    this.seo.apply({
      title: 'Blog — Outhan Chazima',
      description:
        'Engineering notes on system design, distributed systems, payments and applied AI by Outhan Chazima.',
      url: `${SITE_URL}/blog`,
      image: `${SITE_URL}/og-image.png`,
      keywords: this.tags.join(', '),
    });
    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'Blog',
      name: 'Outhan Chazima — Blog',
      url: `${SITE_URL}/blog`,
      blogPost: this.blog.posts.map((p) => ({
        '@type': 'BlogPosting',
        headline: p.title,
        url: `${SITE_URL}/blog/${p.slug}`,
        datePublished: p.date,
        keywords: p.keywords,
      })),
    });
  }
}

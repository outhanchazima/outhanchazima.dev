import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../shared/reveal.directive';
import { EchoTitleDirective } from '../../shared/echo-title.directive';
import { BlogService } from '../../core/services/blog.service';

interface WritingEntry {
  readonly ref: string;
  readonly slug: string;
  readonly title: string;
  readonly blurb: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Formats an ISO date ("2026-06-07T…") to "7 Jun 2026" without Date globals. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ''} ${y}`;
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

@Component({
  selector: 'app-writing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, EchoTitleDirective],
  template: `
    <section id="writing" class="section">
      <div class="wrap">
        <div class="sec-head" appReveal>
          <div><span class="tag">Knowledge sharing</span><h2 echo>Writing &amp; notes</h2></div>
          <span class="sec-num">SEC.04 / OUTPUT</span>
        </div>
        <div class="posts">
          @for (post of posts; track post.slug) {
            <a class="post" appReveal [routerLink]="['/blog', post.slug]">
              <span class="pn">{{ post.ref }}</span>
              <div>
                <h3>{{ post.title }}</h3>
                <small>{{ post.blurb }}</small>
              </div>
              <span class="arr" aria-hidden="true">→</span>
            </a>
          }
        </div>
        <div style="margin-top:24px;text-align:center">
          <a class="btn ghost" routerLink="/blog">Read all posts →</a>
        </div>
      </div>
    </section>
  `,
})
export class WritingComponent {
  private readonly blog = inject(BlogService);

  /** The three most recent native blog posts, linked internally to /blog/:slug. */
  protected readonly posts: readonly WritingEntry[] = this.blog.posts.slice(0, 3).map((p, i) => ({
    ref: `LOG.${String(i + 1).padStart(3, '0')}`,
    slug: p.slug,
    title: p.title,
    blurb: `${formatDate(p.date)} · ${p.readingTime} · ${truncate(p.description, 96)}`,
  }));
}

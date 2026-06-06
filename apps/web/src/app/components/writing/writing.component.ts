import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PORTFOLIO } from '../../core/data/portfolio.data';
import { RevealDirective } from '../../shared/reveal.directive';
import { EchoTitleDirective } from '../../shared/echo-title.directive';
import { MediumService, MediumPost } from '../../core/services/medium.service';

interface Post {
  ref: string;
  title: string;
  blurb: string;
  url: string;
}

@Component({
  selector: 'app-writing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective, EchoTitleDirective],
  template: `
    <section id="writing" class="section">
      <div class="wrap">
        <div class="sec-head" appReveal>
          <div><span class="tag">Knowledge sharing</span><h2 echo>Writing &amp; notes</h2></div>
          <span class="sec-num">SEC.04 / OUTPUT</span>
        </div>
        <div class="posts">
          @for (post of posts(); track post.ref) {
            <a class="post" appReveal [href]="post.url" target="_blank" rel="noopener noreferrer">
              <span class="pn">{{ post.ref }}</span>
              <div>
                <h3>{{ post.title }}</h3>
                <small>{{ post.blurb }}</small>
              </div>
              <span class="arr" aria-hidden="true">→</span>
            </a>
          }
        </div>
      </div>
    </section>
  `,
})
export class WritingComponent {
  private readonly medium = inject(MediumService);
  private readonly livePosts = toSignal(this.medium.load(), {
    initialValue: [] as MediumPost[],
  });

  /** Live Medium posts when available, otherwise the curated static list. */
  protected readonly posts = computed<readonly Post[]>(() => {
    const live = this.livePosts();
    if (live.length) {
      return live.map((p, i) => ({
        ref: `LOG.${String(i + 1).padStart(3, '0')}`,
        title: p.title,
        blurb: p.date ? `${p.date} · ${p.blurb}` : p.blurb,
        url: p.url,
      }));
    }
    return PORTFOLIO.writing;
  });
}

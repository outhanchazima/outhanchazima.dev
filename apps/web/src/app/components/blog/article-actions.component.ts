import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

/**
 * Article "actions" dropdown — Copy URL, Copy / View as Markdown, and
 * "Open in ChatGPT / Claude" deep links. Closes on outside-click or Escape.
 */
@Component({
  selector: 'app-article-actions',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'close()',
  },
  template: `
    <div class="actions">
      <button
        type="button"
        class="actions-trigger"
        [class.open]="open()"
        (click)="toggle()"
        [attr.aria-expanded]="open()"
        aria-haspopup="menu"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
        <span>{{ label() }}</span>
        <span class="actions-caret" aria-hidden="true">⌄</span>
      </button>

      @if (open()) {
        <div class="actions-menu" role="menu">
          <button type="button" role="menuitem" (click)="copyUrl()">Copy URL</button>
          <button type="button" role="menuitem" (click)="copyMarkdown()">Copy as Markdown</button>
          <a role="menuitem" [href]="markdownUrl()" target="_blank" rel="noopener noreferrer">
            View as Markdown <span aria-hidden="true">↗</span>
          </a>
          <div class="actions-sep"></div>
          <a role="menuitem" [href]="xUrl()" target="_blank" rel="noopener noreferrer" (click)="close()">
            Share on X <span aria-hidden="true">↗</span>
          </a>
          <a role="menuitem" [href]="linkedInUrl()" target="_blank" rel="noopener noreferrer" (click)="close()">
            Share on LinkedIn <span aria-hidden="true">↗</span>
          </a>
          <a role="menuitem" [href]="whatsappUrl()" target="_blank" rel="noopener noreferrer" (click)="close()">
            Share on WhatsApp <span aria-hidden="true">↗</span>
          </a>
          <div class="actions-sep"></div>
          <a role="menuitem" [href]="chatgptUrl()" target="_blank" rel="noopener noreferrer">
            Open in ChatGPT <span aria-hidden="true">↗</span>
          </a>
          <a role="menuitem" [href]="claudeUrl()" target="_blank" rel="noopener noreferrer">
            Open in Claude <span aria-hidden="true">↗</span>
          </a>
        </div>
      }
    </div>
  `,
})
export class ArticleActionsComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly url = input.required<string>();
  readonly title = input.required<string>();
  readonly markdownUrl = input.required<string>();

  protected readonly open = signal(false);
  private readonly feedback = signal<string | null>(null);
  protected readonly label = computed(() => this.feedback() ?? 'Share');

  private prompt(): string {
    return `Read and summarise this article: ${this.title()} — ${this.url()}`;
  }
  protected readonly chatgptUrl = computed(
    () => `https://chatgpt.com/?q=${encodeURIComponent(this.prompt())}`,
  );
  protected readonly claudeUrl = computed(
    () => `https://claude.ai/new?q=${encodeURIComponent(this.prompt())}`,
  );

  protected readonly xUrl = computed(
    () =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.title())}&url=${encodeURIComponent(this.url())}`,
  );
  protected readonly linkedInUrl = computed(
    () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(this.url())}`,
  );
  protected readonly whatsappUrl = computed(
    () => `https://wa.me/?text=${encodeURIComponent(`${this.title()} ${this.url()}`)}`,
  );

  protected toggle(): void {
    this.open.update((o) => !o);
  }
  protected close(): void {
    this.open.set(false);
  }

  protected onDocumentClick(event: Event): void {
    if (this.open() && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  protected async copyUrl(): Promise<void> {
    await this.copy(this.url(), 'Copied URL!');
  }

  protected async copyMarkdown(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      const res = await fetch(this.markdownUrl());
      const text = await res.text();
      await this.copy(text, 'Copied Markdown!');
    } catch {
      this.flash('Copy failed');
    }
  }

  private async copy(text: string, ok: string): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      await this.document.defaultView?.navigator.clipboard.writeText(text);
      this.flash(ok);
    } catch {
      this.flash('Copy failed');
    }
    this.close();
  }

  private flash(msg: string): void {
    this.feedback.set(msg);
    this.document.defaultView?.setTimeout(() => this.feedback.set(null), 1800);
  }
}

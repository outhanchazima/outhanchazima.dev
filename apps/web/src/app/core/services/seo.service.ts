import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoConfig {
  title: string;
  description: string;
  url: string;
  image: string;
}

/**
 * Centralises document title, meta description and Open Graph / Twitter tags.
 * Runs on the server during SSR so crawlers and link unfurlers see fully
 * populated tags in the initial HTML.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  apply(config: SeoConfig): void {
    this.title.setTitle(config.title);

    this.setName('description', config.description);
    this.setName('twitter:title', config.title);
    this.setName('twitter:description', config.description);
    this.setName('twitter:image', config.image);
    this.setName('twitter:card', 'summary_large_image');

    this.setProperty('og:title', config.title);
    this.setProperty('og:description', config.description);
    this.setProperty('og:url', config.url);
    this.setProperty('og:image', config.image);
    this.setProperty('og:type', 'website');

    this.setCanonical(config.url);
  }

  /** Injects a JSON-LD structured-data block into <head>. */
  setJsonLd(schema: Record<string, unknown>): void {
    const id = 'structured-data';
    const head = this.document.head;
    let script = head.querySelector<HTMLScriptElement>(`script#${id}`);
    if (!script) {
      script = this.document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);
  }

  private setName(name: string, content: string): void {
    this.meta.updateTag({ name, content });
  }

  private setProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content });
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}

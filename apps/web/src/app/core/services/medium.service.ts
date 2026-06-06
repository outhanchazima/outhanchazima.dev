import { Injectable, PLATFORM_ID, TransferState, inject, makeStateKey } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, catchError } from 'rxjs';

export interface MediumPost {
  title: string;
  url: string;
  date: string;
  blurb: string;
}

const FEED_URL = 'https://medium.com/feed/@outhan254';
const STATE_KEY = makeStateKey<MediumPost[]>('medium-posts');

/**
 * Loads the latest Medium posts. Medium's RSS has no CORS headers, so we fetch
 * + parse on the SERVER during SSR and ship the result to the client via
 * TransferState — the browser never calls Medium directly. Returns `[]` on any
 * failure so callers can fall back to static content.
 */
@Injectable({ providedIn: 'root' })
export class MediumService {
  private readonly http = inject(HttpClient);
  private readonly state = inject(TransferState);
  private readonly platformId = inject(PLATFORM_ID);

  load(): Observable<MediumPost[]> {
    const cached = this.state.get(STATE_KEY, null);
    if (cached) {
      return of(cached);
    }
    // Only the server fetches the feed; the client reads the transferred state.
    if (isPlatformBrowser(this.platformId)) {
      return of([]);
    }
    return this.http.get(FEED_URL, { responseType: 'text' }).pipe(
      map((xml) => parseFeed(xml)),
      map((posts) => {
        this.state.set(STATE_KEY, posts);
        return posts;
      }),
      catchError(() => of([])),
    );
  }
}

/** Minimal, dependency-free RSS parse (runs in the Node/SSR runtime). */
function parseFeed(xml: string): MediumPost[] {
  const items = xml.split('<item>').slice(1, 6);
  return items.map((raw) => {
    const block = raw.split('</item>')[0];
    const pick = (tag: string): string => {
      const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
      return m ? clean(m[1]) : '';
    };
    const contentText = stripHtml(pick('content:encoded') || pick('description'));
    return {
      title: pick('title'),
      url: pick('link').split('?')[0],
      date: formatDate(pick('pubDate')),
      blurb: truncate(contentText, 120),
    };
  });
}

function clean(s: string): string {
  return s
    .replace(/<!\[CDATA\[/g, '')
    .replace(/\]\]>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function stripHtml(s: string): string {
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n).trim()}…` : s;
}

function formatDate(pubDate: string): string {
  if (!pubDate) return '';
  const ms = Date.parse(pubDate);
  if (Number.isNaN(ms)) return '';
  const d = new Date(ms);
  return `${d.toLocaleString('en-US', { month: 'short' })} ${d.getFullYear()}`;
}

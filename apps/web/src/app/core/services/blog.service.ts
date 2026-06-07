import { Injectable } from '@angular/core';
import { BLOG_POSTS, BlogPost } from '../data/blog.generated';

/** Read-only access to the build-time-generated blog data. */
@Injectable({ providedIn: 'root' })
export class BlogService {
  /** All published posts, newest first. */
  readonly posts: readonly BlogPost[] = BLOG_POSTS;

  bySlug(slug: string): BlogPost | undefined {
    return this.posts.find((p) => p.slug === slug);
  }

  /** Unique tags across all posts, alphabetical. */
  tags(): string[] {
    return [...new Set(this.posts.flatMap((p) => p.tags))].sort((a, b) => a.localeCompare(b));
  }

  /** Newer ("next") and older ("prev") neighbours for a post. */
  adjacent(slug: string): { prev?: BlogPost; next?: BlogPost } {
    const i = this.posts.findIndex((p) => p.slug === slug);
    if (i < 0) return {};
    return { next: this.posts[i - 1], prev: this.posts[i + 1] };
  }

  /** Posts sharing the most tags with the given one. */
  related(slug: string, limit = 3): BlogPost[] {
    const post = this.bySlug(slug);
    if (!post) return [];
    return this.posts
      .filter((p) => p.slug !== slug)
      .map((p) => ({ p, score: p.tags.filter((t) => post.tags.includes(t)).length }))
      .sort((a, b) => b.score - a.score || b.p.date.localeCompare(a.p.date))
      .slice(0, limit)
      .map((x) => x.p);
  }
}

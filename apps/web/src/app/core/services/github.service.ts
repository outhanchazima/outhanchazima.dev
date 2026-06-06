import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, of, catchError } from 'rxjs';

export interface GithubStats {
  repos: number;
  followers: number;
  stars: number;
  topLanguage: string;
}

/** Only the fields we actually read from the GitHub REST API. */
interface GithubProfile {
  public_repos: number;
  followers: number;
}
interface GithubRepo {
  stargazers_count: number;
  language: string | null;
  fork: boolean;
}

const USER = 'outhanchazima';
const HEADERS = { Accept: 'application/vnd.github+json' };

/**
 * Fetches public GitHub stats. Runs during SSR and is transferred to the client
 * via Angular's HTTP transfer cache, so there's no second request on hydration.
 * Any failure (e.g. unauthenticated rate limit) resolves to `null` so the UI
 * can fall back to static numbers.
 */
@Injectable({ providedIn: 'root' })
export class GithubService {
  private readonly http = inject(HttpClient);

  load(): Observable<GithubStats | null> {
    return forkJoin({
      profile: this.http.get<GithubProfile>(`https://api.github.com/users/${USER}`, {
        headers: HEADERS,
      }),
      repos: this.http.get<GithubRepo[]>(
        `https://api.github.com/users/${USER}/repos?per_page=100&sort=updated`,
        { headers: HEADERS },
      ),
    }).pipe(
      map(({ profile, repos }) => {
        const owned = repos.filter((r) => !r.fork);
        const stars = owned.reduce((sum, r) => sum + (r.stargazers_count || 0), 0);
        const langs = new Map<string, number>();
        for (const r of owned) {
          if (r.language) langs.set(r.language, (langs.get(r.language) ?? 0) + 1);
        }
        const topLanguage = [...langs.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';
        return { repos: profile.public_repos, followers: profile.followers, stars, topLanguage };
      }),
      catchError(() => of(null)),
    );
  }
}

import { DOCUMENT, Injectable, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

/**
 * Manages the light/dark theme. Light is the default. The chosen theme is
 * persisted to localStorage and reflected as a `.dark` class on <html>.
 *
 * SSR-safe: all DOM/storage access is guarded by the platform check. The
 * no-flash inline script in index.html applies the stored theme before the
 * app boots, so this service only needs to stay in sync afterwards.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly themeSignal = signal<Theme>(this.readInitialTheme());

  readonly theme = this.themeSignal.asReadonly();
  readonly isDark = computed(() => this.themeSignal() === 'dark');

  toggle(): void {
    this.setTheme(this.themeSignal() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
    if (!this.isBrowser) {
      return;
    }
    const root = this.document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable (private mode) — non-fatal */
    }
  }

  private readInitialTheme(): Theme {
    if (!this.isBrowser) {
      return 'light';
    }
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch {
      /* ignore */
    }
    // Default is light; the DOM class set by the inline bootstrap wins on load.
    return this.document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  }
}

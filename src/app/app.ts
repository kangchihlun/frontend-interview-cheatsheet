import { Component, DOCUMENT, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NAV_TABS } from './app.routes';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly tabs = NAV_TABS;
  protected readonly theme = signal<'dark' | 'light'>(
    (localStorageGet('theme') as 'dark' | 'light' | null) ?? 'dark',
  );
  private readonly doc = inject(DOCUMENT);

  constructor() {
    // signal 改變 → effect 同步到 <html data-theme>，CSS 變數立即切換
    effect(() => {
      this.doc.documentElement.dataset['theme'] = this.theme();
      localStorageSet('theme', this.theme());
    });
  }

  protected toggleTheme() {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }
}

function localStorageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function localStorageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 無痕模式等情況忽略 */
  }
}

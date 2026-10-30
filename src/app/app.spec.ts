import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { App } from './app';
import { NAV_TABS } from './app.routes';

describe('App', () => {
  it('渲染所有頁籤', async () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const links = (fixture.nativeElement as HTMLElement).querySelectorAll('.tabbar a');
    expect(links.length).toBe(NAV_TABS.length);
  });

  it('切換主題會改變 <html data-theme>', async () => {
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const before = document.documentElement.dataset['theme'];
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('.topbar button')!.click();
    await fixture.whenStable();
    expect(document.documentElement.dataset['theme']).not.toBe(before);
  });
});

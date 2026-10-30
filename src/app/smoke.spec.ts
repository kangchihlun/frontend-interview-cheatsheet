import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NAV_TABS, routes } from './app.routes';
import { authInterceptor, loggingInterceptor, mockBackendInterceptor, retryInterceptor } from './pages/http/interceptors';

/** 冒煙測試：每個頁籤、每個子頁籤都實際渲染一次，任何例外或 console.error 都算失敗 */
describe('Smoke：所有頁籤與子頁籤都能渲染', () => {
  const errors: unknown[] = [];

  beforeEach(() => {
    errors.length = 0;
    vi.spyOn(console, 'error').mockImplementation((...args) => errors.push(args));
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor, loggingInterceptor, retryInterceptor, mockBackendInterceptor])),
        { provide: ErrorHandler, useValue: { handleError: (e: unknown) => errors.push(e) } },
      ],
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it.each(NAV_TABS.map((t) => [t.path]))('/%s', async (path) => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(`/${path}`);
    const root = harness.routeNativeElement!;
    expect(root.querySelector('h1')?.textContent?.length).toBeGreaterThan(0);

    const subTabs = root.querySelectorAll<HTMLButtonElement>('app-sub-tabs button');
    expect(subTabs.length).toBeGreaterThan(0);
    for (const tab of Array.from(subTabs)) {
      tab.click();
      await harness.fixture.whenStable();
      // 每個 demo 卡片的原始碼分頁也切一次
      for (const v of Array.from(root.querySelectorAll<HTMLButtonElement>('app-demo nav button'))) {
        v.click();
        await harness.fixture.whenStable();
      }
    }
    harness.fixture.destroy();
    expect(errors).toEqual([]);
  });
});

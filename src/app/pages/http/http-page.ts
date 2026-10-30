import { Component, signal } from '@angular/core';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { HttpDemo } from './http-demo';
import { HTTP_QA } from './http.qa';
// @ts-ignore
import demoSrc from './http-demo.ts' with { loader: 'text' };
// @ts-ignore
import interceptorsSrc from './interceptors.ts' with { loader: 'text' };
// @ts-ignore
import apiSrc from './orders-api.ts' with { loader: 'text' };

@Component({
  selector: 'app-http-page',
  imports: [PageHeader, SubTabs, DemoCard, QaList, HttpDemo],
  template: `
    <app-page-header
      title="RESTful API / HTTP"
      intro="HttpClient + 函式型攔截器（auth、logging、retry）+ httpResource。/api/* 由 mockBackendInterceptor 模擬，所以不需要真的後端也能跑。"
    />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />
    @switch (active()) {
      @case ('demo') {
        <app-demo title="訂單 CRUD + 攔截器" desc="分頁、篩選、新增、部分更新、刪除、錯誤處理、重試、授權。" [ts]="demoSrc">
          <app-http-demo />
        </app-demo>
      }
      @case ('src') {
        <app-demo title="interceptors.ts" desc="authInterceptor / loggingInterceptor / retryInterceptor / mockBackendInterceptor" [ts]="interceptorsSrc">
          <p class="muted">切到 TS 分頁查看。註冊方式：<code>provideHttpClient(withFetch(), withInterceptors([...]))</code></p>
        </app-demo>
        <app-demo title="orders-api.ts" desc="以 REST 資源為單位封裝 service" [ts]="apiSrc">
          <p class="muted">切到 TS 分頁查看。</p>
        </app-demo>
      }
      @default {
        <app-qa-list heading="REST / HTTP 面試題" [items]="qa" />
      }
    }
  `,
})
export default class HttpPage {
  protected readonly tabs: TabDef[] = [
    { id: 'demo', label: 'CRUD Demo' },
    { id: 'src', label: '攔截器原始碼' },
    { id: 'qa', label: '📝 REST / HTTP 考題' },
  ];
  protected readonly active = signal('demo');
  protected readonly qa = HTTP_QA;
  protected readonly demoSrc = demoSrc;
  protected readonly interceptorsSrc = interceptorsSrc;
  protected readonly apiSrc = apiSrc;
}

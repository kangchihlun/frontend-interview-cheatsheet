import { Component, computed, signal } from '@angular/core';
import { CodeBlock } from '../../shared/code-block';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { TESTING_QA } from './testing.qa';

// 這些就是專案中真正會被 `ng test` 執行的 spec 檔
// @ts-ignore
import appSpec from '../../app.spec.ts' with { loader: 'text' };
// @ts-ignore
import qaSpec from '../../shared/qa-list.spec.ts' with { loader: 'text' };
// @ts-ignore
import signalsSpec from '../angular/demos/signals-demo.spec.ts' with { loader: 'text' };
// @ts-ignore
import specificitySpec from '../css/specificity.spec.ts' with { loader: 'text' };
// @ts-ignore
import httpSpec from '../http/orders-api.spec.ts' with { loader: 'text' };
// @ts-ignore
import handSpec from '../js/handwritten.spec.ts' with { loader: 'text' };
// @ts-ignore
import bookSpec from '../realtime/order-book.spec.ts' with { loader: 'text' };
// @ts-ignore
import marbleSpec from '../rxjs/operators.spec.ts' with { loader: 'text' };

const SPECS: (TabDef & { desc: string; code: string })[] = [
  { id: 'component', label: '元件測試', desc: 'TestBed + setInput + whenStable（zoneless）+ DOM 斷言', code: qaSpec },
  { id: 'signals', label: 'Signals / Validator', desc: '點擊後驗證 linkedSignal 與 computed；純函式 validator 直接呼叫', code: signalsSpec },
  { id: 'http', label: 'HttpTestingController', desc: 'provideHttpClientTesting、expectOne、flush、verify、攔截器測試', code: httpSpec },
  { id: 'marble', label: 'RxJS Marble', desc: 'TestScheduler 虛擬時間測 debounce / switchMap / exhaustMap', code: marbleSpec },
  { id: 'timers', label: 'Fake Timers', desc: 'vi.useFakeTimers 測 debounce / throttle；it.each 參數化', code: handSpec },
  { id: 'pure', label: '純函式（委託簿）', desc: '把商業邏輯抽成純函式，最容易測也最有價值', code: bookSpec },
  { id: 'each', label: 'it.each', desc: '一組輸入輸出表格化測試', code: specificitySpec },
  { id: 'app', label: 'App 根元件', desc: 'provideRouter([]) 提供路由依賴', code: appSpec },
];

@Component({
  selector: 'app-testing-page',
  imports: [PageHeader, SubTabs, DemoCard, QaList, CodeBlock],
  template: `
    <app-page-header
      title="單元測試（Vitest）"
      intro="Angular 21 起新專案預設使用 <b>Vitest</b>（取代 Karma + Jasmine）。本專案 <code>npm test</code> 實際執行 10 個 spec 檔、58 個測試（含一個走遍所有頁籤的冒煙測試），下面顯示的是其中的代表檔案。"
    />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />
    @if (current(); as s) {
      <app-demo [title]="s.label" [desc]="s.desc">
        <app-code [code]="s.code" lang="spec.ts" />
      </app-demo>
    } @else if (active() === 'cmd') {
      <app-demo title="常用指令與設定">
        <app-code [code]="commands" lang="bash" />
      </app-demo>
    } @else {
      <app-qa-list heading="測試面試題" [items]="qa" />
    }
  `,
})
export default class TestingPage {
  protected readonly tabs: TabDef[] = [...SPECS, { id: 'cmd', label: '指令' }, { id: 'qa', label: '📝 測試考題' }];
  protected readonly active = signal('component');
  protected readonly current = computed(() => SPECS.find((s) => s.id === this.active()));
  protected readonly qa = TESTING_QA;
  protected readonly commands = `
npm test                         # = ng test，Vitest watch 模式
npx ng test --watch=false        # CI 跑一次
npx ng test --coverage           # 覆蓋率報告
npx ng test --include src/app/pages/rxjs/operators.spec.ts   # 只跑指定檔案

# 舊專案從 Karma/Jasmine 遷移到 Vitest
ng generate @schematics/angular:refactor-jasmine-vitest

# Jasmine → Vitest 對照
jasmine.createSpy()        → vi.fn()
spyOn(obj, 'm')            → vi.spyOn(obj, 'm')
and.returnValue(x)         → mockReturnValue(x)
fakeAsync / tick           → vi.useFakeTimers() / vi.advanceTimersByTime()
toHaveBeenCalledOnceWith   → toHaveBeenCalledExactlyOnceWith
`;
}

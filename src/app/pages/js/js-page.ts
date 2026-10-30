import { Component, signal } from '@angular/core';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { EventLoopQuiz } from './event-loop-quiz';
import { HandwrittenDemo } from './handwritten-demo';
import { JS_QA, TS_QA } from './js.qa';
// @ts-ignore
import handSrc from './handwritten.ts' with { loader: 'text' };

@Component({
  selector: 'app-js-page',
  imports: [PageHeader, SubTabs, DemoCard, QaList, EventLoopQuiz, HandwrittenDemo],
  template: `
    <app-page-header title="JavaScript / TypeScript" intro="Event Loop、閉包、this、原型、Promise、型別轉換，以及現場手寫題與 TypeScript 型別題。" />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />
    @switch (active()) {
      @case ('loop') {
        <app-demo title="輸出順序猜謎（實際在瀏覽器執行）" desc="同步程式 → 清空 microtask（Promise.then、queueMicrotask、await 之後）→ 執行一個 macrotask（setTimeout、事件）→ 再清空 microtask → 渲染 → …">
          <app-event-loop-quiz />
        </app-demo>
      }
      @case ('hand') {
        <app-demo title="手寫題（皆有單元測試）" desc="debounce、throttle、deepClone、Promise.all、並發控制、curry、flatten、EventEmitter、LRU、千分位、call/bind。" [ts]="handSrc">
          <app-handwritten-demo />
        </app-demo>
      }
      @case ('js') {
        <app-qa-list heading="JavaScript 面試題" [items]="jsQa" />
      }
      @default {
        <app-qa-list heading="TypeScript 面試題" [items]="tsQa" />
      }
    }
  `,
})
export default class JsPage {
  protected readonly tabs: TabDef[] = [
    { id: 'loop', label: 'Event Loop 猜謎' },
    { id: 'hand', label: '手寫題' },
    { id: 'js', label: '📝 JS 考題' },
    { id: 'ts', label: '📝 TS 考題' },
  ];
  protected readonly active = signal('loop');
  protected readonly jsQa = JS_QA;
  protected readonly tsQa = TS_QA;
  protected readonly handSrc = handSrc;
}

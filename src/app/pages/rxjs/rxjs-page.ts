import { NgComponentOutlet } from '@angular/common';
import { Component, computed, signal, Type } from '@angular/core';
import { CodeBlock } from '../../shared/code-block';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { CombinationDemo } from './demos/combination-demo';
import { ErrorRetryDemo } from './demos/error-retry-demo';
import { FlatteningDemo } from './demos/flattening-demo';
import { HotColdDemo } from './demos/hot-cold-demo';
import { RateLimitDemo } from './demos/rate-limit-demo';
import { StoreInteropDemo } from './demos/store-interop-demo';
import { SubjectsDemo } from './demos/subjects-demo';
import { TypeaheadDemo } from './demos/typeahead-demo';
import { OPERATOR_CHEATSHEET, RXJS_QA } from './rxjs.qa';

// @ts-ignore
import combSrc from './demos/combination-demo.ts' with { loader: 'text' };
// @ts-ignore
import errSrc from './demos/error-retry-demo.ts' with { loader: 'text' };
// @ts-ignore
import flatSrc from './demos/flattening-demo.ts' with { loader: 'text' };
// @ts-ignore
import hotSrc from './demos/hot-cold-demo.ts' with { loader: 'text' };
// @ts-ignore
import rateSrc from './demos/rate-limit-demo.ts' with { loader: 'text' };
// @ts-ignore
import storeSrc from './demos/store-interop-demo.ts' with { loader: 'text' };
// @ts-ignore
import subjSrc from './demos/subjects-demo.ts' with { loader: 'text' };
// @ts-ignore
import typeSrc from './demos/typeahead-demo.ts' with { loader: 'text' };

interface Demo extends TabDef {
  desc: string;
  cmp: Type<unknown>;
  ts: string;
}

const DEMOS: Demo[] = [
  { id: 'flat', label: 'switch/merge/concat/exhaust', cmp: FlatteningDemo, ts: flatSrc, desc: '最常考！四種高階映射運算子的差別，快速連點 3 次觀察。' },
  { id: 'type', label: '自動完成搜尋', cmp: TypeaheadDemo, ts: typeSrc, desc: 'debounceTime → distinctUntilChanged → filter → switchMap → catchError（放內層）。' },
  { id: 'subj', label: '4 種 Subject', cmp: SubjectsDemo, ts: subjSrc, desc: 'Subject / BehaviorSubject / ReplaySubject / AsyncSubject 對「晚到訂閱者」的差別。' },
  { id: 'comb', label: '組合運算子', cmp: CombinationDemo, ts: combSrc, desc: 'combineLatest / withLatestFrom / zip / merge / forkJoin。' },
  { id: 'err', label: '錯誤處理 / 重試', cmp: ErrorRetryDemo, ts: errSrc, desc: 'retry + 指數退避、catchError fallback、finalize、defer。' },
  { id: 'hot', label: 'Hot vs Cold / share', cmp: HotColdDemo, ts: hotSrc, desc: '多個訂閱者時來源被執行幾次？share 與 shareReplay 的差別。' },
  { id: 'rate', label: '節流 throttle/debounce', cmp: RateLimitDemo, ts: rateSrc, desc: '高頻事件的節流策略比較（交易系統行情更新的核心）。' },
  { id: 'store', label: 'scan Store / Signal 互通', cmp: StoreInteropDemo, ts: storeSrc, desc: 'Subject + scan 實作 reducer、BehaviorSubject service、toSignal / toObservable。' },
];

@Component({
  selector: 'app-rxjs-page',
  imports: [NgComponentOutlet, PageHeader, SubTabs, DemoCard, QaList, CodeBlock],
  template: `
    <app-page-header
      title="RxJS 觀念與技巧"
      intro="Observable 是「可被取消、可組合的非同步事件流」。交易系統的 WebSocket 行情、搜尋、重試、節流都靠它。RxJS 7.8（Angular 22 預設版本）。"
    />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />
    @switch (active()) {
      @case ('sheet') {
        <app-demo title="運算子速查表" desc="面試時能說出「情境 → 運算子」最加分。">
          <app-code [code]="sheet" lang="text" />
        </app-demo>
      }
      @case ('qa') {
        <app-qa-list heading="RxJS 面試題" [items]="qa" />
      }
      @default {
        @if (current(); as d) {
          <app-demo [title]="d.label" [desc]="d.desc" [ts]="d.ts">
            <ng-container *ngComponentOutlet="d.cmp" />
          </app-demo>
        }
      }
    }
  `,
})
export default class RxjsPage {
  protected readonly tabs: TabDef[] = [...DEMOS, { id: 'sheet', label: '運算子速查' }, { id: 'qa', label: '📝 RxJS 考題' }];
  protected readonly active = signal('flat');
  protected readonly current = computed(() => DEMOS.find((d) => d.id === this.active()));
  protected readonly qa = RXJS_QA;
  protected readonly sheet = OPERATOR_CHEATSHEET;
}

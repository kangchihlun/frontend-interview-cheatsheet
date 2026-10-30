/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NgComponentOutlet } from '@angular/common';
import { Component, computed, signal, Type } from '@angular/core';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { ANGULAR_QA } from './angular.qa';
import { ComponentIoDemo } from './demos/component-io-demo';
import { ControlFlowDemo } from './demos/control-flow-demo';
import { DiDemo } from './demos/di-demo';
import { DirectivePipeDemo } from './demos/directive-pipe-demo';
import { ReactiveFormsDemo } from './demos/reactive-forms-demo';
import { ResourceDemo } from './demos/resource-demo';
import { SignalFormsDemo } from './demos/signal-forms-demo';
import { SignalsDemo } from './demos/signals-demo';

// 以純文字匯入 demo 原始碼，讓「TS」分頁顯示的就是實際執行的程式
// @ts-ignore
import ioSrc from './demos/component-io-demo.ts' with { loader: 'text' };
// @ts-ignore
import cfSrc from './demos/control-flow-demo.ts' with { loader: 'text' };
// @ts-ignore
import diSrc from './demos/di-demo.ts' with { loader: 'text' };
// @ts-ignore
import dirSrc from './demos/directive-pipe-demo.ts' with { loader: 'text' };
// @ts-ignore
import rfSrc from './demos/reactive-forms-demo.ts' with { loader: 'text' };
// @ts-ignore
import resSrc from './demos/resource-demo.ts' with { loader: 'text' };
// @ts-ignore
import sfSrc from './demos/signal-forms-demo.ts' with { loader: 'text' };
// @ts-ignore
import sigSrc from './demos/signals-demo.ts' with { loader: 'text' };

interface Demo extends TabDef {
  desc: string;
  cmp: Type<unknown>;
  ts: string;
}

const DEMOS: Demo[] = [
  { id: 'signals', label: 'Signals', cmp: SignalsDemo, ts: sigSrc, desc: 'signal / computed / linkedSignal / effect / untracked。' },
  { id: 'io', label: 'input / output / model', cmp: ComponentIoDemo, ts: ioSrc, desc: '元件溝通：signal-based input（含 required、transform）、model 雙向綁定、output、viewChild。' },
  { id: 'cf', label: 'Control Flow / @defer', cmp: ControlFlowDemo, ts: cfSrc, desc: '@if / @for (track) / @switch / @let / @defer。在輸入框打字後按「打亂」，可觀察 track 讓 DOM 跟著資料移動而不是重建。' },
  { id: 'res', label: 'resource / rxResource', cmp: ResourceDemo, ts: resSrc, desc: '非同步資料變成 signal：status、isLoading、error、reload、set；搭配 Angular 22 的 debounced()。' },
  { id: 'sf', label: 'Signal Forms', cmp: SignalFormsDemo, ts: sfSrc, desc: 'Angular 22 的 Signal Forms（@angular/forms/signals）：form()、[formField]、schema 驗證、跨欄位驗證、submit()。' },
  { id: 'rf', label: 'Reactive Forms', cmp: ReactiveFormsDemo, ts: rfSrc, desc: '既有專案最常見：FormBuilder.nonNullable、自訂 / 跨欄位 validator、FormArray、toSignal(statusChanges)。' },
  { id: 'di', label: '依賴注入 DI', cmp: DiDemo, ts: diSrc, desc: '@Service()、@Injectable、InjectionToken、元件層級 providers 造成的階層式 injector。' },
  { id: 'dir', label: 'Directive / Pipe', cmp: DirectivePipeDemo, ts: dirSrc, desc: '屬性型 directive（host 綁定 + effect）、Renderer2、純 pipe。' },
];

@Component({
  selector: 'app-angular-page',
  imports: [NgComponentOutlet, PageHeader, SubTabs, DemoCard, QaList],
  template: `
    <app-page-header
      title="Angular 22"
      intro="Angular 22 預設：standalone、zoneless、<b>OnPush 為預設變更偵測</b>、Vitest 單元測試、Signal Forms 正式版、新增 <code>&#64;Service()</code> 與 <code>debounced()</code>。所有 demo 都在本專案（Angular 22.2）實際執行。"
    />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />
    @if (current(); as d) {
      <app-demo [title]="d.label" [desc]="d.desc" [ts]="d.ts">
        <ng-container *ngComponentOutlet="d.cmp" />
      </app-demo>
    } @else {
      <app-qa-list heading="Angular 面試題" [items]="qa" />
    }
  `,
})
export default class AngularPage {
  protected readonly tabs: TabDef[] = [...DEMOS, { id: 'qa', label: '📝 Angular 考題' }];
  protected readonly active = signal('signals');
  protected readonly current = computed(() => DEMOS.find((d) => d.id === this.active()));
  protected readonly qa = ANGULAR_QA;
}

import { NgComponentOutlet } from '@angular/common';
import { Component, computed, signal, Type } from '@angular/core';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { LAYOUT_QA } from './layout.qa';

import { AdminSidebar } from './demos/admin-sidebar/admin-sidebar';
import adminHtml from './demos/admin-sidebar/admin-sidebar.html' with { loader: 'text' };
import adminScss from './demos/admin-sidebar/admin-sidebar.scss' with { loader: 'text' };
import { Centering } from './demos/centering/centering';
import centeringHtml from './demos/centering/centering.html' with { loader: 'text' };
import centeringScss from './demos/centering/centering.scss' with { loader: 'text' };
import { FlexSplit } from './demos/flex-split/flex-split';
import flexHtml from './demos/flex-split/flex-split.html' with { loader: 'text' };
import flexScss from './demos/flex-split/flex-split.scss' with { loader: 'text' };
import { GridSplit } from './demos/grid-split/grid-split';
import gridHtml from './demos/grid-split/grid-split.html' with { loader: 'text' };
import gridScss from './demos/grid-split/grid-split.scss' with { loader: 'text' };
import { HolyGrail } from './demos/holy-grail/holy-grail';
import holyHtml from './demos/holy-grail/holy-grail.html' with { loader: 'text' };
import holyScss from './demos/holy-grail/holy-grail.scss' with { loader: 'text' };
import { NestedLayout } from './demos/nested-layout/nested-layout';
import nestedHtml from './demos/nested-layout/nested-layout.html' with { loader: 'text' };
import nestedScss from './demos/nested-layout/nested-layout.scss' with { loader: 'text' };
import { Responsive } from './demos/responsive/responsive';
import rwdHtml from './demos/responsive/responsive.html' with { loader: 'text' };
import rwdScss from './demos/responsive/responsive.scss' with { loader: 'text' };
import { SplitPane } from './demos/split-pane/split-pane';
import splitHtml from './demos/split-pane/split-pane.html' with { loader: 'text' };
import splitScss from './demos/split-pane/split-pane.scss' with { loader: 'text' };
import { StickyScroll } from './demos/sticky-scroll/sticky-scroll';
import stickyHtml from './demos/sticky-scroll/sticky-scroll.html' with { loader: 'text' };
import stickyScss from './demos/sticky-scroll/sticky-scroll.scss' with { loader: 'text' };
import { TradingDashboard } from './demos/trading-dashboard/trading-dashboard';
import tradingHtml from './demos/trading-dashboard/trading-dashboard.html' with { loader: 'text' };
import tradingScss from './demos/trading-dashboard/trading-dashboard.scss' with { loader: 'text' };

interface LayoutDemo extends TabDef {
  desc: string;
  cmp: Type<unknown>;
  html: string;
  scss: string;
}

const DEMOS: LayoutDemo[] = [
  { id: 'flex', label: 'Flex 分割', cmp: FlexSplit, html: flexHtml, scss: flexScss, desc: '固定+自適應、等分、比例、換行、主軸分配、margin-left: auto。' },
  { id: 'grid', label: 'Grid 分割', cmp: GridSplit, html: gridHtml, scss: gridScss, desc: '12 欄系統（SCSS @for 產生）、grid-template-areas、auto-fit/minmax、跨列、subgrid。' },
  { id: 'holy', label: '聖杯 / Sticky Footer', cmp: HolyGrail, html: holyHtml, scss: holyScss, desc: 'Grid 與 Flex 兩種聖杯佈局，內容少時 footer 依然貼底；&lt; 768px 自動變單欄。' },
  { id: 'nested', label: '多層級巢狀', cmp: NestedLayout, html: nestedHtml, scss: nestedScss, desc: '5 層 grid/flex 巢狀，示範高度傳遞與 <code>min-height: 0</code> 讓最內層獨立捲動。' },
  { id: 'admin', label: 'Admin 側邊導航', cmp: AdminSidebar, html: adminHtml, scss: adminScss, desc: '可收合側欄、無限層級遞迴選單、收合 flyout、麵包屑、手機 off-canvas 抽屜。' },
  { id: 'sticky', label: 'Sticky / 捲動區', cmp: StickyScroll, html: stickyHtml, scss: stickyScss, desc: '表頭+首欄雙向 sticky、分組 sticky 標題、固定 header/footer 的捲動面板。' },
  { id: 'center', label: '置中', cmp: Centering, html: centeringHtml, scss: centeringScss, desc: '六種常考的水平垂直置中寫法。' },
  { id: 'rwd', label: 'RWD 響應式', cmp: Responsive, html: rwdHtml, scss: rwdScss, desc: 'Container Query、行動優先 Media Query mixin、clamp() 流體字級、aspect-ratio。' },
  { id: 'split', label: '可拖拉分割視窗', cmp: SplitPane, html: splitHtml, scss: splitScss, desc: 'Pointer Events + signal 控制 flex-basis，巢狀水平/垂直分割。' },
  { id: 'trading', label: '交易看板', cmp: TradingDashboard, html: tradingHtml, scss: tradingScss, desc: '綜合題：交易終端機版面，container query 三段式切換、委託簿深度條。' },
];

@Component({
  selector: 'app-layout-page',
  imports: [NgComponentOutlet, DemoCard, PageHeader, QaList, SubTabs],
  template: `
    <app-page-header
      title="SCSS 排版實戰"
      intro="每個 demo 都是真實編譯的 Angular 元件，切到「HTML / SCSS」分頁看到的就是渲染這個畫面的同一份原始碼。"
    />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />

    @if (current(); as d) {
      <app-demo [title]="d.label" [desc]="d.desc" [html]="d.html" [scss]="d.scss">
        <ng-container *ngComponentOutlet="d.cmp" />
      </app-demo>
    } @else {
      <app-qa-list heading="排版面試題" [items]="qa" />
    }
  `,
})
export default class LayoutPage {
  protected readonly qa = LAYOUT_QA;
  protected readonly tabs: TabDef[] = [...DEMOS, { id: 'qa', label: '📝 排版考題' }];
  protected readonly active = signal('admin');
  protected readonly current = computed(() => DEMOS.find((d) => d.id === this.active()));
}

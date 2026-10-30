import { Component, signal } from '@angular/core';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { BfcDemo, BoxModel, PositionDemo, SpecificityCalc, StackingDemo } from './css-demos';
import { CSS_QA, HTML_QA } from './css.qa';

@Component({
  selector: 'app-css-page',
  imports: [PageHeader, SubTabs, DemoCard, QaList, BoxModel, BfcDemo, PositionDemo, StackingDemo, SpecificityCalc],
  template: `
    <app-page-header title="CSS / HTML 基礎" intro="盒模型、BFC、定位、堆疊上下文、特異性，以及語意化 HTML 與無障礙（a11y）。" />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />
    @switch (active()) {
      @case ('demo') {
        <app-demo title="盒模型 box-sizing" desc="為什麼幾乎每個專案都寫 <code>*, *::before, *::after { box-sizing: border-box }</code>？">
          <app-box-model />
        </app-demo>
        <app-demo title="BFC（Block Formatting Context）" desc="margin 合併、margin 穿透、浮動塌陷，以及用 BFC 解決。">
          <app-bfc-demo />
        </app-demo>
        <app-demo title="position 五種值">
          <app-position-demo />
        </app-demo>
        <app-demo title="Stacking Context：z-index: 999 為什麼蓋不過 10？">
          <app-stacking-demo />
        </app-demo>
        <app-demo title="選擇器特異性計算器">
          <app-specificity-calc />
        </app-demo>
      }
      @case ('css') {
        <app-qa-list heading="CSS 面試題" [items]="cssQa" />
      }
      @default {
        <app-qa-list heading="HTML / 無障礙面試題" [items]="htmlQa" />
      }
    }
  `,
})
export default class CssPage {
  protected readonly tabs: TabDef[] = [
    { id: 'demo', label: '互動 Demo' },
    { id: 'css', label: '📝 CSS 考題' },
    { id: 'html', label: '📝 HTML / a11y 考題' },
  ];
  protected readonly active = signal('demo');
  protected readonly cssQa = CSS_QA;
  protected readonly htmlQa = HTML_QA;
}

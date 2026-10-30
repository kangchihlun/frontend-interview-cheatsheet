import { Component, signal } from '@angular/core';
import { CodeBlock } from '../../shared/code-block';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { COMPARE_ROWS, REACT_QA, SIDE_BY_SIDE } from './react.qa';

@Component({
  selector: 'app-react-page',
  imports: [PageHeader, SubTabs, DemoCard, QaList, CodeBlock],
  template: `
    <app-page-header
      title="React 對照（JSX / Hooks / Redux / Next.js）"
      intro="職缺要求「Angular SCSS 與 React JSX」都要有實作經驗。用 Angular 的觀念對照 React，面試時能說出兩者的取捨最加分。"
    />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />
    @switch (active()) {
      @case ('table') {
        <app-demo title="觀念對照表">
          <div class="scroll">
            <table class="simple">
              <tr><th>主題</th><th>Angular 22</th><th>React 19</th></tr>
              @for (r of rows; track r[0]) {
                <tr><td><b>{{ r[0] }}</b></td><td [innerHTML]="r[1]"></td><td [innerHTML]="r[2]"></td></tr>
              }
            </table>
          </div>
        </app-demo>
      }
      @case ('code') {
        @for (s of sides; track s.title) {
          <app-demo [title]="s.title">
            <div class="two">
              <app-code [code]="s.angular" lang="Angular" />
              <app-code [code]="s.react" lang="React (TSX)" />
            </div>
          </app-demo>
        }
      }
      @default {
        <app-qa-list heading="React 面試題" [items]="qa" />
      }
    }
  `,
  styles: `
    .scroll { overflow-x: auto; }
    .two { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 12px; }
  `,
})
export default class ReactPage {
  protected readonly tabs: TabDef[] = [
    { id: 'table', label: '對照表' },
    { id: 'code', label: '程式碼並排' },
    { id: 'qa', label: '📝 React 考題' },
  ];
  protected readonly active = signal('table');
  protected readonly rows = COMPARE_ROWS;
  protected readonly sides = SIDE_BY_SIDE;
  protected readonly qa = REACT_QA;
}

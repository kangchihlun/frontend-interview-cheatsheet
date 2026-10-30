import { Component, signal } from '@angular/core';
import { CodeBlock } from '../../shared/code-block';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { ButtonSystem } from './demos/button-system';
import btnHtml from './demos/button-system.html' with { loader: 'text' };
import btnScss from './demos/button-system.scss' with { loader: 'text' };
import { EncapsulationDemo } from './demos/encapsulation-demo';
import encHtml from './demos/encapsulation-demo.html' with { loader: 'text' };
import encScss from './demos/encapsulation-demo.scss' with { loader: 'text' };
import { ThemeSwitch } from './demos/theme-switch';
import themeHtml from './demos/theme-switch.html' with { loader: 'text' };
import themeScss from './demos/theme-switch.scss' with { loader: 'text' };
import { ENC_TS, SCSS_ARCH, SCSS_QA } from './scss.qa';

@Component({
  selector: 'app-scss-page',
  imports: [PageHeader, SubTabs, DemoCard, QaList, CodeBlock, ThemeSwitch, ButtonSystem, EncapsulationDemo],
  template: `
    <app-page-header
      title="SCSS 語法與架構"
      intro="變數、map、&#64;each / &#64;for / &#64;if、mixin vs extend vs function、&#64;use / &#64;forward 模組化、BEM、主題切換，以及 Angular 特有的樣式封裝（:host、::ng-deep、ViewEncapsulation）。"
    />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />
    @switch (active()) {
      @case ('theme') {
        <app-demo title="主題切換：SCSS map → CSS 變數" desc="編譯期產生多組主題變數；執行期只切換 data-theme，不必重新載入 CSS。" [html]="themeHtml" [scss]="themeScss">
          <app-theme-switch />
        </app-demo>
      }
      @case ('system') {
        <app-demo title="元件系統：&#64;each + mixin + function + placeholder" desc="一份 token map 產生所有按鈕變體、尺寸與工具類。" [html]="btnHtml" [scss]="btnScss">
          <app-button-system />
        </app-demo>
      }
      @case ('enc') {
        <app-demo title="Angular 樣式封裝" desc="Emulated / None / ShadowDom、:host、:host-context、::ng-deep 的實際效果。" [html]="encHtml" [scss]="encScss" [ts]="encTs">
          <app-encapsulation-demo />
        </app-demo>
      }
      @case ('arch') {
        <app-demo title="7-1 架構與 &#64;use / &#64;forward" desc="大型專案的 SCSS 檔案組織方式（本專案 src/styles 即採用 tokens + mixins 分層）。">
          <app-code [code]="arch" lang="scss" />
        </app-demo>
      }
      @default {
        <app-qa-list heading="SCSS 面試題" [items]="qa" />
      }
    }
  `,
})
export default class ScssPage {
  protected readonly tabs: TabDef[] = [
    { id: 'theme', label: '主題切換' },
    { id: 'system', label: 'Mixin / Function / Each' },
    { id: 'enc', label: 'Angular 樣式封裝' },
    { id: 'arch', label: '檔案架構 @use/@forward' },
    { id: 'qa', label: '📝 SCSS 考題' },
  ];
  protected readonly active = signal('theme');
  protected readonly qa = SCSS_QA;
  protected readonly arch = SCSS_ARCH;
  protected readonly encTs = ENC_TS;
  protected readonly themeHtml = themeHtml;
  protected readonly themeScss = themeScss;
  protected readonly btnHtml = btnHtml;
  protected readonly btnScss = btnScss;
  protected readonly encHtml = encHtml;
  protected readonly encScss = encScss;
}

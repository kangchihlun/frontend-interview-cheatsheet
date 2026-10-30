import { Component, input, ViewEncapsulation } from '@angular/core';

/** Emulated（預設）：Angular 幫選擇器加上 [_ngcontent-xxx] 屬性，樣式只作用在自己的模板 */
@Component({
  selector: 'app-enc-emulated',
  template: `<p class="title">Emulated：我的 .title 是紅色，只影響自己</p><p class="inner">.inner（父層用 ::ng-deep 改成黃底）</p>`,
  styles: `
    .title { color: #ff6b6b; font-weight: 700; margin: 0; }
    .inner { margin: 4px 0 0; }
  `,
})
export class EncEmulated {}

/** None：樣式直接進全域 <head>，會「漏」到整個 App（故意取冷門 class 名稱避免污染） */
@Component({
  selector: 'app-enc-none',
  encapsulation: ViewEncapsulation.None,
  template: `<p class="enc-leaky">None：樣式是全域的，任何地方的 .enc-leaky 都會變綠</p>`,
  styles: `.enc-leaky { color: #16c784; font-weight: 700; margin: 0; }`,
})
export class EncNone {}

/** ShadowDom：真正的 Shadow DOM，外部樣式進不來，但 CSS 變數（繼承屬性）可以穿透 */
@Component({
  selector: 'app-enc-shadow',
  encapsulation: ViewEncapsulation.ShadowDom,
  template: `<p class="title enc-leaky">ShadowDom：外面的 .enc-leaky / ::ng-deep 都進不來，但 var(--shadow-color) 可以</p>`,
  styles: `
    :host { display: block; }
    .title { color: var(--shadow-color, gray); font-weight: 700; margin: 0; }
  `,
})
export class EncShadow {}

/** :host / :host-context / host 綁定 */
@Component({
  selector: 'app-enc-host',
  template: `<span>:host 樣式 + host class 綁定（compact={{ compact() }}）</span>`,
  host: { '[class.compact]': 'compact()' },
  styles: `
    :host { display: block; padding: 10px; border: 2px solid #4f8cff; border-radius: 6px; }
    :host(.compact) { padding: 2px 10px; border-style: dashed; }
    :host-context(.dark-zone) { background: #000; color: #ffd400; }
  `,
})
export class EncHost {
  readonly compact = input(false);
}

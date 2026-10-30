import { QaItem } from '../../shared/qa.model';

export const SCSS_QA: QaItem[] = [
  {
    q: 'SCSS 變數和 CSS 自訂屬性（CSS 變數）差在哪？',
    a: `<table class="simple">
      <tr><th></th><th>SCSS $var</th><th>CSS --var</th></tr>
      <tr><td>時機</td><td>編譯期，輸出後就消失</td><td>執行期，存在瀏覽器中</td></tr>
      <tr><td>可被 JS 修改</td><td>✗</td><td>✓ <code>el.style.setProperty('--x', ...)</code></td></tr>
      <tr><td>繼承 / 作用域</td><td>依 SCSS 區塊作用域</td><td>依 DOM 樹繼承、可穿透 Shadow DOM</td></tr>
      <tr><td>可用於 media query 條件</td><td>✓</td><td>✗</td></tr>
      <tr><td>運算</td><td>Sass 函式（math、color）</td><td><code>calc()</code>、<code>color-mix()</code></td></tr>
    </table>
    實務：SCSS map 定義 token → <code>@each</code> 輸出成 CSS 變數，元件只使用 CSS 變數（見「主題切換」）。`,
  },
  {
    q: 'mixin、@extend（placeholder）、function 差在哪？各自什麼時機用？',
    a: `<ul>
      <li><b>@mixin / @include</b>：複製一段宣告，可帶參數、<code>@content</code>。最常用（斷點、truncate）。缺點：每次 include 都會產生重複 CSS。</li>
      <li><b>@extend %placeholder</b>：把選擇器合併到同一條規則，輸出較小；但會改變選擇器順序、不能跨 media query 使用、容易產生龐大選擇器。</li>
      <li><b>@function</b>：回傳「一個值」，不輸出宣告，例如 <code>rem()</code>、取 map 值。</li>
    </ul>`,
    code: `@mixin up($bp) { @media (min-width: $bp) { @content; } }
%btn-base { border-radius: 6px; }
@function rem($px) { @return math.div($px, 16px) * 1rem; }

.btn { @extend %btn-base; padding: rem(12px); @include up(768px) { padding: rem(16px); } }`,
    level: 1,
  },
  {
    q: '@import 為什麼被淘汰？@use 和 @forward 怎麼用？',
    a: `<code>@import</code> 會把所有東西放進全域命名空間，重複 import 會重複輸出、命名容易衝突，Dart Sass 3 將移除。
      <ul>
        <li><code>@use 'tokens' as t;</code>：有命名空間（<code>t.$primary</code>、<code>t.space(2)</code>），同一模組只會載入一次。</li>
        <li><code>@use 'x' with ($primary: red);</code>：設定模組的 <code>!default</code> 變數。</li>
        <li><code>@forward</code>：在 index 檔把多個模組再轉出（像 barrel file），可用 <code>show</code>/<code>hide</code>/<code>as</code> 控制。</li>
        <li>內建模組：<code>sass:map</code>、<code>sass:math</code>、<code>sass:color</code>、<code>sass:list</code>、<code>sass:string</code>。</li>
      </ul>`,
    level: 1,
  },
  {
    q: 'Angular 專案中怎麼讓每個元件都能 @use 全域的 mixin？',
    a: `在 <code>angular.json</code> 的 build options 設定 <code>stylePreprocessorOptions.includePaths</code>，元件內就能直接 <code>@use 'mixins' as m;</code>，不用寫一長串相對路徑。
      全域樣式放 <code>styles.scss</code>；元件樣式設 <code>inlineStyleLanguage: "scss"</code> 後 inline styles 也能寫 SCSS。`,
    code: `"stylePreprocessorOptions": { "includePaths": ["src/styles"] }`,
    level: 1,
  },
  {
    q: 'ViewEncapsulation 有哪幾種？Emulated 是怎麼做到隔離的？',
    a: `<ul>
      <li><b>Emulated（預設）</b>：編譯時在元素加 <code>_ngcontent-xxx</code>、host 加 <code>_nghost-xxx</code> 屬性，並把 CSS 選擇器改寫成 <code>.title[_ngcontent-xxx]</code>。</li>
      <li><b>None</b>：不改寫，樣式直接變全域（適合做主題或覆寫第三方元件，但要小心污染）。</li>
      <li><b>ShadowDom</b>：使用瀏覽器原生 Shadow DOM，外部樣式進不來；CSS 變數與可繼承屬性（color、font）仍會穿透。</li>
    </ul>`,
    level: 1,
  },
  {
    q: ':host、:host-context、::ng-deep 分別做什麼？',
    a: `<ul>
      <li><code>:host</code>：選到元件本身的 host 元素（預設是 inline，常需設 <code>display: block</code>）。<code>:host(.active)</code> 依 host 自己的 class。</li>
      <li><code>:host-context(.dark)</code>：host 的任一祖先有 <code>.dark</code> 時套用。</li>
      <li><code>::ng-deep</code>：讓後面的選擇器不加封裝屬性，可改到子元件/第三方元件內部。已標示 deprecated 但仍廣泛使用，<b>一定要加 <code>:host</code> 前綴</b>否則會漏成全域。替代方案：子元件開放 CSS 變數、或用 None 封裝的主題檔。</li>
    </ul>`,
    level: 2,
  },
  {
    q: '什麼是 BEM？在 SCSS 怎麼寫？',
    a: `Block__Element--Modifier，例如 <code>.menu</code>、<code>.menu__item</code>、<code>.menu__link--active</code>。好處：扁平、低特異性（全是單一 class），一眼看出結構。
      SCSS 用 <code>&amp;__</code>、<code>&amp;--</code> 串接。Angular 有封裝，BEM 主要幫助可讀性與避免巢狀過深。`,
    code: `.menu {
  &__item { ... }
  &__link {
    &--active { color: var(--primary); }
  }
  &__item.is-open > &__children { grid-template-rows: 1fr; }
}`,
    level: 1,
  },
  {
    q: 'SCSS 巢狀層數要注意什麼？',
    a: `巢狀太深會產生高特異性的長選擇器（難覆寫、檔案變大、耦合 DOM 結構）。建議不超過 3 層，搭配 BEM 保持扁平。`,
  },
  {
    q: '& 符號有哪些用法？',
    a: `<ul>
      <li><code>&amp;:hover</code>、<code>&amp;::before</code>：偽類 / 偽元素。</li>
      <li><code>&amp;.is-active</code>：同一元素多個 class。</li>
      <li><code>&amp;__elem</code>：字串串接（BEM）。</li>
      <li><code>.theme-dark &amp;</code>：把父選擇器放到後面（祖先條件）。</li>
      <li><code>&amp; + &amp;</code>：相鄰兄弟。</li>
    </ul>`,
    level: 1,
  },
  {
    q: 'Sass 的除法為什麼不能直接用 / ？',
    a: `CSS 本身就用 <code>/</code> 當分隔符（<code>grid-area: 1 / 2</code>、<code>font: 12px/1.5</code>），因此 Dart Sass 淘汰了 <code>/</code> 除法，改用 <code>math.div(a, b)</code> 或 <code>calc()</code>。`,
    code: `@use 'sass:math';
width: math.div(100%, 3);`,
    level: 2,
  },
  {
    q: '!default 和 !global 是什麼？',
    a: `<code>!default</code>：變數尚未有值才指定，讓 library 使用者可以 <code>@use 'lib' with ($primary: red)</code> 覆寫。<code>!global</code>：在區塊內修改全域變數（少用）。`,
    level: 2,
  },
  {
    q: '如何用 SCSS 做多主題（含深色模式）？',
    a: `<ol>
      <li>主題 token 用巢狀 map 定義。</li>
      <li><code>@each</code> 輸出 <code>[data-theme='x'] { --token: value }</code>。</li>
      <li>深色模式可再加 <code>@media (prefers-color-scheme: dark)</code> 作為預設。</li>
      <li>元件只用 <code>var(--token)</code>；切換主題時只改 <code>html</code> 的 attribute（本站右上角按鈕就是這樣做）。</li>
    </ol>`,
    level: 1,
  },
  {
    q: 'CSS 中有哪些現代功能可以取代部分 SCSS？',
    a: `原生巢狀（CSS Nesting）、CSS 變數、<code>calc()</code>/<code>clamp()</code>/<code>min()</code>/<code>max()</code>、<code>color-mix()</code>、<code>@layer</code>（cascade layers 管理優先順序）、<code>@container</code>、<code>:has()</code>、<code>:is()</code>/<code>:where()</code>（<code>:where</code> 特異性為 0）。SCSS 仍在 map、迴圈、mixin、模組化上有優勢。`,
    level: 3,
  },
];

export const SCSS_ARCH = `
// 7-1 Pattern（大型專案常見）
styles/
├── abstracts/        // 不輸出 CSS：變數、function、mixin
│   ├── _tokens.scss
│   ├── _functions.scss
│   ├── _mixins.scss
│   └── _index.scss   // @forward 'tokens'; @forward 'functions'; @forward 'mixins';
├── base/             // reset、typography
├── components/       // 共用元件樣式（非 Angular 元件時）
├── layout/           // header、sidebar、grid
├── themes/           // dark / light
├── vendors/          // 第三方覆寫
└── main.scss

// abstracts/_index.scss
@forward 'tokens';
@forward 'functions';
@forward 'mixins' show up, down, truncate;

// 元件內使用（angular.json 設 includePaths: ["src/styles"]）
@use 'abstracts' as a;

.card {
  padding: a.space(4);
  @include a.up(md) { padding: a.space(6); }
}

// 設定 library 預設值（!default）
// _tokens.scss:  $primary: #4f8cff !default;
@use 'abstracts' with ($primary: #ff5500);
`;

export const ENC_TS = `
@Component({
  selector: 'app-enc-none',
  encapsulation: ViewEncapsulation.None,       // 樣式變全域
  styles: \`.enc-leaky { color: #16c784; }\`,
})
export class EncNone {}

@Component({
  selector: 'app-enc-shadow',
  encapsulation: ViewEncapsulation.ShadowDom,  // 原生 Shadow DOM
  styles: \`.title { color: var(--shadow-color, gray); }\`,
})
export class EncShadow {}

@Component({
  selector: 'app-enc-host',
  host: { '[class.compact]': 'compact()' },     // 取代 @HostBinding
  styles: \`
    :host { display: block; }
    :host(.compact) { padding: 2px 10px; }
    :host-context(.dark-zone) { background: #000; }
  \`,
})
export class EncHost {
  readonly compact = input(false);
}
`;

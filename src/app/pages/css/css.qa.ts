import { QaItem } from '../../shared/qa.model';

export const CSS_QA: QaItem[] = [
  {
    q: '說明 CSS 盒模型，content-box 與 border-box 差異？',
    a: `盒子由內到外：content → padding → border → margin。<code>content-box</code>（預設）的 width 只算 content；<code>border-box</code> 的 width 包含 padding 與 border，比較直覺，排版時不必另外扣除。`,
    level: 1,
  },
  {
    q: '什麼是 BFC？如何觸發？能解決什麼問題？',
    a: `BFC 是一個獨立的排版區域，內部元素不會影響外部。觸發：<code>display: flow-root</code>（最乾淨）、<code>overflow</code> 非 visible、<code>float</code>、<code>position: absolute/fixed</code>、<code>display: flex/grid/inline-block</code> 的子層、<code>contain: layout</code>。
      解決：浮動高度塌陷、父子 margin 穿透、文字環繞浮動元素（BFC 不與 float 重疊，可做兩欄）。`,
    level: 1,
  },
  {
    q: 'margin 合併（collapsing）在什麼情況發生？',
    a: `只發生在<b>一般文件流的區塊元素的垂直方向</b>：相鄰兄弟、父與第一個/最後一個子元素（中間沒有 padding/border/BFC）、空區塊自己的上下 margin。flex/grid 子項不會合併。`,
    level: 2,
  },
  {
    q: 'position 有哪些值？absolute 是相對誰定位？',
    a: `static、relative、absolute、fixed、sticky。absolute 相對最近的 <b>position 非 static</b> 的祖先（的 padding box）；找不到時相對初始包含塊。
      fixed 正常相對 viewport，但祖先有 <code>transform</code>、<code>filter</code>、<code>perspective</code>、<code>contain</code> 時會改相對該祖先（常見 bug：modal 放在有 transform 的容器內）。`,
    level: 1,
  },
  {
    q: '什麼是 stacking context？哪些屬性會建立？',
    a: `z-index 只在同一個 stacking context 內比較。建立條件：根元素、<code>position</code> 非 static 且 <code>z-index</code> 非 auto、<code>position: fixed/sticky</code>、<code>opacity &lt; 1</code>、<code>transform</code>、<code>filter</code>、<code>isolation: isolate</code>、<code>will-change</code>、flex/grid 子項有 z-index 等。
      解法：把彈窗用 portal（Angular CDK Overlay）掛到 body 底下；或用 <code>isolation: isolate</code> 主動隔離。`,
    level: 2,
  },
  {
    q: 'CSS 選擇器特異性怎麼計算？',
    a: `(ID, class/屬性/偽類, 元素/偽元素) 三位數逐位比較；inline style 更高，<code>!important</code> 最高。<code>*</code>、組合符號與 <code>:where()</code> 為 0；<code>:is()</code>、<code>:not()</code>、<code>:has()</code> 取參數中最高者。同特異性時後寫的勝出。<code>@layer</code> 則在特異性之前先比較圖層順序。`,
    level: 1,
  },
  {
    q: 'display: none、visibility: hidden、opacity: 0 差別？',
    a: `<table class="simple">
      <tr><th></th><th>佔空間</th><th>可點擊</th><th>讀屏器</th><th>觸發</th></tr>
      <tr><td>display: none</td><td>✗</td><td>✗</td><td>✗</td><td>reflow</td></tr>
      <tr><td>visibility: hidden</td><td>✓</td><td>✗</td><td>✗</td><td>repaint</td></tr>
      <tr><td>opacity: 0</td><td>✓</td><td>✓</td><td>✓</td><td>composite</td></tr>
    </table>`,
    level: 1,
  },
  {
    q: '什麼是 reflow（layout）與 repaint？如何減少？',
    a: `改變幾何（寬高、位置、字體、DOM 增刪）→ reflow → repaint → composite；只改顏色 → repaint；改 <code>transform</code>/<code>opacity</code> → 只 composite（GPU）。
      減少方式：動畫只用 transform/opacity、批次讀寫 DOM 避免 layout thrashing（先讀再寫）、<code>contain</code>、虛擬捲動、<code>will-change</code> 適量使用。`,
    level: 2,
  },
  {
    q: '偽類和偽元素的差別？',
    a: `偽類（單冒號）選取元素的<b>狀態</b>：<code>:hover</code>、<code>:focus-visible</code>、<code>:nth-child()</code>、<code>:has()</code>。偽元素（雙冒號）建立虛擬<b>子元素</b>：<code>::before</code>、<code>::after</code>（需 content）、<code>::placeholder</code>、<code>::selection</code>。`,
    level: 1,
  },
  {
    q: ':has() 有什麼用？',
    a: `「父選擇器」：依子孫狀態選取祖先，例如 <code>.field:has(input:invalid)</code> 讓整個欄位變紅、<code>.card:has(img)</code> 改變卡片排版，以前需要 JS 才能做到。`,
    level: 2,
  },
  {
    q: '常用 CSS 單位：px、em、rem、%、vw/vh、dvh、fr、ch 差別？',
    a: `<code>em</code> 相對自己（或父層）font-size，會累乘；<code>rem</code> 相對根元素 font-size，適合整體縮放；<code>%</code> 相對包含塊；<code>vw/vh</code> 相對視窗；<code>dvh</code> 動態視窗高度（手機網址列）；<code>fr</code> Grid 剩餘空間比例；<code>ch</code> 字元「0」的寬度，適合設定文字行寬。`,
    level: 1,
  },
  {
    q: 'CSS 動畫：transition 和 animation（@keyframes）差別？',
    a: `transition 需要狀態變化觸發（A → B 兩點）；animation 可自動播放、多個關鍵影格、循環、暫停。效能上都優先使用 transform/opacity。尊重使用者偏好：<code>@media (prefers-reduced-motion: reduce)</code>。`,
  },
  {
    q: '@layer（Cascade Layers）解決什麼問題？',
    a: `控制不同來源 CSS 的優先順序，不必靠提高特異性或 !important。例如 <code>@layer reset, vendor, base, components, utilities;</code>，後面的圖層勝出，與選擇器特異性無關。`,
    code: `@layer reset, vendor, components;
@layer vendor { .btn { color: gray; } }
@layer components { .btn { color: blue; } } /* 勝出 */`,
    level: 3,
  },
  {
    q: '如何畫一個 CSS 三角形 / 1px 細線？',
    a: `三角形：寬高為 0，利用 border 透明色，或現代做法 <code>clip-path: polygon()</code>。高 DPI 1px 線：<code>transform: scaleY(0.5)</code> 搭配偽元素。`,
    code: `.triangle { width: 0; height: 0; border: 8px solid transparent; border-top-color: red; }
.tri2 { width: 16px; height: 8px; background: red; clip-path: polygon(0 0, 100% 0, 50% 100%); }`,
  },
];

export const HTML_QA: QaItem[] = [
  {
    q: '什麼是語意化 HTML？有什麼好處？',
    a: `用正確意義的標籤：<code>header</code>、<code>nav</code>、<code>main</code>、<code>article</code>、<code>section</code>、<code>aside</code>、<code>footer</code>、<code>button</code>（不是 div + click）。好處：SEO、無障礙（讀屏器 landmark 導覽）、可維護性、預設的鍵盤行為。`,
    level: 1,
  },
  {
    q: '為什麼可點擊的東西要用 <button> 而不是 <div (click)>？',
    a: `button 原生支援鍵盤（Tab 聚焦、Enter/Space 觸發）、有 role、disabled 狀態、表單提交。用 div 必須自己補上 <code>role="button"</code>、<code>tabindex="0"</code>、keydown 處理。導航用 <code>&lt;a href&gt;</code>，動作用 <code>&lt;button&gt;</code>。`,
    level: 1,
  },
  {
    q: '常見的 ARIA 屬性與無障礙重點？',
    a: `<ul>
      <li>第一原則：能用原生語意元素就不用 ARIA。</li>
      <li><code>aria-label</code>/<code>aria-labelledby</code>：無文字按鈕（icon button）。</li>
      <li><code>aria-expanded</code>、<code>aria-controls</code>：選單、手風琴（本站 Admin 側欄有用）。</li>
      <li><code>aria-live="polite"</code>：即時價格、通知讓讀屏器播報。</li>
      <li><code>aria-current="page"</code>：目前頁籤（Angular <code>routerLinkActive</code> 搭配 <code>ariaCurrentWhenActive</code>）。</li>
      <li>色彩對比 4.5:1、焦點可見 <code>:focus-visible</code>、圖片 alt、表單 label 關聯。</li>
    </ul>`,
    level: 2,
  },
  {
    q: 'script 的 defer 和 async 差別？',
    a: `兩者都不阻塞 HTML 解析並平行下載。<code>async</code> 下載完立即執行（順序不保證），適合獨立的分析腳本；<code>defer</code> 在 HTML 解析完、DOMContentLoaded 前依序執行。<code>type="module"</code> 預設就是 defer。`,
    level: 1,
  },
  {
    q: '瀏覽器從輸入網址到畫面顯示發生了什麼？',
    a: `DNS 查詢 → TCP/TLS 連線 → HTTP 請求 → 回應 HTML → 解析 HTML 建 DOM、解析 CSS 建 CSSOM（CSS 阻塞渲染）→ 合成 Render Tree → Layout → Paint → Composite。JS 遇到同步 script 會阻塞解析。`,
    level: 2,
  },
  {
    q: 'localStorage、sessionStorage、cookie、IndexedDB 差別？',
    a: `<table class="simple">
      <tr><th></th><th>容量</th><th>生命週期</th><th>隨請求送出</th></tr>
      <tr><td>cookie</td><td>~4KB</td><td>可設過期</td><td>✓（可設 HttpOnly/Secure/SameSite）</td></tr>
      <tr><td>localStorage</td><td>~5MB</td><td>永久</td><td>✗</td></tr>
      <tr><td>sessionStorage</td><td>~5MB</td><td>分頁關閉即清</td><td>✗</td></tr>
      <tr><td>IndexedDB</td><td>大</td><td>永久，非同步，可存物件</td><td>✗</td></tr>
    </table>
    Token 存放：HttpOnly cookie 可防 XSS 竊取（需防 CSRF）；localStorage 易受 XSS。`,
    level: 1,
  },
  {
    q: 'meta viewport 的作用？',
    a: `<code>&lt;meta name="viewport" content="width=device-width, initial-scale=1"&gt;</code> 讓手機以裝置寬度渲染，否則會以 980px 桌面寬度縮小顯示，RWD media query 失效。`,
    level: 1,
  },
  {
    q: '響應式圖片怎麼做？',
    a: `<code>srcset</code> + <code>sizes</code> 讓瀏覽器依螢幕密度/寬度挑圖；<code>&lt;picture&gt;</code> + <code>&lt;source media&gt;</code> 做美術裁切或 WebP/AVIF fallback；<code>loading="lazy"</code>；Angular 有 <code>NgOptimizedImage</code>（<code>ngSrc</code>）自動處理 lazy、priority、srcset。`,
    level: 2,
  },
];

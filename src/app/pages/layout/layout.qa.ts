import { QaItem } from '../../shared/qa.model';

export const LAYOUT_QA: QaItem[] = [
  {
    q: 'Flexbox 和 Grid 差在哪？什麼時候用哪一個？',
    a: `<ul>
      <li><b>Flex 是一維</b>（一次只處理一條主軸），適合「內容決定尺寸」：導覽列、按鈕群、工具列、卡片內部排列。</li>
      <li><b>Grid 是二維</b>（同時控制列與欄），適合「版面決定尺寸」：整頁骨架、Dashboard、表單對齊、卡片牆。</li>
      <li>實務上常 <b>外層 Grid 切大區塊、內層 Flex 排內容</b>（本頁「多層級巢狀」demo 就是這個結構）。</li>
    </ul>`,
  },
  {
    q: 'flex: 1 實際上是什麼意思？flex: 1 和 flex: auto 差在哪？',
    a: `<code>flex</code> 是 <code>flex-grow flex-shrink flex-basis</code> 的縮寫。
      <ul>
        <li><code>flex: 1</code> = <code>1 1 0%</code>：基準為 0，空間完全按比例分 → 真正等分。</li>
        <li><code>flex: auto</code> = <code>1 1 auto</code>：先依內容寬度，再分剩下的空間 → 內容多的會比較寬。</li>
        <li><code>flex: none</code> = <code>0 0 auto</code>：不放大不縮小。</li>
      </ul>`,
    level: 1,
  },
  {
    q: '為什麼 flex 子元素裡的長字串 / 表格會把版面撐爆？怎麼解？',
    a: `flex 與 grid 子項預設 <code>min-width: auto</code>（不會比內容的最小寬度更小）。
      解法：在該子項加 <code>min-width: 0</code>（直向則是 <code>min-height: 0</code>），或給 <code>overflow: hidden/auto</code>。
      Grid 的話可用 <code>minmax(0, 1fr)</code> 取代 <code>1fr</code>。`,
    code: `.main { flex: 1; min-width: 0; }
.grid { grid-template-columns: 240px minmax(0, 1fr); }`,
    level: 2,
  },
  {
    q: '多層巢狀的 flex 版面，最內層想要自己捲動卻一直把外層撐開，原因？',
    a: `高度要「一路傳下去」：每一層都要是 flex/grid 容器並用 <code>flex: 1</code> / <code>1fr</code> 吃滿，
      而且<b>每一層</b>子項都要 <code>min-height: 0</code>，最後只有最內層設 <code>overflow: auto</code>。
      到「多層級巢狀」demo 取消勾選 min-height: 0 即可看到爆版現象。`,
    level: 2,
  },
  {
    q: 'Admin 後台版型你會怎麼切？側欄收合怎麼做？',
    a: `<ol>
      <li>外層 <code>display: grid</code>，<code>grid-template-columns: var(--sidebar-w) 1fr</code>、rows 為 topbar 高度 + 1fr，用 <code>grid-template-areas</code> 命名。</li>
      <li>收合只改 CSS 變數 <code>--sidebar-w</code>（240px → 64px），文字用 <code>display: none</code> 隱藏，只留 icon，搭配 <code>title</code>/tooltip。</li>
      <li>只有 <code>main</code> 區 <code>overflow: auto</code>，sidebar 與 topbar 固定不動。</li>
      <li>手機改為 off-canvas：sidebar <code>position: absolute/fixed</code> + <code>transform: translateX(-100%)</code>，開啟時加上 backdrop 遮罩。用 transform 做動畫（不觸發 layout，只有 composite）。</li>
      <li>多層選單用遞迴元件或 <code>ng-template</code> + <code>ngTemplateOutlet</code>，縮排用 <code>--depth</code> CSS 變數計算。</li>
    </ol>`,
    level: 1,
  },
  {
    q: '如何做 height: auto 的展開收合動畫？',
    a: `<code>height</code> 從 0 到 auto 不能 transition。現代做法：外層 <code>display: grid; grid-template-rows: 0fr</code> → <code>1fr</code>，內層 <code>overflow: hidden</code>。
      其他做法：<code>max-height</code>（需猜最大值）、JS 量測 <code>scrollHeight</code>、或新的 <code>interpolate-size: allow-keywords</code>。`,
    code: `.children { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .25s; }
.children > .inner { overflow: hidden; }
.open > .children { grid-template-rows: 1fr; }`,
    level: 2,
  },
  {
    q: '聖杯佈局（Holy Grail）是什麼？sticky footer 怎麼做？',
    a: `header / footer + 中間三欄（nav、main、aside），main 在 DOM 中排前面（SEO/無障礙），視覺上用 <code>order</code> 或 grid area 擺中間。
      Sticky footer：外層 <code>min-height: 100dvh</code>，Grid 用 <code>grid-template-rows: auto 1fr auto</code>，或 Flex column + 中段 <code>flex: 1</code>。`,
  },
  {
    q: 'position: sticky 為什麼沒作用？',
    a: `<ul>
      <li>沒設 <code>top</code>/<code>left</code> 門檻值。</li>
      <li>祖先元素有 <code>overflow: hidden/auto</code>，sticky 會黏在那個容器而不是視窗（甚至因容器不捲動而看起來失效）。</li>
      <li>父元素高度等於自己，沒有可以「黏」的空間。</li>
      <li>table 用 <code>border-collapse: collapse</code> 時邊框不會跟著走，改用 <code>separate</code>。</li>
    </ul>`,
    level: 2,
  },
  {
    q: '置中有幾種方式？',
    a: `flex（justify-content + align-items）、grid（<code>place-items: center</code>）、absolute + <code>translate(-50%, -50%)</code>、absolute + <code>inset: 0; margin: auto</code>、flex 子元素 <code>margin: auto</code>、行內元素 text-align + line-height。見「置中」demo。`,
    level: 1,
  },
  {
    q: 'auto-fit 和 auto-fill 差在哪？',
    a: `兩者都會「盡量塞入」欄位；差別在項目不足填滿一列時：<code>auto-fill</code> 保留空軌道，<code>auto-fit</code> 把空軌道收合為 0，讓既有項目以 <code>1fr</code> 撐滿整列。`,
    code: `grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));`,
    level: 2,
  },
  {
    q: 'Media Query 和 Container Query 的差別？什麼時候用 Container Query？',
    a: `Media Query 依「視窗」尺寸；Container Query 依「父容器」尺寸。元件會被放在不同寬度的區塊時（側欄 vs 主區、可拖拉的 split pane、Dashboard widget），
      Container Query 讓元件自己決定排版，真正做到可重用。父層要宣告 <code>container-type: inline-size</code>。`,
    code: `.wrap { container: card / inline-size; }
@container card (min-width: 360px) { .product { grid-template-columns: 96px 1fr; } }`,
    level: 2,
  },
  {
    q: 'RWD 的行動優先（mobile-first）是什麼？SCSS 怎麼管理斷點？',
    a: `先寫手機樣式，再用 <code>min-width</code> 逐步加強大螢幕；CSS 較少覆寫、效能較好。
      SCSS 把斷點集中在 map，寫 <code>up()</code>/<code>down()</code> mixin，元件內統一呼叫。另外搭配 <code>clamp()</code> 流體字級、<code>aspect-ratio</code>、<code>srcset</code>/<code>picture</code> 響應式圖片、viewport meta。`,
    code: `$breakpoints: (sm: 576px, md: 768px, lg: 1024px, xl: 1280px);
@mixin up($bp) { @media (min-width: map.get($breakpoints, $bp)) { @content; } }
.grid { grid-template-columns: 1fr; @include up(lg) { grid-template-columns: repeat(3, 1fr); } }`,
    level: 1,
  },
  {
    q: '100vh 在手機上有什麼問題？',
    a: `手機瀏覽器網址列伸縮會讓 <code>100vh</code> 比可視高度大，底部被切掉。改用 <code>100dvh</code>（動態）、<code>100svh</code>（最小）或 <code>100lvh</code>（最大）。`,
    level: 2,
  },
  {
    q: '可拖拉的分割視窗（split pane）怎麼實作？',
    a: `flex 容器 + 中間 gutter；pointerdown 時 <code>setPointerCapture</code>，pointermove 算出相對容器的百分比寫入 signal，
      模板用 <code>[style.flex-basis.%]</code> 綁定；拖拉中加 <code>user-select: none</code>、<code>touch-action: none</code>。
      高頻事件可用 <code>requestAnimationFrame</code> 節流。`,
    level: 2,
  },
  {
    q: '交易系統 Dashboard 的版面要注意什麼？',
    a: `<ul>
      <li>各 widget 互相獨立捲動，整頁不捲動（避免高頻更新造成 reflow 影響整頁）。</li>
      <li>數字用等寬字型 <code>font-variant-numeric: tabular-nums</code>，避免跳動。</li>
      <li>委託簿深度條用 <code>::before</code> + CSS 變數控制寬度，或 <code>transform: scaleX()</code>（效能更好）。</li>
      <li>大量更新的區塊加 <code>contain: content</code> 隔離 layout/paint 範圍。</li>
      <li>widget 用 container query 讓它放哪都能適應。</li>
    </ul>`,
    level: 3,
  },
  {
    q: '舊式排版（float / inline-block / table）還需要知道嗎？',
    a: `面試仍可能問：float 要清除浮動（<code>clearfix</code> 或父層建立 BFC：<code>display: flow-root</code>）；
      inline-block 之間的空白縫隙（HTML 空白字元，父層 <code>font-size: 0</code> 或改用 flex）。新專案用 flex/grid 即可。`,
    code: `.clearfix::after { content: ''; display: table; clear: both; }
.parent { display: flow-root; } /* 建立 BFC，包住浮動子元素 */`,
  },
];

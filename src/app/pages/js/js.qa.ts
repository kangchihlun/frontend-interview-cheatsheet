import { QaItem } from '../../shared/qa.model';

export const JS_QA: QaItem[] = [
  {
    q: '說明 Event Loop、macrotask 與 microtask',
    a: `JS 是單執行緒。呼叫堆疊（call stack）清空後：<b>先清空所有 microtask</b>（Promise.then/catch/finally、<code>queueMicrotask</code>、<code>await</code> 之後的程式、MutationObserver），
      然後瀏覽器可能渲染，再取<b>一個</b> macrotask（setTimeout、setInterval、I/O、UI 事件、MessageChannel）執行，如此循環。<code>requestAnimationFrame</code> 在渲染前執行。到「Event Loop 猜謎」實測。`,
    level: 1,
  },
  {
    q: '什麼是閉包（closure）？實際用途與風險？',
    a: `函式記住並存取它被<b>定義時</b>的詞法作用域，即使在外部執行。用途：私有變數、工廠函式、debounce/throttle 保存 timer、柯里化、模組模式。
      風險：閉包引用大物件或 DOM 導致無法 GC（記憶體洩漏）；<code>var</code> 迴圈 + 非同步取到同一個變數。`,
    code: `function createCounter() {
  let count = 0;                // 私有
  return { inc: () => ++count, get: () => count };
}`,
    level: 1,
  },
  {
    q: 'this 的綁定規則？',
    a: `優先序：<code>new</code> &gt; 明確綁定（<code>call</code>/<code>apply</code>/<code>bind</code>）&gt; 隱式綁定（<code>obj.fn()</code>）&gt; 預設（嚴格模式 undefined，非嚴格 globalThis）。
      <b>箭頭函式沒有自己的 this</b>，取定義時外層的 this，也不能被 call/bind 改變、不能 new。常見坑：把方法當 callback 傳出去（<code>setTimeout(obj.fn)</code>）會遺失 this。`,
    level: 1,
  },
  {
    q: 'var、let、const 差別？什麼是 TDZ？',
    a: `<code>var</code>：函式作用域、會提升並初始化為 undefined、可重複宣告、會掛到全域物件。<code>let/const</code>：區塊作用域、有提升但在宣告前存取會 ReferenceError（暫時性死區 TDZ）。<code>const</code> 不能重新賦值，但物件內容仍可變（要不可變用 <code>Object.freeze</code>）。`,
    level: 1,
  },
  {
    q: '原型鏈（prototype chain）是什麼？class 和 prototype 的關係？',
    a: `每個物件有內部 <code>[[Prototype]]</code>（<code>Object.getPrototypeOf(obj)</code>），讀取屬性找不到時沿著原型鏈往上找，直到 null。
      <code>class</code> 是語法糖：方法放在 <code>Class.prototype</code>，<code>extends</code> 設定原型鏈；<code>new</code> 會建立物件、設定原型、以該物件執行建構子並回傳。`,
    code: `function Animal(name) { this.name = name; }
Animal.prototype.speak = function () { return this.name; };
const a = new Animal('cat');
a.__proto__ === Animal.prototype;          // true
Animal.prototype.__proto__ === Object.prototype; // true`,
    level: 2,
  },
  {
    q: '== 與 === 差別？',
    a: `<code>===</code> 不做型別轉換；<code>==</code> 會轉型（<code>'1' == 1</code>、<code>null == undefined</code> 為 true、<code>[] == false</code> 也是 true）。一律用 <code>===</code>，唯一例外是 <code>x == null</code> 同時判斷 null 與 undefined。<code>Object.is</code> 能分辨 <code>NaN</code> 與 <code>±0</code>。`,
    level: 1,
  },
  {
    q: 'Promise 的狀態？Promise.all / allSettled / race / any 差別？',
    a: `狀態：pending → fulfilled / rejected（不可逆）。
      <ul>
        <li><code>all</code>：全部成功才成功，任一失敗立即失敗。</li>
        <li><code>allSettled</code>：等全部結束，回傳每個的狀態，永不 reject。</li>
        <li><code>race</code>：第一個結束（成功或失敗）的結果 → 做 timeout。</li>
        <li><code>any</code>：第一個成功的；全部失敗才 reject（AggregateError）。</li>
      </ul>`,
    level: 1,
  },
  {
    q: 'async/await 的錯誤處理？並行與串行？',
    a: `用 <code>try/catch</code>；沒 await 的 Promise 錯誤不會被 catch 到。多個獨立請求不要依序 await（串行變慢），用 <code>Promise.all</code> 並行。迴圈中 <code>forEach</code> 不會等 async callback，改用 <code>for...of</code>（串行）或 <code>Promise.all(arr.map(...))</code>（並行）。`,
    code: `// ❌ 串行：總時間 = a + b
const a = await getA(); const b = await getB();
// ✅ 並行：總時間 = max(a, b)
const [a2, b2] = await Promise.all([getA(), getB()]);`,
    level: 1,
  },
  {
    q: '深拷貝與淺拷貝？',
    a: `淺拷貝只複製第一層（<code>{...obj}</code>、<code>Object.assign</code>、<code>arr.slice()</code>）。深拷貝：<code>structuredClone()</code>（原生，支援 Date/Map/Set/循環參照，但不能複製函式、DOM、class 原型）；<code>JSON.parse(JSON.stringify())</code> 會遺失 undefined、函式、Date 變字串、循環參照報錯。手寫見「手寫題」。`,
    level: 1,
  },
  {
    q: 'debounce 和 throttle 差別？',
    a: `debounce：事件停止 N 毫秒後才執行一次（搜尋輸入、視窗 resize 結束）。throttle：N 毫秒內最多執行一次（捲動、滑鼠移動、按鈕防連點）。在 Angular 中通常直接用 RxJS 的 <code>debounceTime</code>/<code>throttleTime</code>。`,
    level: 1,
  },
  {
    q: '事件委派（event delegation）與事件流程？',
    a: `事件流程：capture（由外往內）→ target → bubble（由內往外）。事件委派：把監聽器掛在父元素，用 <code>event.target.closest()</code> 判斷來源，大量列表只需一個監聽器、動態新增的元素也有效。<code>stopPropagation</code> 停止傳遞、<code>preventDefault</code> 取消預設行為。`,
    level: 1,
  },
  {
    q: 'map、forEach、filter、reduce、some、every、find 差別？',
    a: `<code>map</code> 回傳新陣列（一對一轉換）；<code>forEach</code> 無回傳值、無法 break；<code>filter</code> 篩選；<code>reduce</code> 累積成單一值；<code>some</code>/<code>every</code> 短路判斷；<code>find</code>/<code>findIndex</code> 找第一個。ES2023 新增不改變原陣列的 <code>toSorted</code>、<code>toReversed</code>、<code>toSpliced</code>、<code>with</code>，以及 <code>findLast</code>、<code>Object.groupBy</code>。`,
    level: 1,
  },
  {
    q: 'ES Module 和 CommonJS 差別？',
    a: `ESM（<code>import/export</code>）是靜態結構，可 tree-shaking、支援 top-level await、瀏覽器原生支援，匯出的是 live binding。CJS（<code>require/module.exports</code>）是執行期動態載入、同步、匯出值的拷貝，主要用在舊版 Node。`,
    level: 2,
  },
  {
    q: 'JavaScript 的垃圾回收與常見記憶體洩漏？',
    a: `主要用標記清除（mark-and-sweep）：從 root 可到達的物件保留，其餘回收。常見洩漏：未清除的 timer/interval、未移除的事件監聽、未退訂的 Observable、閉包引用大物件、被移除的 DOM 仍被 JS 引用、無上限的快取（用 <code>WeakMap</code>/LRU）。用 Chrome DevTools Memory → Heap snapshot 比較。`,
    level: 2,
  },
  {
    q: 'XSS 與 CSRF 是什麼？前端怎麼防範？',
    a: `<b>XSS</b>：惡意腳本注入頁面。Angular 預設對插值與屬性綁定做 sanitization；不要隨意用 <code>bypassSecurityTrustHtml</code>、<code>innerHTML</code> 放使用者內容；搭配 CSP。
      <b>CSRF</b>：利用使用者的 cookie 發送偽造請求。防範：<code>SameSite</code> cookie、CSRF token（Angular HttpClient 內建 XSRF 支援 <code>withXsrfConfiguration</code>）、檢查 Origin。`,
    level: 2,
  },
  {
    q: 'Web Worker 是什麼？什麼時候用？',
    a: `在背景執行緒跑 JS，不阻塞 UI；透過 <code>postMessage</code> 溝通，不能操作 DOM。適合大量計算（解析大量行情、技術指標計算、加解密）。Angular CLI 支援 <code>ng generate web-worker</code>。`,
    level: 2,
  },
];

export const TS_QA: QaItem[] = [
  {
    q: 'interface 和 type 差別？',
    a: `大多可互換。interface 可被<b>宣告合併</b>（同名自動合併、適合擴充第三方型別）、用 <code>extends</code>；type 可以表達 union、tuple、mapped/conditional type、原始型別別名。團隊慣例：物件形狀用 interface，組合型別用 type。`,
    level: 1,
  },
  {
    q: 'any、unknown、never 差別？',
    a: `<code>any</code> 關閉型別檢查；<code>unknown</code> 是安全的 any，使用前必須縮小型別（typeof、instanceof、型別守衛）；<code>never</code> 表示不可能的值（永遠 throw 的函式、窮舉檢查的 default 分支）。`,
    code: `type Side = 'buy' | 'sell';
function color(s: Side) {
  switch (s) {
    case 'buy': return 'green';
    case 'sell': return 'red';
    default: { const _exhaustive: never = s; return _exhaustive; } // 新增 Side 時這裡會報錯
  }
}`,
    level: 1,
  },
  {
    q: '常用 Utility Types？',
    a: `<code>Partial</code>、<code>Required</code>、<code>Readonly</code>、<code>Pick</code>、<code>Omit</code>、<code>Record</code>、<code>Exclude</code>、<code>Extract</code>、<code>NonNullable</code>、<code>ReturnType</code>、<code>Parameters</code>、<code>Awaited</code>。本專案 <code>Extract&lt;ServerMsg, { ch: 'ticker' }&gt;</code> 就是從 union 中取出特定訊息型別。`,
    code: `type Order = { id: string; price: number; qty: number; status: 'open' | 'filled' };
type NewOrder = Omit<Order, 'id' | 'status'>;
type OrderPatch = Partial<Pick<Order, 'price' | 'qty'>>;
type ById = Record<string, Order>;`,
    level: 1,
  },
  {
    q: '泛型（Generics）是什麼？泛型約束？',
    a: `讓函式/類別對多種型別保持型別資訊。<code>&lt;T extends X&gt;</code> 限制 T 必須符合 X；<code>keyof</code> 搭配取得屬性型別。`,
    code: `function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((i) => i[key]);
}
pluck([{ s: 'BTC', p: 1 }], 'p'); // number[]`,
    level: 1,
  },
  {
    q: '什麼是 discriminated union？',
    a: `每個成員有共同的字面量欄位（discriminant），TS 能依該欄位自動縮小型別。WebSocket 訊息、Redux action、API 回應狀態的最佳建模方式。`,
    code: `type Msg =
  | { ch: 'ticker'; price: number }
  | { ch: 'trade'; qty: number };
function handle(m: Msg) {
  if (m.ch === 'ticker') m.price; // ✓ 這裡 m 被縮小為 ticker
}`,
    level: 2,
  },
  {
    q: 'enum 有什麼問題？替代方案？',
    a: `數字 enum 有反向映射且不安全（任何數字都能賦值）；enum 會產生執行期程式碼，與 <code>isolatedModules</code>/erasable syntax 不相容。替代：字串字面量 union 或 <code>as const</code> 物件。`,
    code: `export const OrderType = { Limit: 'limit', Market: 'market' } as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType]; // 'limit' | 'market'`,
    level: 2,
  },
  {
    q: 'satisfies 運算子的用途？',
    a: `檢查值符合某型別，但保留最精確的推論型別（不像型別註記會把型別放寬）。`,
    code: `const routes = { home: '/', trade: '/trade' } satisfies Record<string, string>;
routes.trade; // 型別仍是精確的 key，打錯 key 會報錯`,
    level: 3,
  },
  {
    q: '型別守衛（type guard）怎麼寫？',
    a: `<code>typeof</code>、<code>instanceof</code>、<code>in</code>，或自訂 <code>x is T</code> 謂詞函式；TS 5.5 起可自動推論簡單的 filter 謂詞。`,
    code: `function isApiError(e: unknown): e is { status: number; message: string } {
  return typeof e === 'object' && e !== null && 'status' in e;
}`,
    level: 2,
  },
];

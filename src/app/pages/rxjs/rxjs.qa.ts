import { QaItem } from '../../shared/qa.model';

export const RXJS_QA: QaItem[] = [
  {
    q: 'Observable 和 Promise 差在哪？',
    a: `<table class="simple">
      <tr><th></th><th>Promise</th><th>Observable</th></tr>
      <tr><td>值的數量</td><td>1 個</td><td>0 ~ 無限個</td></tr>
      <tr><td>執行時機</td><td>建立就立刻執行（eager）</td><td>subscribe 才執行（lazy）</td></tr>
      <tr><td>可取消</td><td>✗（需 AbortController）</td><td>✓ unsubscribe</td></tr>
      <tr><td>運算子</td><td>then / catch</td><td>上百個（map、switchMap、retry…）</td></tr>
      <tr><td>同步/非同步</td><td>永遠非同步（microtask）</td><td>可同步也可非同步</td></tr>
    </table>`,
    level: 1,
  },
  {
    q: 'switchMap、mergeMap、concatMap、exhaustMap 差別？各舉一個使用情境。',
    a: `都是「把每個值映射成內層 Observable 再攤平」，差別在<b>新值進來時，舊的內層怎麼處理</b>：
      <ul>
        <li><b>switchMap</b>：取消舊的，切換到新的 → 搜尋、路由參數取資料、切換商品訂閱行情。</li>
        <li><b>mergeMap</b>：全部並行 → 互不相關的並行請求（可用第二參數限制並發數）。</li>
        <li><b>concatMap</b>：排隊依序 → 下單、存檔等需要保證順序的寫入。</li>
        <li><b>exhaustMap</b>：執行中忽略新的 → 登入/送出按鈕防重複、輪詢時上一次沒回來就跳過。</li>
      </ul>
      <b>陷阱</b>：寫入類操作（下單）用 switchMap 可能取消掉已送出的請求 → 前端以為失敗但後端成功了。`,
    level: 1,
  },
  {
    q: 'Subject、BehaviorSubject、ReplaySubject、AsyncSubject 差別？',
    a: `Subject 既是 Observable 也是 Observer（可以 <code>next()</code>），是 <b>multicast（hot）</b>。
      <ul>
        <li><code>Subject</code>：無記憶，晚到的訂閱者收不到之前的值 → 事件匯流排。</li>
        <li><code>BehaviorSubject(init)</code>：必有初始值，新訂閱者立刻收到目前值，可用 <code>.value</code> 同步讀取 → 狀態（登入使用者、目前選擇的商品）。</li>
        <li><code>ReplaySubject(n, windowTime?)</code>：重播最近 n 筆 → 快取最近幾筆成交。</li>
        <li><code>AsyncSubject</code>：complete 時才送出最後一個值。</li>
      </ul>
      Service 中應該 <code>private</code> 保存 Subject，對外暴露 <code>asObservable()</code>。`,
    level: 1,
  },
  {
    q: 'Cold Observable 和 Hot Observable 差在哪？share 和 shareReplay 呢？',
    a: `<b>Cold</b>：每次 subscribe 都重新執行生產者（HttpClient 每訂閱一次就打一次 API）。<b>Hot</b>：生產者在外部或被共用，多個訂閱者共享同一份執行（DOM 事件、WebSocket、Subject）。
      <ul>
        <li><code>share()</code>：把 cold 變 hot，訂閱者歸零時自動斷開。</li>
        <li><code>shareReplay({ bufferSize: 1, refCount: true })</code>：共用並快取最後一個值給晚到者；<code>refCount: true</code> 可避免沒人訂閱時仍保持連線（記憶體洩漏）。</li>
      </ul>
      常見 bug：模板中 <code>(data$ | async)</code> 用了兩次 → 打兩次 API；解法：<code>shareReplay</code>、<code>@let</code>、或 <code>toSignal</code>。`,
    level: 2,
  },
  {
    q: 'debounceTime、throttleTime、auditTime、sampleTime 差別？',
    a: `<ul>
      <li><code>debounceTime</code>：安靜一段時間後才送出最後一個（搜尋輸入）。持續有事件就永遠不送。</li>
      <li><code>throttleTime</code>：送出第一個，之後一段時間內忽略（leading）。</li>
      <li><code>auditTime</code>：收到後等一段時間，送出期間最後一個（trailing）→ <b>行情 UI 更新最常用</b>，保證看到最新價。</li>
      <li><code>sampleTime</code>：固定週期取樣最新值。</li>
    </ul>
    到「節流」demo 實際移動滑鼠比較次數。`,
    level: 1,
  },
  {
    q: 'combineLatest、withLatestFrom、forkJoin、zip 差在哪？',
    a: `<ul>
      <li><code>combineLatest</code>：所有來源都發過值後，任一來源更新就輸出全部最新值 → 多個篩選條件組合查詢。</li>
      <li><code>withLatestFrom</code>：只有主串流觸發輸出，附帶其他來源的最新值 → 按下送出時取得表單目前值。</li>
      <li><code>forkJoin</code>：全部 complete 後輸出各自最後值 → 頁面初始化並行打多支 API（類似 Promise.all）。任一來源沒 complete 就永遠不輸出；任一錯誤整個失敗。</li>
      <li><code>zip</code>：依序一對一配對。</li>
    </ul>`,
    level: 1,
  },
  {
    q: '錯誤處理：catchError 放外層和內層差在哪？',
    a: `Observable 一旦 error 就終止。如果 <code>catchError</code> 放在 switchMap 的<b>外層</b>，第一次 API 錯誤後整條搜尋串流就死了，之後打字都沒反應；放在<b>內層</b>（API 呼叫的 pipe 裡）只會讓那一次請求回傳 fallback，外層繼續運作。`,
    code: `search$.pipe(
  switchMap(q => this.api.search(q).pipe(
    catchError(() => of([]))   // ✅ 內層：單次失敗不影響後續
  )),
  // catchError(() => of([])) // ❌ 外層：錯一次串流就結束
)`,
    level: 2,
  },
  {
    q: '如何實作重試與指數退避（exponential backoff）？',
    a: `RxJS 7 用 <code>retry({ count, delay })</code>；delay 可回傳 Observable 決定等多久。WebSocket 斷線重連也是同一招。`,
    code: `this.http.get(url).pipe(
  retry({
    count: 3,
    delay: (err, i) => err.status >= 500 ? timer(300 * 2 ** (i - 1)) : throwError(() => err),
  }),
  catchError(err => { this.toast.error(err); return EMPTY; }),
);`,
    level: 2,
  },
  {
    q: '怎麼避免訂閱造成的記憶體洩漏？',
    a: `<ul>
      <li>模板用 <code>async</code> pipe 或 <code>toSignal()</code>（自動退訂）。</li>
      <li>手動訂閱用 <code>takeUntilDestroyed()</code>（需在 injection context，或傳入 <code>DestroyRef</code>）。</li>
      <li>舊寫法：<code>takeUntil(this.destroy$)</code> 並在 ngOnDestroy <code>next()</code> + <code>complete()</code>；<code>takeUntil</code> 要放在 pipe 的<b>最後</b>。</li>
      <li>有限的串流（HttpClient、<code>take(1)</code>、<code>first()</code>）會自動 complete。</li>
    </ul>`,
    code: `export class PriceTicker {
  constructor() {
    inject(MarketData).ticker$('BTC').pipe(takeUntilDestroyed()).subscribe(...);
  }
}`,
    level: 1,
  },
  {
    q: 'Signal 時代 RxJS 還需要嗎？toSignal / toObservable 注意事項？',
    a: `需要。Signal 管「目前狀態」，RxJS 管「事件與時間」。
      <ul>
        <li><code>toSignal(obs$, { initialValue })</code>：要給初始值，否則型別含 undefined；同步發值的 Observable（BehaviorSubject）可用 <code>requireSync: true</code>。在 injection context 呼叫，元件銷毀時自動退訂。</li>
        <li><code>toObservable(sig)</code>：內部用 effect，值的發送是非同步的（同一輪多次 set 只會收到最後一個）。</li>
        <li><code>rxResource</code>：以 signal 參數驅動 Observable 載入，自動取消前一次（像 switchMap）。</li>
      </ul>`,
    level: 2,
  },
  {
    q: '什麼是高階 Observable（higher-order observable）？',
    a: `發出的值本身也是 Observable（例如 <code>clicks$.pipe(map(() => http.get()))</code> 得到 <code>Observable&lt;Observable&lt;T&gt;&gt;</code>）。需要用 switchMap/mergeMap/concatMap/exhaustMap 或 <code>switchAll</code>/<code>mergeAll</code> 把它攤平。`,
    level: 2,
  },
  {
    q: 'scan 和 reduce 差別？怎麼用 RxJS 做簡易狀態管理？',
    a: `<code>reduce</code> 只在 complete 時輸出最終結果；<code>scan</code> 每次都輸出累積值（像 Redux reducer）。<code>actions$.pipe(scan(reducer, initial))</code> 就是最小的 store，見「scan Store」demo。`,
    level: 2,
  },
  {
    q: 'of、from、defer、fromEvent、interval、timer 的差別？',
    a: `<code>of(1,2,3)</code> 依序同步發出；<code>from([..] / promise / iterable)</code> 轉換；<code>defer(() =&gt; ...)</code> 訂閱時才建立（讓 retry 每次都重跑、讓 Promise 變 lazy）；<code>fromEvent(el, 'click')</code> DOM 事件；<code>interval(1000)</code> 週期；<code>timer(1000, 5000)</code> 延遲後週期（輪詢）。`,
    level: 1,
  },
  {
    q: '如何實作輪詢（polling），並在上一個請求沒回來時不重疊？',
    a: `<code>timer(0, 5000).pipe(exhaustMap(() =&gt; api$))</code>；或「回應後再等 5 秒」：<code>api$.pipe(repeat({ delay: 5000 }))</code>。頁面不可見時暫停可結合 <code>fromEvent(document, 'visibilitychange')</code>。`,
    code: `const visible$ = fromEvent(document, 'visibilitychange').pipe(
  startWith(null), map(() => document.visibilityState === 'visible'));

visible$.pipe(
  switchMap(v => v ? timer(0, 5000).pipe(exhaustMap(() => this.api.positions())) : EMPTY),
  takeUntilDestroyed(),
).subscribe(...)`,
    level: 3,
  },
  {
    q: 'distinctUntilChanged 對物件無效？',
    a: `預設用 <code>===</code> 比較，新物件參考永遠不同。可傳比較函式，或用 <code>distinctUntilKeyChanged('price')</code>。`,
    code: `ticks$.pipe(distinctUntilChanged((a, b) => a.price === b.price && a.qty === b.qty))`,
    level: 2,
  },
  {
    q: 'Scheduler 是什麼？animationFrameScheduler 用在哪？',
    a: `Scheduler 控制「何時」執行通知：<code>asyncScheduler</code>（setTimeout）、<code>asapScheduler</code>（microtask）、<code>animationFrameScheduler</code>（requestAnimationFrame）、<code>queueScheduler</code>。
      高頻行情可用 <code>auditTime(0, animationFrameScheduler)</code> 讓 UI 每一幀最多更新一次。測試時可用 <code>TestScheduler</code> 跑 marble test。`,
    level: 3,
  },
  {
    q: '什麼是 marble testing？',
    a: `用字串描述時間軸（<code>-a-b-|</code>）測試 RxJS 邏輯，<code>TestScheduler</code> 讓虛擬時間瞬間跑完。本專案 <code>src/app/pages/rxjs/operators.spec.ts</code> 有實際可執行的範例（見「單元測試」頁籤）。`,
    level: 3,
  },
];

export const OPERATOR_CHEATSHEET = `
情境                                   → 運算子
────────────────────────────────────────────────────────────────────
搜尋框自動完成                          → debounceTime + distinctUntilChanged + switchMap
切換商品，取消舊訂閱                     → switchMap
下單 / 存檔需保持順序                   → concatMap
防止重複送出 / 輪詢不重疊               → exhaustMap
並行上傳多個檔案（限制並發 3）           → mergeMap(fn, 3)
頁面初始化同時打多支 API                → forkJoin({ a: a$, b: b$ })
多個篩選條件任一改變就重查              → combineLatest([a$, b$])
按下按鈕時帶入其他串流最新值            → withLatestFrom(state$)
行情 UI 更新節流（保留最新）            → auditTime(100) / sampleTime
按鈕防連點                              → throttleTime(1000)
批次處理高頻 tick                       → bufferTime(250)
API 失敗重試 + 退避                     → retry({ count, delay })
錯誤時回傳預設值                        → catchError(() => of(fallback))
無論成功失敗都關 loading                → finalize
多個訂閱者共用一次 HTTP                 → shareReplay({ bufferSize: 1, refCount: true })
值相同不重複發送                        → distinctUntilChanged / distinctUntilKeyChanged
累積狀態（reducer）                     → scan
只取第一個 / 前 N 個                    → first() / take(n)
元件銷毀時自動退訂                      → takeUntilDestroyed()
逾時                                    → timeout({ first: 5000 })
WebSocket                               → webSocket() from 'rxjs/webSocket'
`;

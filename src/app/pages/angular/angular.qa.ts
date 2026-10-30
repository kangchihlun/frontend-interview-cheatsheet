import { QaItem } from '../../shared/qa.model';

export const ANGULAR_QA: QaItem[] = [
  {
    q: 'Angular 近幾版（17 → 22）最重要的變化有哪些？',
    a: `<ul>
      <li><b>Standalone</b> 成為預設，不再需要 NgModule（<code>bootstrapApplication</code>、<code>imports</code> 直接寫在元件）。</li>
      <li><b>Signals</b>：<code>signal</code>、<code>computed</code>、<code>effect</code>、<code>linkedSignal</code>、<code>resource</code>/<code>httpResource</code>、signal-based <code>input()</code>/<code>output()</code>/<code>model()</code>/<code>viewChild()</code>。</li>
      <li><b>新的 Control Flow</b>：<code>@if</code>、<code>@for</code>、<code>@switch</code>、<code>@let</code>、<code>@defer</code> 取代 <code>*ngIf</code>/<code>*ngFor</code>。</li>
      <li><b>Zoneless</b>（v20 穩定、v21 新專案預設）：不再依賴 zone.js，變更偵測由 signal、事件、<code>markForCheck</code> 觸發。</li>
      <li><b>OnPush 成為預設</b>（v22）：<code>ChangeDetectionStrategy.Default</code> 改名為 <code>Eager</code>。</li>
      <li><b>Vitest</b> 取代 Karma/Jasmine 成為預設測試工具（v21）。</li>
      <li><b>Signal Forms</b>（v21 實驗 → v22 公開 API）、<code>@Service()</code> 裝飾器、<code>debounced()</code>。</li>
      <li>esbuild + Vite 的 <code>@angular/build:application</code> builder、SSR 增量 hydration、事件重播。</li>
      <li>檔名風格：<code>app.ts</code> 取代 <code>app.component.ts</code>。</li>
    </ul>`,
    level: 1,
  },
  {
    q: 'signal、computed、effect、linkedSignal 的差別？',
    a: `<ul>
      <li><code>signal</code>：可寫的響應式值（<code>set</code>/<code>update</code>）。</li>
      <li><code>computed</code>：唯讀衍生值，<b>lazy 且 memoized</b>，依賴改變才重算，自動追蹤依賴。</li>
      <li><code>linkedSignal</code>：「可寫的 computed」——來源改變時重設，平常可以手動 set（例如換商品時重設數量）。</li>
      <li><code>effect</code>：副作用（log、存 localStorage、操作第三方 lib），非同步排程執行。<b>不要</b>用 effect 去同步另一個 signal（用 computed / linkedSignal）。</li>
      <li><code>untracked()</code>：讀取 signal 但不建立依賴。</li>
    </ul>`,
    level: 1,
  },
  {
    q: 'Signal 和 RxJS Observable 什麼時候用哪個？',
    a: `Signal 適合<b>同步狀態</b>（一定有目前值、給模板讀）；RxJS 適合<b>事件流與非同步時序</b>（debounce、取消、合併多個串流、WebSocket、重試）。
      兩者用 <code>toSignal()</code> / <code>toObservable()</code> 互轉；非同步取資料可用 <code>resource</code>/<code>rxResource</code>/<code>httpResource</code>。交易系統常見：WebSocket 用 RxJS 處理，最後 <code>toSignal</code> 給畫面。`,
    level: 2,
  },
  {
    q: 'Angular 的變更偵測（Change Detection）怎麼運作？Default/Eager 和 OnPush 差在哪？',
    a: `Angular 從根元件往下檢查模板綁定是否改變。
      <ul>
        <li><b>Eager（舊名 Default）</b>：每次變更偵測都檢查。</li>
        <li><b>OnPush</b>（v22 預設）：只有在以下情況才檢查該元件：<code>@Input</code> 參考改變、模板內事件觸發、模板讀取的 <b>signal 改變</b>、<code>async</code> pipe 收到值、手動 <code>markForCheck()</code>。</li>
      </ul>
      常見坑：OnPush 下直接 mutate 陣列/物件（<code>arr.push()</code>）不會更新畫面 → 需建立新參考（immutable）或改用 signal。`,
    level: 1,
  },
  {
    q: '什麼是 Zone.js？Zoneless 有什麼好處？',
    a: `Zone.js monkey-patch 所有非同步 API（setTimeout、Promise、事件），任何非同步完成就觸發整棵樹的變更偵測。
      Zoneless：移除 zone.js（bundle 更小、stack trace 乾淨、效能更好、與原生 async/await 相容），改由 signal 更新、模板事件、<code>markForCheck</code>、<code>async</code> pipe 通知 Angular。
      遷移重點：<code>setTimeout</code> 裡直接改一般欄位不會更新畫面 → 改用 signal。高頻行情更新在 zoneless + signal 下只會刷新讀到該 signal 的元件。`,
    level: 2,
  },
  {
    q: '元件生命週期有哪些？signal 時代還需要嗎？',
    a: `<code>constructor</code> → <code>ngOnChanges</code> → <code>ngOnInit</code> → <code>ngDoCheck</code> → <code>ngAfterContentInit/Checked</code> → <code>ngAfterViewInit/Checked</code> → <code>ngOnDestroy</code>。
      Signal 時代：<code>ngOnChanges</code> 可用 <code>computed</code>/<code>effect</code> 取代；DOM 操作用 <code>afterNextRender</code>/<code>afterEveryRender</code>；清理用 <code>inject(DestroyRef).onDestroy()</code> 或 <code>takeUntilDestroyed()</code>。`,
    level: 1,
  },
  {
    q: '元件之間怎麼溝通？',
    a: `<ul>
      <li>父 → 子：<code>input()</code>；子 → 父：<code>output()</code>；雙向：<code>model()</code> + <code>[(x)]</code>。</li>
      <li>父呼叫子方法：<code>viewChild()</code>。投影內容：<code>contentChild()</code> + <code>&lt;ng-content&gt;</code>。</li>
      <li>不相關元件：共用 service（signal store / BehaviorSubject）。</li>
      <li>大型狀態：NgRx Store / NgRx SignalStore。</li>
      <li>路由參數：<code>withComponentInputBinding()</code> 讓路由參數直接綁到 <code>input()</code>。</li>
    </ul>`,
    level: 1,
  },
  {
    q: '@for 為什麼 track 是必填？track 要放什麼？',
    a: `track 讓 Angular 判斷「哪個 DOM 對應哪筆資料」，資料重排/新增時只移動或新增必要的 DOM，而不是全部重建（保留輸入框值、焦點、動畫狀態，效能更好）。
      放<b>唯一且穩定的 id</b>（<code>track item.id</code>）；沒有 id 的靜態清單才用 <code>$index</code>。行情列表一定要 track by symbol。`,
    level: 1,
  },
  {
    q: '@defer 有哪些觸發條件？與 lazy route 差在哪？',
    a: `觸發：<code>on idle</code>（預設）、<code>on viewport</code>、<code>on interaction</code>、<code>on hover</code>、<code>on immediate</code>、<code>on timer(2s)</code>、<code>when 條件</code>；可加 <code>prefetch on ...</code>。
      子區塊：<code>@placeholder</code>、<code>@loading</code>、<code>@error</code>。
      Lazy route 是以「頁面」為單位切 chunk，<code>@defer</code> 是以「模板中的一塊區域」為單位，例如頁面下方的圖表、留言區。`,
    level: 2,
  },
  {
    q: '依賴注入（DI）的階層是什麼？providedIn: root 和 component providers 差在哪？',
    a: `Injector 樹：Element injector（元件/directive 的 <code>providers</code>）→ Environment injector（route providers、<code>bootstrapApplication</code> providers）→ root → platform → Null。
      <code>inject()</code> 由近往遠找。<code>providedIn: 'root'</code>（或 v22 的 <code>@Service()</code>）是全 App 單例且可 tree-shake；元件 <code>providers</code> 則每個元件實例一份，子孫共用（見 DI demo）。
      修飾：<code>inject(X, { optional: true, self: true, skipSelf: true, host: true })</code>。`,
    level: 2,
  },
  {
    q: 'useClass、useValue、useFactory、useExisting 差別？',
    a: `<code>useClass</code>：提供某個類別的實例（可替換實作、測試 mock）；<code>useValue</code>：固定值（設定）；<code>useFactory</code>：依其他依賴動態建立；<code>useExisting</code>：別名，指向另一個 token 的同一實例。<code>multi: true</code> 可讓同一 token 收集多個值（例如攔截器、初始化器）。`,
    code: `providers: [
  { provide: PriceFeed, useClass: environment.mock ? MockFeed : WsFeed },
  { provide: API_URL, useValue: 'https://api.example.com' },
  { provide: Logger, useFactory: () => inject(ENV).prod ? new NoopLogger() : new ConsoleLogger() },
  { provide: AbstractStore, useExisting: OrderStore },
]`,
    level: 2,
  },
  {
    q: 'Template-driven、Reactive Forms、Signal Forms 怎麼選？',
    a: `<ul>
      <li>Template-driven（<code>ngModel</code>）：簡單表單，邏輯在模板。</li>
      <li>Reactive Forms（<code>FormGroup</code>/<code>FormControl</code>）：邏輯在 TS、可測試、valueChanges 是 Observable，既有專案最多。用 <code>nonNullable</code> 取得嚴格型別。</li>
      <li>Signal Forms（Angular 22）：model 就是一個 signal，<code>form(model, schema)</code> 宣告驗證，欄位狀態（valid、touched、errors）都是 signal，與 zoneless/OnPush 完美搭配。</li>
    </ul>`,
    level: 2,
  },
  {
    q: '路由：lazy loading、guard、resolver 怎麼寫（函式型）？',
    a: `<code>loadComponent</code> / <code>loadChildren</code> 延遲載入；guard 與 resolver 現在都用函式。`,
    code: `export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const orderResolver: ResolveFn<Order> = (route) => inject(OrderApi).get(route.paramMap.get('id')!);

export const routes: Routes = [
  { path: 'orders/:id', canActivate: [authGuard], resolve: { order: orderResolver },
    loadComponent: () => import('./order-detail') },
  { path: 'admin', canMatch: [adminGuard], loadChildren: () => import('./admin/routes') },
];`,
    level: 1,
  },
  {
    q: 'Content projection 怎麼用？ng-content 與 ng-template 差別？',
    a: `<code>&lt;ng-content select=".header"&gt;</code> 把父層傳入的內容投影到指定位置（內容由父層建立，一定會被初始化）。
      <code>&lt;ng-template&gt;</code> 是「延遲渲染的樣板」，配合 <code>ngTemplateOutlet</code> 可以傳 context、渲染多次或條件渲染（本站 Admin 遞迴選單即用此技巧）。`,
    level: 2,
  },
  {
    q: 'Pure pipe 和 impure pipe 差別？為什麼不要在模板呼叫函式？',
    a: `Pure pipe（預設）只在輸入參考改變時重算，等同 memo；impure 每次變更偵測都執行（如 <code>async</code>、<code>json</code>）。
      模板直接呼叫一般函式每次 CD 都會執行；用 pure pipe 或 <code>computed</code> 取代。呼叫 signal（<code>price()</code>）沒問題，因為它只是讀值。`,
    level: 2,
  },
  {
    q: '如何避免記憶體洩漏？',
    a: `<ul>
      <li>手動 <code>subscribe</code> 要取消：<code>takeUntilDestroyed()</code>、<code>DestroyRef</code>。</li>
      <li>優先用 <code>async</code> pipe 或 <code>toSignal()</code>（自動退訂）。</li>
      <li>移除手動加的 DOM 事件、<code>setInterval</code>、WebSocket 連線。</li>
      <li>HttpClient 單次請求會 complete，通常不用退訂；但 <code>interval</code>、<code>fromEvent</code>、Subject、WebSocket 一定要。</li>
    </ul>`,
    level: 1,
  },
  {
    q: 'HttpClient 攔截器（interceptor）的用途？',
    a: `統一處理：加 Authorization header、錯誤處理（401 導回登入、toast）、重試、loading 指示、快取、記錄。現在用函式型 <code>HttpInterceptorFn</code> + <code>withInterceptors([...])</code>，詳見「REST API/HTTP」頁籤的實作。`,
    level: 1,
  },
  {
    q: 'Angular 效能優化手段？',
    a: `<ul>
      <li>OnPush + signals + zoneless；<code>@for</code> 正確 track。</li>
      <li>Lazy route、<code>@defer</code>、<code>NgOptimizedImage</code>。</li>
      <li>大清單用 CDK Virtual Scroll。</li>
      <li>高頻資料（行情）在 service 層 throttle / 合批（<code>auditTime</code>、<code>animationFrameScheduler</code>），只更新變動的 row。</li>
      <li>避免模板呼叫函式、改用 pure pipe / computed。</li>
      <li>SSR + hydration 改善首屏；bundle 分析（<code>ng build --stats-json</code>）。</li>
    </ul>`,
    level: 2,
  },
  {
    q: 'ViewChild 和 ContentChild 差別？',
    a: `<code>viewChild</code> 查詢元件<b>自己模板</b>中的元素；<code>contentChild</code> 查詢父層透過 <code>&lt;ng-content&gt;</code> <b>投影進來</b>的內容。signal 版本回傳 Signal，不必等 <code>ngAfterViewInit</code> 才能安全讀取（在 computed/effect 中讀取即可）。`,
    level: 2,
  },
  {
    q: 'NgRx 是什麼？什麼時候需要？',
    a: `Redux 模式的狀態管理：Store（單一狀態樹）、Action、Reducer（純函式）、Selector（memoized）、Effect（副作用，RxJS）。適合多頁共享、需要時間旅行除錯、大型團隊。
      較輕量的選擇：<b>NgRx SignalStore</b> 或單純「service + signal」。面試回答重點：不是每個專案都需要，看狀態共享的複雜度。`,
    level: 2,
  },
  {
    q: 'SSR、hydration、增量 hydration 是什麼？',
    a: `SSR 在伺服器渲染 HTML 改善首屏與 SEO；hydration 讓瀏覽器重用伺服器產生的 DOM（不重建）；增量 hydration 搭配 <code>@defer (hydrate on viewport)</code>，只在需要時才 hydrate 某區塊；事件重播（event replay）保留 hydration 前的使用者點擊。`,
    level: 3,
  },
  {
    q: 'standalone 元件出現前的 NgModule 還需要懂嗎？',
    a: `既有專案常見，要懂 <code>declarations</code>（元件/directive/pipe）、<code>imports</code>、<code>exports</code>、<code>providers</code>、<code>forRoot()</code>/<code>forChild()</code> 模式。遷移可用 <code>ng generate @angular/core:standalone</code>，也有 control flow、signal input 等自動 migration schematics。`,
  },
];

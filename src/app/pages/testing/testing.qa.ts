import { QaItem } from '../../shared/qa.model';

export const TESTING_QA: QaItem[] = [
  {
    q: '單元測試、整合測試、E2E 測試差別？測試金字塔？',
    a: `<ul>
      <li><b>單元</b>：測單一函式/類別/元件，依賴 mock，最快最多（Vitest）。</li>
      <li><b>整合</b>：多個單元一起（元件 + service + HttpTestingController）。</li>
      <li><b>E2E</b>：真實瀏覽器跑完整流程（Playwright、Cypress），最慢最少，但最貼近使用者。</li>
    </ul>
    金字塔：底層大量單元測試，往上越來越少。交易系統必測：價格/數量計算、委託簿合併、表單驗證、錯誤處理、權限。`,
    level: 1,
  },
  {
    q: 'Angular 21+ 為什麼改用 Vitest？和 Jasmine/Karma 差在哪？',
    a: `Karma 已停止維護；Vitest 基於 Vite/esbuild，啟動與執行快、API 相容 Jest（<code>vi.fn</code>、<code>expect</code>）、支援 jsdom/happy-dom 或真實瀏覽器模式、內建 coverage 與 watch。Angular 透過 <code>@angular/build:unit-test</code> builder 整合，測試仍用 TestBed。`,
    level: 1,
  },
  {
    q: 'TestBed 是什麼？怎麼測一個有依賴的元件？',
    a: `TestBed 建立一個測試用的 Angular 環境（injector、編譯元件）。<code>imports: [MyComponent]</code>、<code>providers</code> 可替換依賴：<code>{ provide: PriceService, useValue: mockService }</code>。
      <code>fixture.componentRef.setInput()</code> 設定 signal input；<code>await fixture.whenStable()</code> 等待變更偵測（zoneless 下取代 <code>detectChanges()</code> 的大多數用途）。`,
    code: `await TestBed.configureTestingModule({
  imports: [OrderTicket],
  providers: [{ provide: OrdersApi, useValue: { create: vi.fn(() => of({ id: 1 })) } }],
}).compileComponents();
const fixture = TestBed.createComponent(OrderTicket);
fixture.componentRef.setInput('symbol', 'BTCUSDT');
await fixture.whenStable();`,
    level: 1,
  },
  {
    q: '如何測試 HTTP 請求？',
    a: `<code>provideHttpClient()</code> + <code>provideHttpClientTesting()</code>，注入 <code>HttpTestingController</code>：<code>expectOne(url)</code> 取得請求、檢查 method/body/headers、<code>flush(data)</code> 回應、<code>afterEach(() =&gt; http.verify())</code> 確保沒有多餘請求。見「HttpTestingController」分頁。`,
    level: 1,
  },
  {
    q: '如何測試有時間性的程式（setTimeout、debounce、RxJS）？',
    a: `<ul>
      <li>一般計時器：<code>vi.useFakeTimers()</code> + <code>vi.advanceTimersByTime(ms)</code>（取代 Angular 的 <code>fakeAsync/tick</code>，後者依賴 zone.js）。</li>
      <li>RxJS：<code>TestScheduler.run()</code> marble testing，虛擬時間、精準驗證時序。</li>
      <li>Promise：<code>await</code> 或 <code>vi.runAllTimersAsync()</code>。</li>
    </ul>`,
    level: 2,
  },
  {
    q: 'mock、stub、spy 差別？',
    a: `<b>stub</b>：回傳固定值的替身；<b>spy</b>：記錄呼叫（次數、參數），可包住真實實作（<code>vi.spyOn</code>）；<b>mock</b>：預先設定期望行為並驗證互動（<code>vi.fn().mockReturnValue()</code>）。原則：mock 邊界（HTTP、時間、隨機、WebSocket），不要 mock 被測對象本身。`,
    level: 1,
  },
  {
    q: '什麼樣的程式比較好測？',
    a: `<ul>
      <li>商業邏輯抽成<b>純函式</b>（如 <code>applyBookMsg</code>、<code>specificity</code>、validator），不依賴 Angular。</li>
      <li>依賴透過 DI 注入（可替換），不要在元件內 <code>new</code> 服務或直接用全域物件。</li>
      <li>副作用（時間、隨機、網路）集中在邊界，可注入假實作（本專案 WebSocket 透過 <code>WebSocketCtor</code> 注入假的）。</li>
      <li>元件保持「薄」：模板 + 呼叫 service。</li>
    </ul>`,
    level: 2,
  },
  {
    q: '測試覆蓋率要多少才夠？',
    a: `沒有絕對數字（常見 70~80%）。覆蓋率高不代表測得好；重點是關鍵路徑與邊界條件（空值、0、負數、精度、錯誤、競態）。可用 mutation testing（Stryker）檢驗測試品質。`,
    level: 2,
  },
  {
    q: '遇到 bug 如何除錯？（職缺：troubleshoot issues）',
    a: `<ol>
      <li>重現：最小重現步驟、確認環境（瀏覽器、帳號、資料）。</li>
      <li>觀察：DevTools Console、Network（狀態碼、payload、時序）、Sources 斷點、Angular DevTools（元件樹、signal 圖、profiler）。</li>
      <li>縮小範圍：二分法註解程式、<code>git bisect</code> 找出引入 bug 的 commit。</li>
      <li>修復後<b>先寫一個會失敗的測試</b>再修，防止回歸。</li>
      <li>效能問題：Performance 面板、Memory heap snapshot、Lighthouse。</li>
      <li>線上問題：Sentry 等錯誤監控、source map、<code>ErrorHandler</code> / <code>provideBrowserGlobalErrorListeners</code>。</li>
    </ol>`,
    level: 1,
  },
  {
    q: 'E2E 測試工具 Playwright 和 Cypress 怎麼選？',
    a: `Playwright：多瀏覽器（Chromium/Firefox/WebKit）、多分頁、平行執行快、auto-wait，Angular CLI 支援 <code>ng e2e</code> 整合。Cypress：互動式除錯體驗佳、生態成熟，但跨分頁/跨網域較受限。新專案多選 Playwright。`,
    level: 2,
  },
];

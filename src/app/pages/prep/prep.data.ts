import { QaItem } from '../../shared/qa.model';

export const REQUIREMENT_MAP: { req: string; focus: string; links: string[]; nice?: boolean }[] = [
  { req: 'Angular', focus: 'Signals、standalone、control flow、DI、表單、路由、變更偵測（OnPush 預設 / zoneless）、效能', links: ['angular'] },
  { req: 'CSS / SASS / UI 實作', focus: '現場切版（Admin 版型、Dashboard）、Flex/Grid、SCSS mixin/map/@use、樣式封裝 :host/::ng-deep', links: ['layout', 'scss', 'css'] },
  { req: 'RWD', focus: 'mobile-first、斷點 mixin、container query、clamp()、100dvh、響應式圖片', links: ['layout', 'css'] },
  { req: 'JavaScript / HTML', focus: 'Event loop、閉包、this、Promise、手寫 debounce/deepClone；語意化 HTML、a11y', links: ['js', 'css'] },
  { req: 'JSON / RESTful API', focus: 'HTTP 方法與冪等、狀態碼、攔截器、錯誤處理、token 刷新、CORS、分頁', links: ['http'] },
  { req: 'Git', focus: 'merge vs rebase、衝突處理、分支策略、revert/reset、Code Review', links: ['devops'] },
  { req: 'Unit test / Troubleshoot', focus: 'Vitest + TestBed、HttpTestingController、marble test、除錯流程', links: ['testing'] },
  { req: 'React JSX（職責內容）', focus: 'Hooks、useEffect 依賴、memo、key、Redux Toolkit、Next.js；與 Angular 比較', links: ['react'] },
  { req: '大型交易系統', focus: '即時行情效能、委託簿、精度、防重複下單、斷線重連、狀態顯示', links: ['realtime', 'rxjs'] },
  { req: 'WebSockets / RxJS', focus: 'switchMap 家族、Subject、share/shareReplay、節流、重試退避、webSocket()', links: ['rxjs', 'realtime'], nice: true },
  { req: 'Node.js / Redis', focus: 'BFF、事件迴圈差異、快取策略與穿透/擊穿/雪崩', links: ['devops'], nice: true },
  { req: 'Docker / CI/CD', focus: 'multi-stage、layer cache、nginx SPA、GitHub Actions pipeline', links: ['devops'], nice: true },
  { req: 'Portfolio', focus: '<b>這個專案本身就可以當作品集</b>：Angular 22 + SCSS + RxJS + 測試 + Docker + CI，推到 GitHub 並部署（GitHub Pages / Vercel / 容器）', links: ['layout'] },
];

export const LIVE_CODING: { title: string; hint: string; link?: string }[] = [
  { title: '切一個 Admin 後台版型（側欄可收合、RWD）', hint: 'Grid areas + CSS 變數 + off-canvas', link: 'layout' },
  { title: '三欄 / 聖杯佈局、footer 貼底', hint: 'grid-template: auto 1fr auto', link: 'layout' },
  { title: '水平垂直置中（說出 3 種以上）', hint: 'flex / grid / absolute + transform', link: 'layout' },
  { title: '自動完成搜尋框', hint: 'debounceTime + distinctUntilChanged + switchMap + catchError 內層', link: 'rxjs' },
  { title: '即時報價列表，價格漲跌閃爍', hint: 'WebSocket + auditTime + directive / CSS animation', link: 'realtime' },
  { title: 'Tabs / Accordion / Modal 元件', hint: 'content projection、model()、a11y（aria-selected、Esc 關閉、focus trap）', link: 'angular' },
  { title: 'Todo List / 購物車（含篩選、總計）', hint: 'signal + computed，或 React useState + useMemo', link: 'angular' },
  { title: '表單：註冊 / 下單，含跨欄位驗證', hint: 'Reactive Forms 或 Signal Forms', link: 'angular' },
  { title: '手寫 debounce / throttle / deepClone / Promise.all', hint: '附 fake timers 測試', link: 'js' },
  { title: '輸出順序題（event loop）', hint: '同步 → microtask → macrotask', link: 'js' },
  { title: '分頁表格串 REST API，含 loading / error / empty 狀態', hint: 'httpResource 或 HttpClient + switchMap', link: 'http' },
  { title: '寫一個 service 的單元測試', hint: 'HttpTestingController', link: 'testing' },
  { title: '把一段 Angular 元件改寫成 React（或反過來）', hint: 'input → props、output → callback、signal → useState', link: 'react' },
];

export const CHECKLIST: string[] = [
  '準備 1 分鐘與 3 分鐘版本的自我介紹',
  '準備 2~3 個專案故事（STAR）：最有挑戰的、效能優化、跨部門合作',
  '能畫出過去專案的前端架構圖（模組、狀態管理、API 層、部署）',
  '能現場 15 分鐘內切出 Admin 側欄版型',
  '能解釋 switchMap / mergeMap / concatMap / exhaustMap 並舉例',
  '能說明 OnPush / zoneless / signals 如何提升效能',
  '能手寫 debounce、throttle、深拷貝',
  '複習 HTTP 狀態碼與 REST 設計',
  '能說明 WebSocket 斷線重連與高頻更新節流策略',
  '準備一個 React 小專案或至少能寫 hooks 範例',
  '作品集推上 GitHub（README 寫清楚技術選型與如何執行）',
  '準備 3 個反問面試官的問題',
  '確認面試形式（線上/現場、是否有 live coding、使用的編輯器）',
];

export const BEHAVIOR_QA: QaItem[] = [
  {
    q: '請自我介紹（建議架構）',
    a: `<ol>
      <li>身份與年資：「我是 X 年經驗的前端工程師，主要使用 Angular 與 TypeScript…」</li>
      <li>代表性成果（量化）：「負責 XX 系統的前端，把首頁載入時間從 4s 降到 1.5s / 重構表單模組讓開發時間減少 30%…」</li>
      <li>與職缺的連結：「我對即時資料處理有經驗（WebSocket + RxJS），也熟悉 SCSS 切版與 RWD，這和貴公司交易系統的需求很契合。」</li>
      <li>收尾：為什麼想加入這家公司。</li>
    </ol>`,
    level: 1,
  },
  {
    q: '說一個你遇過最困難的技術問題，怎麼解決的？',
    a: `用 <b>STAR</b>：Situation（背景）→ Task（你的責任）→ Action（你做了什麼、為什麼這樣選）→ Result（量化結果、學到什麼）。
      例：「行情頁在高峰時卡頓（S），我負責找出原因（T）。用 Performance 面板發現每筆 tick 都觸發整頁變更偵測，改成 OnPush + 在 service 層 auditTime(100) + trackBy，並把深度條改用 transform（A）。CPU 使用率下降 60%，掉幀消失（R）。」`,
    level: 1,
  },
  {
    q: '和後端 / PM / 設計師意見不同時怎麼處理？',
    a: `先理解對方的目標與限制 → 用資料或原型說話（效能數據、使用者回饋、POC）→ 提出替代方案與取捨 → 達成共識後記錄決策。強調「解決問題」而非「誰對」。`,
    level: 1,
  },
  {
    q: '如何和後端協作 API？',
    a: `先對齊 API contract（OpenAPI / Swagger）、命名與錯誤格式；後端未完成時用 mock（如本專案的 mockBackendInterceptor 或 MSW）平行開發；串接時用型別產生器（openapi-generator）減少不一致；有問題時附上 request/response 與重現步驟。`,
    level: 1,
  },
  {
    q: '你如何確保程式碼品質？',
    a: `TypeScript strict、ESLint/Prettier、單元測試覆蓋關鍵邏輯、PR + Code Review、CI 自動檢查、元件化與共用 SCSS token、文件（README、Storybook）。`,
    level: 1,
  },
  {
    q: '如何學習新技術？最近學了什麼？',
    a: `舉具體例子：「最近研究 Angular 22 的 Signal Forms 與 zoneless，做了一個面試題庫專案練習，把 RxJS 行情串流用 toSignal 接到畫面…」——直接展示這個作品。`,
    level: 1,
  },
  {
    q: '為什麼想來交易系統領域？',
    a: `連結個人興趣與技術挑戰：即時性、高頻資料、精度與穩定性要求高、使用者對延遲敏感，能鍛鍊效能優化與架構能力。`,
    level: 1,
  },
  {
    q: '反問面試官的好問題',
    a: `<ul>
      <li>前端團隊規模與分工？Angular 和 React 分別用在哪些產品？</li>
      <li>目前 Angular 版本與升級計畫？是否已導入 signals / zoneless？</li>
      <li>即時資料的架構（WebSocket gateway、訊息格式、更新頻率）？</li>
      <li>測試與 CI/CD 流程？Code Review 文化？</li>
      <li>這個職位前三個月最重要的目標是什麼？</li>
      <li>團隊目前遇到最大的技術挑戰？</li>
    </ul>`,
    level: 1,
  },
];

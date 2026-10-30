import { QaItem } from '../../shared/qa.model';

export const REALTIME_QA: QaItem[] = [
  {
    q: 'WebSocket 和 HTTP 輪詢、Long Polling、SSE 差在哪？',
    a: `<ul>
      <li><b>短輪詢</b>：定時發 HTTP，簡單但浪費且延遲高。</li>
      <li><b>Long Polling</b>：伺服器有資料才回應，回應後立刻再發。</li>
      <li><b>SSE（EventSource）</b>：伺服器→客戶端單向，走 HTTP、內建自動重連，適合通知、價格推播。</li>
      <li><b>WebSocket</b>：一次握手（HTTP Upgrade）後的全雙工長連線，低延遲、低開銷，適合交易行情、下單回報、聊天。</li>
    </ul>`,
    level: 1,
  },
  {
    q: '在 Angular 中如何封裝 WebSocket？',
    a: `用 RxJS <code>webSocket()</code> 建立 <code>WebSocketSubject</code>，包在 root service：
      <ul>
        <li>一條連線，多頻道用 <code>multiplex(subMsg, unsubMsg, filter)</code>：訂閱時自動送 sub，取消訂閱時自動送 unsub。</li>
        <li>連線狀態用 signal 公開（openObserver / closeObserver）。</li>
        <li>斷線重連：<code>retry({ delay })</code> 指數退避；重新訂閱時 multiplex 自動重送 sub。</li>
        <li>同頻道多元件共用：<code>share()</code>。</li>
        <li>元件端：<code>toSignal()</code> 或 <code>takeUntilDestroyed()</code> 確保退訂 → 最後一個訂閱者離開時才關閉連線。</li>
      </ul>`,
    code: `private socket$ = webSocket<Msg>({ url, openObserver: { next: () => this.status.set('open') } });

ticker$(symbol: string) {
  return this.socket$.multiplex(
    () => ({ op: 'sub', ch: 'ticker', symbol }),
    () => ({ op: 'unsub', ch: 'ticker', symbol }),
    (m) => m.ch === 'ticker' && m.symbol === symbol,
  ).pipe(
    retry({ delay: (_e, i) => timer(Math.min(500 * 2 ** (i - 1), 8000)), resetOnSuccess: true }),
    share(),
  );
}`,
    level: 2,
  },
  {
    q: '行情每秒上百筆更新，前端怎麼避免卡頓？',
    a: `<ol>
      <li><b>資料層節流</b>：<code>auditTime(100)</code> / <code>sampleTime</code> / <code>auditTime(0, animationFrameScheduler)</code>，人眼不需要每秒 100 次更新（本頁可切換觀察 UI 更新次數）。</li>
      <li><b>批次</b>：<code>bufferTime(250)</code> 一次合併多筆更新。</li>
      <li><b>精準更新</b>：Signals + OnPush + zoneless，只有讀到該 signal 的元件重新渲染；<code>@for</code> 用 symbol 當 track。</li>
      <li><b>計數器不要用 signal</b>：純統計用一般變數 + 每秒取樣，避免每筆訊息觸發變更偵測。</li>
      <li><b>CSS</b>：深度條用 <code>transform: scaleX()</code>、價格閃爍用 animation、<code>contain: content</code>、<code>tabular-nums</code> 避免數字跳動造成 reflow。</li>
      <li><b>大量 row</b>：Virtual Scroll；更極端可用 Canvas/WebGL（K 線圖）。</li>
      <li><b>重運算移出主執行緒</b>：Web Worker 解析/合併資料。</li>
    </ol>`,
    level: 2,
  },
  {
    q: '委託簿（Order Book）的快照 + 增量（snapshot + delta）怎麼處理？',
    a: `訂閱時先收到完整快照，之後只收變動的價位（qty = 0 代表刪除）。每則訊息有遞增 <code>seq</code>：
      <ul>
        <li>seq ≤ 目前 seq：重複或過期，丟掉。</li>
        <li>seq = 目前 + 1：套用。</li>
        <li>seq 跳號：漏訊息 → 本地簿已不可信 → 重新訂閱拿新快照（本頁用 throw + retry 實作，混亂模式會刻意漏封包）。</li>
        <li>快照到之前收到的 delta 要先暫存或忽略。</li>
      </ul>
      合併邏輯寫成純函式 <code>applyBookMsg(state, msg)</code>，方便單元測試（見 order-book.spec.ts）。`,
    level: 3,
  },
  {
    q: 'WebSocket 斷線重連要注意什麼？',
    a: `<ul>
      <li>指數退避 + 上限 + jitter（隨機抖動），避免所有客戶端同時重連打爆伺服器（thundering herd）。</li>
      <li>重連成功後要<b>重新訂閱</b>所有頻道，並重新拿快照（中間漏掉的資料）。</li>
      <li>心跳（ping/pong）偵測半開連線：一段時間沒收到訊息就主動重連（<code>timeout()</code> 運算子）。</li>
      <li>監聽 <code>online</code>/<code>offline</code>、<code>visibilitychange</code>，背景分頁可降頻或斷線。</li>
      <li>UI 顯示連線狀態，資料過期時要提示（交易系統不能讓使用者看著舊價格下單）。</li>
      <li>認證：token 過期時的重新授權流程。</li>
    </ul>`,
    code: `socket$.pipe(
  timeout({ each: 10_000, with: () => throwError(() => new Error('heartbeat timeout')) }),
  retry({ delay: (_e, i) => timer(Math.min(1000 * 2 ** i, 30_000) + Math.random() * 1000) }),
)`,
    level: 2,
  },
  {
    q: '浮點數精度在交易系統的問題？',
    a: `<code>0.1 + 0.2 !== 0.3</code>。價格與數量計算要避免直接用 JS number 累加：用整數（以最小單位 / tick 為單位）運算、後端回傳字串、或使用 <code>decimal.js</code>/<code>big.js</code>。顯示用 <code>Intl.NumberFormat</code> / Angular <code>DecimalPipe</code> 固定小數位。`,
    code: `0.1 + 0.2;                 // 0.30000000000000004
(1 * 10 + 2 * 10) / 10;    // 用整數運算再換回
new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(67890.5); // "67,890.50"`,
    level: 2,
  },
  {
    q: '下單按鈕要注意哪些事？',
    a: `<ul>
      <li>防重複送出：<code>exhaustMap</code> 或送出中 disable。</li>
      <li>冪等性：送 client order id（UUID），後端用它去重，網路重試不會重複下單。</li>
      <li>不要用 switchMap 取消下單請求。</li>
      <li>樂觀更新 vs 等回報：顯示「送出中」狀態，等 WebSocket 的 order update 才確認。</li>
      <li>二次確認（大額、市價單）、價格偏離警告。</li>
    </ul>`,
    level: 2,
  },
  {
    q: '多個分頁同時開著交易頁，怎麼避免開 N 條 WebSocket？',
    a: `用 <code>SharedWorker</code> 持有一條連線分享給所有分頁，或用 <code>BroadcastChannel</code> 選出 leader 分頁連線、再廣播給其他分頁。`,
    level: 3,
  },
  {
    q: 'Redis 在交易系統前後端扮演什麼角色？（職缺 Nice to have）',
    a: `前端通常不直接連 Redis，但要懂架構：<ul>
      <li>快取熱門資料（商品清單、最新報價、K 線），減少 DB 壓力。</li>
      <li>Pub/Sub 或 Streams：撮合引擎 → Redis → WebSocket gateway → 前端。</li>
      <li>Session / rate limit / 分散式鎖。</li>
      <li>快取策略：Cache-aside、TTL、快取失效（invalidation）、快取雪崩/穿透/擊穿。</li>
    </ul>`,
    level: 2,
  },
];

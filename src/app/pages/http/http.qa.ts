import { QaItem } from '../../shared/qa.model';

export const HTTP_QA: QaItem[] = [
  {
    q: '什麼是 RESTful API？設計原則？',
    a: `以「資源」為中心，用 URL 表示資源（名詞、複數），HTTP 方法表示動作，無狀態，回應使用正確的狀態碼。
      <code>GET /orders</code>、<code>GET /orders/1</code>、<code>POST /orders</code>、<code>PATCH /orders/1</code>、<code>DELETE /orders/1</code>；巢狀資源 <code>/users/1/orders</code>；篩選、排序、分頁放 query string：<code>?status=open&amp;sort=-createdAt&amp;page=2</code>。`,
    level: 1,
  },
  {
    q: 'GET、POST、PUT、PATCH、DELETE 差別？什麼是冪等（idempotent）？',
    a: `<table class="simple">
      <tr><th>方法</th><th>用途</th><th>冪等</th><th>安全</th></tr>
      <tr><td>GET</td><td>讀取</td><td>✓</td><td>✓</td></tr>
      <tr><td>POST</td><td>新增 / 非冪等動作（下單）</td><td>✗</td><td>✗</td></tr>
      <tr><td>PUT</td><td>整筆取代</td><td>✓</td><td>✗</td></tr>
      <tr><td>PATCH</td><td>部分更新</td><td>不一定</td><td>✗</td></tr>
      <tr><td>DELETE</td><td>刪除</td><td>✓</td><td>✗</td></tr>
    </table>
    冪等 = 執行一次和多次結果相同 → 可以安全重試。所以本頁 retryInterceptor <b>只重試 GET</b>；POST 下單要重試必須搭配 idempotency key。`,
    level: 1,
  },
  {
    q: '常見 HTTP 狀態碼？',
    a: `<ul>
      <li>200 OK、201 Created、204 No Content</li>
      <li>301/302 轉址、304 Not Modified（快取）</li>
      <li>400 Bad Request、<b>401 Unauthorized（未登入/token 失效）</b>、<b>403 Forbidden（已登入但沒權限）</b>、404 Not Found、409 Conflict、422 Unprocessable Entity（驗證失敗）、429 Too Many Requests（限流）</li>
      <li>500 Internal Server Error、502 Bad Gateway、503 Service Unavailable、504 Gateway Timeout</li>
    </ul>`,
    level: 1,
  },
  {
    q: 'HttpClient 的攔截器怎麼寫？執行順序？',
    a: `函式型 <code>HttpInterceptorFn = (req, next) =&gt; Observable</code>，用 <code>withInterceptors([...])</code> 註冊。請求依陣列順序經過，回應則反向。HttpRequest 是 immutable，要 <code>req.clone()</code> 修改。可以在攔截器中 <code>inject()</code> service。`,
    code: `export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).token();
  return next(token ? req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } }) : req);
};`,
    level: 1,
  },
  {
    q: 'Token 過期（401）時如何自動刷新並重送請求？',
    a: `攔截器 catchError 401 → 呼叫 refresh API → 以新 token 重送原請求。要處理<b>並發</b>：多個請求同時 401 時只刷新一次，其他請求等待（用 shared Observable 或 BehaviorSubject 排隊）；refresh 也失敗就登出。`,
    code: `let refreshing$: Observable<string> | null = null;

export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401 || req.url.includes('/auth/refresh')) return throwError(() => err);
      refreshing$ ??= auth.refresh().pipe(finalize(() => (refreshing$ = null)), shareReplay(1));
      return refreshing$.pipe(
        switchMap((t) => next(req.clone({ setHeaders: { Authorization: \`Bearer \${t}\` } }))),
      );
    }),
  );
};`,
    level: 3,
  },
  {
    q: '什麼是 CORS？前端能解決嗎？',
    a: `瀏覽器同源政策下，跨來源請求需要伺服器回 <code>Access-Control-Allow-Origin</code> 等 header 才放行；非簡單請求（自訂 header、PUT/DELETE、JSON content-type）會先送 <b>OPTIONS preflight</b>。
      前端無法「解決」，只能：後端設定 CORS、開發環境用 Angular dev server proxy（<code>proxy.conf.json</code>）、或同網域反向代理（nginx）。`,
    code: `// proxy.conf.json → ng serve --proxy-config proxy.conf.json
{ "/api": { "target": "http://localhost:3000", "secure": false, "changeOrigin": true } }`,
    level: 1,
  },
  {
    q: 'HTTP 快取機制？',
    a: `<ul>
      <li>強快取：<code>Cache-Control: max-age=31536000, immutable</code>（Angular build 的 hashed 檔名可長期快取），不發請求。</li>
      <li>協商快取：<code>ETag</code>/<code>If-None-Match</code>、<code>Last-Modified</code>/<code>If-Modified-Since</code> → 304。</li>
      <li><code>index.html</code> 要 <code>no-cache</code>，確保拿到最新版的 bundle 檔名。</li>
      <li>前端層：<code>shareReplay</code> 記憶、Service Worker、SWR（stale-while-revalidate）。</li>
    </ul>`,
    level: 2,
  },
  {
    q: 'JSON 相關：JSON.parse / stringify 注意事項？',
    a: `<code>stringify</code> 會忽略 undefined、函式、Symbol；Date 變 ISO 字串（parse 回來仍是字串，需要轉換）；BigInt 會報錯；循環參照報錯。大數字（超過 2^53）會失準 → 金額、ID 由後端以字串傳遞。<code>JSON.stringify(obj, null, 2)</code> 格式化，第二參數可做 replacer。`,
    level: 1,
  },
  {
    q: 'REST 和 GraphQL、gRPC、WebSocket 怎麼選？',
    a: `REST：簡單、可快取、生態成熟。GraphQL：前端決定欄位，避免 over/under-fetching，適合複雜聚合頁面。gRPC：服務間高效能二進位通訊（瀏覽器需 grpc-web）。WebSocket：雙向即時推播（行情、回報）。交易系統通常 REST（下單、查詢）+ WebSocket（行情、訂單狀態推播）並用。`,
    level: 2,
  },
  {
    q: '分頁：offset 分頁和 cursor 分頁差別？',
    a: `offset（<code>?page=3&amp;size=20</code>）：可跳頁，但資料量大時慢，且新資料插入會造成重複/遺漏。cursor（<code>?after=abc&amp;limit=20</code>）：用最後一筆的 id/時間戳往下取，穩定且高效，適合無限捲動與成交紀錄。`,
    level: 2,
  },
  {
    q: '如何取消進行中的 HTTP 請求？',
    a: `HttpClient 回傳 Observable，<code>unsubscribe()</code> 就會中止（底層 XHR abort / fetch AbortController）。<code>switchMap</code>、<code>takeUntilDestroyed</code>、<code>resource</code>/<code>httpResource</code> 的參數改變都會自動取消舊請求。`,
    level: 1,
  },
  {
    q: 'httpResource 和直接用 HttpClient 怎麼選？',
    a: `<code>httpResource</code>（Angular 22 正式）適合「讀取」：參數是 signal，自動重新請求與取消，提供 <code>value/isLoading/error/reload</code> signal。寫入（POST/PATCH/DELETE）與需要 RxJS 組合（重試、串接多個請求）時用 HttpClient。`,
    level: 2,
  },
];

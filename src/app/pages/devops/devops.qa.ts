import { QaItem } from '../../shared/qa.model';

export const GIT_CHEATSHEET = `
git switch -c feature/order-book       # 建立並切換分支
git add -p                             # 互動式挑選要提交的片段
git commit -m "feat(book): merge snapshot and delta"   # Conventional Commits
git fetch origin && git rebase origin/main             # 讓分支跟上 main（線性歷史）
git push -u origin feature/order-book
git push --force-with-lease            # rebase 後推送；比 --force 安全（遠端有別人新 commit 會拒絕）

git stash push -m "wip" / git stash pop          # 暫存未完成的修改
git cherry-pick <sha>                             # 把某個 commit 撿到目前分支（hotfix）
git revert <sha>                                  # 產生反向 commit（已推送的錯誤用這個）
git reset --soft HEAD~1                           # 撤銷上一個 commit，保留修改在 staged
git restore --staged file / git restore file      # 取消 stage / 丟棄工作區修改
git reflog                                        # 找回「消失」的 commit（reset 誤操作救星）
git bisect start / bad / good <sha>               # 二分搜尋找出引入 bug 的 commit
git log --oneline --graph --all                   # 圖形化歷史
git blame -L 10,30 file.ts                        # 每一行是誰改的
`;

export const GIT_QA: QaItem[] = [
  {
    q: 'merge 和 rebase 差在哪？',
    a: `<code>merge</code> 產生一個 merge commit，保留真實分支歷史，不改寫既有 commit。<code>rebase</code> 把你的 commit 重新接到目標分支最新處，歷史線性、乾淨，但<b>會改寫 commit hash</b>。
      黃金守則：<b>不要 rebase 已經推送、別人也在用的公用分支</b>。常見流程：個人 feature 分支 rebase main 保持更新，最後以 squash merge 或 merge 進 main。`,
    level: 1,
  },
  {
    q: 'git reset、revert、restore 差別？',
    a: `<code>reset</code> 移動分支指標（<code>--soft</code> 保留 staged、<code>--mixed</code> 保留工作區、<code>--hard</code> 全部丟棄），會改寫歷史，適合本地。<code>revert</code> 新增一個反向 commit，適合已推送的分支。<code>restore</code> 還原檔案內容。`,
    level: 1,
  },
  {
    q: '常見分支策略？',
    a: `<ul>
      <li><b>Git Flow</b>：main / develop / feature / release / hotfix，適合有版本發佈週期的產品。</li>
      <li><b>GitHub Flow</b>：main + 短命 feature 分支 + PR，持續部署。</li>
      <li><b>Trunk-based</b>：小批量頻繁合併到主幹，搭配 feature flag，CI/CD 成熟團隊常用。</li>
    </ul>`,
    level: 1,
  },
  {
    q: '遇到 merge conflict 怎麼處理？',
    a: `<code>git status</code> 找出衝突檔 → 理解雙方修改意圖（必要時找對方討論）→ 手動編輯移除 <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt;</code> 標記 → 跑測試 → <code>git add</code> → <code>git merge --continue</code> / <code>git rebase --continue</code>。lock 檔衝突通常重新 <code>npm install</code> 產生。`,
    level: 1,
  },
  {
    q: 'Code Review 你會注意什麼？',
    a: `正確性與邊界條件、可讀性與命名、是否有測試、效能（不必要的訂閱、重複請求、大量 DOM）、安全（XSS、敏感資訊）、無障礙、一致性（專案慣例）。回饋要具體、對事不對人，區分「必須修改」與「建議」。`,
    level: 2,
  },
];

export const DEVOPS_QA: QaItem[] = [
  {
    q: '為什麼用 multi-stage build？',
    a: `build 階段需要 Node、devDependencies、原始碼；runtime 只需要編譯後的靜態檔 + nginx。multi-stage 只把產物複製到最終映像檔：體積從 1GB+ 降到 ~50MB、攻擊面小、不洩漏原始碼。`,
    level: 1,
  },
  {
    q: 'Dockerfile 怎麼善用 layer cache？',
    a: `把變動少的步驟放前面：先 <code>COPY package*.json</code> + <code>npm ci</code>，再 <code>COPY . .</code>。這樣只改程式碼時不會重裝依賴。搭配 <code>.dockerignore</code> 排除 node_modules、dist。`,
    level: 1,
  },
  {
    q: 'image 和 container 差別？常用指令？',
    a: `image 是唯讀模板（類別），container 是執行中的實例（物件）。<code>docker build -t app .</code>、<code>docker run -d -p 8080:80 app</code>、<code>docker ps</code>、<code>docker logs -f id</code>、<code>docker exec -it id sh</code>、<code>docker compose up</code>（多服務：前端 + API + Redis）。`,
    level: 1,
  },
  {
    q: 'SPA 部署到 nginx 為什麼重新整理會 404？',
    a: `<code>/orders/1</code> 這種路由是前端 Router 處理的，伺服器上沒有這個檔案。nginx 需設定 <code>try_files $uri $uri/ /index.html</code> 回退到 index.html。`,
    level: 1,
  },
  {
    q: '前端的環境變數怎麼處理？同一個 image 要部署到多個環境？',
    a: `Angular 的 <code>environment.ts</code> 是 build time 決定。若要「一次 build、多處部署」，改成 runtime 設定：啟動時 fetch <code>/config.json</code>（由容器啟動時依環境變數產生）並用 <code>provideAppInitializer</code> 載入。注意：前端設定都是公開的，不能放秘密。`,
    level: 2,
  },
  {
    q: 'CI 和 CD 是什麼？前端的 pipeline 會有哪些步驟？',
    a: `CI（持續整合）：每次 push/PR 自動 install → lint → test → build，確保主幹隨時可用。CD（持續交付/部署）：自動建 image、推 registry、部署到 staging/production。
      前端常見：<code>npm ci</code>（依 lock 檔安裝）、lint、unit test、build、bundle size 檢查、E2E、Lighthouse、部署 CDN/容器、快取失效、可回滾（藍綠/金絲雀部署）。`,
    level: 1,
  },
  {
    q: 'npm install 和 npm ci 差別？',
    a: `<code>npm ci</code> 嚴格依照 <code>package-lock.json</code> 安裝、會先刪除 node_modules、lock 與 package.json 不一致時直接失敗 → CI 用它確保可重現。<code>npm install</code> 可能更新 lock 檔。`,
    level: 1,
  },
];

export const NODE_REDIS_QA: QaItem[] = [
  {
    q: 'Node.js 的事件迴圈和瀏覽器有什麼不同？',
    a: `Node 由 libuv 實作，分多個階段：timers → pending callbacks → poll（I/O）→ check（<code>setImmediate</code>）→ close。<code>process.nextTick</code> 優先於 Promise microtask。單執行緒處理 I/O 非阻塞，CPU 密集運算會阻塞，需用 worker_threads 或拆服務。`,
    level: 2,
  },
  {
    q: '前端工程師為什麼需要懂 Node.js？什麼是 BFF？',
    a: `建置工具（Angular CLI、Vite）、SSR、寫 mock server、BFF（Backend For Frontend）：為前端聚合多個後端服務、轉換資料格式、處理 session/token、WebSocket gateway。常見框架：Express、Fastify、NestJS（架構類似 Angular：module、DI、decorator）。`,
    level: 1,
    code: `// Express 最小 BFF：聚合兩個服務並快取
app.get('/api/dashboard', async (req, res) => {
  const cached = await redis.get('dashboard');
  if (cached) return res.json(JSON.parse(cached));
  const [prices, news] = await Promise.all([fetchPrices(), fetchNews()]);
  const data = { prices, news };
  await redis.set('dashboard', JSON.stringify(data), { EX: 5 }); // TTL 5 秒
  res.json(data);
});`,
  },
  {
    q: 'Redis 是什麼？常見資料結構與用途？',
    a: `記憶體型 key-value 資料庫，極快。String（快取、計數器）、Hash（物件）、List（佇列）、Set（不重複集合）、Sorted Set（排行榜、依時間排序）、Pub/Sub 與 Streams（訊息推播：撮合結果 → WebSocket gateway）。`,
    level: 1,
  },
  {
    q: '快取策略與快取問題（穿透、擊穿、雪崩）？',
    a: `<ul>
      <li>Cache-aside：讀取先查快取，miss 再查 DB 並寫回（最常見）；寫入時更新 DB 並刪除快取。</li>
      <li><b>穿透</b>：查詢不存在的資料，每次都打到 DB → 快取空值、Bloom filter。</li>
      <li><b>擊穿</b>：熱點 key 過期瞬間大量請求打 DB → 互斥鎖、熱點永不過期 + 背景更新。</li>
      <li><b>雪崩</b>：大量 key 同時過期 → TTL 加隨機值、多層快取。</li>
    </ul>`,
    level: 2,
  },
];

export const PERF_QA: QaItem[] = [
  {
    q: 'Core Web Vitals 是什麼？如何改善？',
    a: `<ul>
      <li><b>LCP</b>（最大內容繪製，&lt; 2.5s）：SSR、預載關鍵圖片（<code>NgOptimizedImage priority</code>）、CDN、減少阻塞資源。</li>
      <li><b>INP</b>（互動到下一次繪製，&lt; 200ms）：減少長任務、拆分運算、Web Worker、避免大量同步渲染。</li>
      <li><b>CLS</b>（版面位移，&lt; 0.1）：圖片/廣告預留尺寸（width/height、aspect-ratio）、字型 <code>font-display</code>、不要在既有內容上方插入元素。</li>
    </ul>`,
    level: 1,
  },
  {
    q: '如何縮小 Angular bundle？',
    a: `Lazy routes、<code>@defer</code>、移除未使用的依賴、避免整包引入（<code>lodash-es</code> 按需引入）、用 <code>ng build --stats-json</code> + esbuild analyzer 分析、設定 budgets、圖片壓縮（WebP/AVIF）、字型子集化。`,
    level: 1,
  },
  {
    q: '大量資料的列表怎麼優化？',
    a: `虛擬捲動（CDK <code>cdk-virtual-scroll-viewport</code>，只渲染可見區域）、分頁/無限捲動、<code>@for</code> 正確 track、OnPush/signals、<code>content-visibility: auto</code>、把排序/篩選移到 Web Worker 或後端。`,
    level: 2,
  },
  {
    q: '如何量測與定位前端效能問題？',
    a: `Chrome DevTools Performance（找 Long Task、Layout/Recalculate Style 過多）、Lighthouse、Angular DevTools Profiler（哪個元件變更偵測耗時）、Memory 面板找洩漏、Network 看瀑布圖與快取命中、RUM（真實使用者監控）收集 Web Vitals。`,
    level: 2,
  },
  {
    q: '預載資源：preload、prefetch、preconnect 差別？',
    a: `<code>preload</code>：目前頁面一定會用到、優先下載（關鍵字型、LCP 圖片）；<code>prefetch</code>：下一頁可能用到、閒置時下載；<code>preconnect</code>/<code>dns-prefetch</code>：提早建立到 API/CDN 網域的連線。Angular 的 <code>withPreloading(PreloadAllModules)</code> 可預載 lazy routes。`,
    level: 2,
  },
];

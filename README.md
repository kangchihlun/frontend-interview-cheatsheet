# 前端面試題庫 · Angular 22

針對 [position-requirement.md](position-requirement.md)（大型交易系統前端工程師）整理的互動式面試準備站。
每個排版與觀念都是**真實編譯、可執行**的 Angular 22 元件，demo 卡片的「HTML / SCSS / TS」分頁顯示的就是渲染該畫面的同一份原始碼。

## 執行

```bash
npm install
npm start                    # http://localhost:4200
npx ng test --watch=false    # Vitest：10 個 spec、58 個測試（含走遍所有頁籤的冒煙測試）
npm run build
docker build -t cheatsheet . && docker run -p 8080:80 cheatsheet
```

## 頁籤

| 頁籤 | 內容 |
| --- | --- |
| SCSS 排版實戰 | Flex 分割、Grid 分割（12 欄 / areas / auto-fit / subgrid）、聖杯 + sticky footer、5 層巢狀版面、Admin 側欄（收合 / 遞迴多層選單 / flyout / 手機抽屜）、Sticky 捲動區、置中、RWD（container query）、可拖拉分割視窗、交易看板 |
| SCSS 語法/架構 | map → CSS 變數主題、@each/@for/@if、mixin vs extend vs function、@use/@forward、BEM、ViewEncapsulation / :host / ::ng-deep |
| CSS/HTML 基礎 | 盒模型、BFC、position、stacking context、特異性計算器、語意化與 a11y |
| Angular 22 | signal / computed / linkedSignal / effect、input/output/model、control flow + @defer、resource / rxResource / debounced、Signal Forms、Reactive Forms、DI（@Service）、directive / pipe |
| RxJS | switch/merge/concat/exhaustMap、自動完成、4 種 Subject、組合運算子、retry 退避、hot/cold、節流比較、scan store、signal 互通 |
| 即時交易資料 | rxjs `webSocket()` + 模擬交易所：multiplex、斷線重連、委託簿快照+增量與 seq 重同步、UI 節流 |
| JavaScript/TS | Event loop 輸出順序猜謎（實際執行）、11 個手寫題（皆有測試）、TS 型別題 |
| REST API/HTTP | 函式型攔截器（auth / logging / retry / mock backend）、httpResource CRUD |
| 單元測試 | Vitest + TestBed、HttpTestingController、marble testing、fake timers |
| React 對照 | 觀念對照表、程式碼並排、Hooks / Redux / Next.js 考題 |
| Git/Docker/CI/效能 | Git、multi-stage Dockerfile、nginx、GitHub Actions、Node/Redis、Web Vitals |
| 面試準備 | 職缺要求對應表、現場 coding 題、STAR、反問、檢查清單 |

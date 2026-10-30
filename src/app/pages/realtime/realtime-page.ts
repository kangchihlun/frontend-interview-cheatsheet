import { Component, signal } from '@angular/core';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { REALTIME_QA } from './realtime.qa';
import { ConnectionBar, OrderBook, RealtimeSettings, Trades, Watchlist } from './realtime-widgets';

// @ts-ignore
import socketSrc from './fake-socket.ts' with { loader: 'text' };
// @ts-ignore
import serviceSrc from './market-data.service.ts' with { loader: 'text' };
// @ts-ignore
import bookSrc from './order-book.ts' with { loader: 'text' };
// @ts-ignore
import widgetsSrc from './realtime-widgets.ts' with { loader: 'text' };

@Component({
  selector: 'app-realtime-page',
  imports: [PageHeader, SubTabs, DemoCard, QaList, ConnectionBar, Watchlist, OrderBook, Trades],
  providers: [RealtimeSettings],
  template: `
    <app-page-header
      title="即時交易資料（WebSocket + RxJS）"
      intro="職缺 Nice to have 明確寫到 real-time data streams（WebSockets, RxJS）。這頁是一個完整的小型行情系統：rxjs <code>webSocket()</code> 連到模擬交易所，含 multiplex 多頻道、斷線指數退避重連、委託簿快照+增量與 seq 跳號重新同步、UI 節流。打開「混亂模式」觀察重連。"
    />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />
    @switch (active()) {
      @case ('live') {
        <app-connection-bar />
        <div class="grid">
          <app-demo title="自選清單 Ticker" desc="每商品約 20 tick/s；各自 auditTime 後 merge + scan。" [ts]="widgetsSrc">
            <app-watchlist />
          </app-demo>
          <app-demo title="委託簿 Order Book" desc="快照 + 增量合併；換商品用 switchMap 自動退訂。" [ts]="bookSrc">
            <app-order-book />
          </app-demo>
          <app-demo title="最新成交 Trades" desc="scan 保留最近 N 筆。" [ts]="serviceSrc">
            <app-trades />
          </app-demo>
        </div>
      }
      @case ('src') {
        <app-demo title="模擬交易所 FakeWebSocket" desc="實作瀏覽器 WebSocket 介面，注入到 rxjs webSocket({ WebSocketCtor })。" [ts]="socketSrc">
          <p class="muted">切到 TS 分頁查看。實務上測試 WebSocket 也可以用同樣的手法注入假的建構子。</p>
        </app-demo>
        <app-demo title="MarketDataService" desc="一條連線、多頻道 multiplex、重連策略、共用訂閱。" [ts]="serviceSrc">
          <p class="muted">切到 TS 分頁查看。</p>
        </app-demo>
      }
      @default {
        <app-qa-list heading="即時資料 / 交易系統面試題" [items]="qa" />
      }
    }
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 0 16px; align-items: start; }
  `,
})
export default class RealtimePage {
  protected readonly tabs: TabDef[] = [
    { id: 'live', label: '即時行情 Demo' },
    { id: 'src', label: '服務原始碼' },
    { id: 'qa', label: '📝 即時資料考題' },
  ];
  protected readonly active = signal('live');
  protected readonly qa = REALTIME_QA;
  protected readonly socketSrc = socketSrc;
  protected readonly serviceSrc = serviceSrc;
  protected readonly bookSrc = bookSrc;
  protected readonly widgetsSrc = widgetsSrc;
}

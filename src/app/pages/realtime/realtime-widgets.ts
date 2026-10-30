import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { animationFrameScheduler, auditTime, interval, map, merge, MonoTypeOperatorFunction, Observable, scan, switchMap } from 'rxjs';
import { PriceFlash } from '../angular/demos/directive-pipe-demo';
import { FakeExchange, ServerMsg } from './fake-socket';
import { MarketDataService } from './market-data.service';
import { topLevels } from './order-book';

/** 頁面層級的設定（providers 在 RealtimePage） */
@Injectable()
export class RealtimeSettings {
  /** UI 節流毫秒；0 = 每個動畫幀最多更新一次（animationFrameScheduler），-1 = 不節流 */
  readonly throttleMs = signal(100);
  readonly chaos = signal(false);
  uiUpdates = 0;
  private readonly ms$ = toObservable(this.throttleMs);

  /** 依目前設定動態套用節流（設定改變時 switchMap 重建） */
  throttle<T>(): MonoTypeOperatorFunction<T> {
    return (src: Observable<T>) =>
      this.ms$.pipe(switchMap((ms) => (ms < 0 ? src : ms === 0 ? src.pipe(auditTime(0, animationFrameScheduler)) : src.pipe(auditTime(ms)))));
  }
}

type Ticker = Extract<ServerMsg, { ch: 'ticker' }>;

@Component({
  selector: 'app-connection-bar',
  imports: [],
  template: `
    <div class="bar">
      <span class="dot {{ md.status() }}"></span>
      <b>{{ md.status() }}</b>
      <span class="muted">重試 {{ md.retries() }} 次</span>
      <span>收到 <b>{{ stats().msgs }}</b> msg/s</span>
      <span>UI 更新 <b>{{ stats().ui }}</b> 次/s</span>
      <label>
        UI 節流
        <select [value]="settings.throttleMs()" (change)="settings.throttleMs.set(+$any($event.target).value)">
          <option value="-1">不節流（每則訊息都渲染）</option>
          <option value="0">animationFrame</option>
          <option value="100">auditTime(100)</option>
          <option value="500">auditTime(500)</option>
        </select>
      </label>
      <label><input type="checkbox" [checked]="settings.chaos()" (change)="toggleChaos()" /> 混亂模式（隨機斷線、漏封包）</label>
    </div>
  `,
  styles: `
    .bar { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; padding: 8px 12px; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; font-size: 13px; margin-bottom: 12px; }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: var(--text-muted); }
    .dot.open { background: var(--up); box-shadow: 0 0 8px var(--up); }
    .dot.connecting, .dot.reconnecting { background: var(--warn); animation: blink 0.8s infinite; }
    @keyframes blink { 50% { opacity: 0.3; } }
  `,
})
export class ConnectionBar {
  protected readonly md = inject(MarketDataService);
  protected readonly settings = inject(RealtimeSettings);
  private lastMsgs = 0;
  private lastUi = 0;

  // 每秒取樣一次計數器（計數本身不是 signal，避免高頻觸發變更偵測）
  protected readonly stats = toSignal(
    interval(1000).pipe(
      map(() => {
        const msgs = this.md.messageCount - this.lastMsgs;
        const ui = this.settings.uiUpdates - this.lastUi;
        this.lastMsgs = this.md.messageCount;
        this.lastUi = this.settings.uiUpdates;
        return { msgs, ui };
      }),
    ),
    { initialValue: { msgs: 0, ui: 0 } },
  );

  protected toggleChaos() {
    this.settings.chaos.update((v) => !v);
    FakeExchange.chaos = this.settings.chaos();
  }
}

@Component({
  selector: 'app-watchlist',
  imports: [DecimalPipe, DatePipe, PriceFlash],
  template: `
    <table class="simple wl">
      <tr><th>商品</th><th class="r">最新價</th><th class="r">漲跌幅</th><th class="r">更新時間</th></tr>
      @for (s of symbols; track s) {
        @let t = tickers()[s];
        <tr>
          <td>{{ s }}</td>
          @if (t) {
            <td class="r num" [appPriceFlash]="t.price">{{ t.price | number: (t.price > 10 ? '1.2-2' : '1.4-4') }}</td>
            <td class="r num" [class.up]="t.change >= 0" [class.down]="t.change < 0">{{ t.change >= 0 ? '+' : '' }}{{ t.change | number: '1.2-2' }}%</td>
            <td class="r muted num">{{ t.ts | date: 'HH:mm:ss.SSS' }}</td>
          } @else {
            <td colspan="3" class="muted">連線中…</td>
          }
        </tr>
      }
    </table>
  `,
  styles: `
    .r { text-align: right; }
    .num { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }
    .flash-up { animation: up 0.5s; }
    .flash-down { animation: down 0.5s; }
    @keyframes up { from { background: color-mix(in srgb, var(--up) 45%, transparent); } }
    @keyframes down { from { background: color-mix(in srgb, var(--down) 45%, transparent); } }
  `,
})
export class Watchlist {
  protected readonly symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT'];
  private readonly md = inject(MarketDataService);
  private readonly settings = inject(RealtimeSettings);

  // 每個商品「各自」節流後再 merge，避免一個商品的高頻更新蓋掉其他商品
  protected readonly tickers = toSignal(
    merge(...this.symbols.map((s) => this.md.ticker$(s).pipe(this.settings.throttle<Ticker>()))).pipe(
      scan((acc, t) => {
        this.settings.uiUpdates++;
        return { ...acc, [t.symbol]: t };
      }, {} as Record<string, Ticker>),
    ),
    { initialValue: {} as Record<string, Ticker> },
  );
}

@Component({
  selector: 'app-order-book',
  imports: [DecimalPipe],
  template: `
    <div class="head">
      <select [value]="symbol()" (change)="symbol.set($any($event.target).value)">
        @for (s of symbols; track s) {
          <option>{{ s }}</option>
        }
      </select>
      <span class="muted">seq {{ view()?.seq ?? '-' }} · 重新同步 {{ resyncs() }} 次</span>
    </div>
    @if (view(); as v) {
      <div class="book">
        <div class="row-h"><span>價格</span><span>數量</span><span>累計</span></div>
        @for (r of v.asks; track r.price) {
          <div class="lvl ask" [style.--s]="r.total / v.max">
            <span class="down">{{ r.price | number: v.fmt }}</span><span>{{ r.qty | number: '1.3-3' }}</span><span>{{ r.total | number: '1.2-2' }}</span>
          </div>
        }
        <div class="mid">{{ v.mid | number: v.fmt }} <small class="muted">spread {{ v.spread | number: v.fmt }}</small></div>
        @for (r of v.bids; track r.price) {
          <div class="lvl bid" [style.--s]="r.total / v.max">
            <span class="up">{{ r.price | number: v.fmt }}</span><span>{{ r.qty | number: '1.3-3' }}</span><span>{{ r.total | number: '1.2-2' }}</span>
          </div>
        }
      </div>
    } @else {
      <p class="muted">等待快照…</p>
    }
  `,
  styles: `
    .head { display: flex; gap: 10px; align-items: center; margin-bottom: 6px; font-size: 13px; }
    .book { font-family: var(--font-mono); font-size: 12px; font-variant-numeric: tabular-nums; contain: content; }
    .row-h, .lvl { display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: right; }
    .row-h { color: var(--text-muted); }
    .lvl { position: relative; padding: 1px 0; }
    .lvl > span { position: relative; }
    /* 深度條：用 transform: scaleX 比改 width 更省效能（只觸發 composite） */
    .lvl::before { content: ''; position: absolute; inset: 0; transform-origin: right; transform: scaleX(var(--s)); opacity: 0.18; }
    .ask::before { background: var(--down); }
    .bid::before { background: var(--up); }
    .mid { padding: 4px 0; text-align: center; font-size: 15px; }
  `,
})
export class OrderBook {
  protected readonly symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'];
  protected readonly symbol = signal('BTCUSDT');
  protected readonly resyncs = signal(0);
  private readonly md = inject(MarketDataService);
  private readonly settings = inject(RealtimeSettings);

  private readonly book = toSignal(
    toObservable(this.symbol).pipe(
      switchMap((s) => this.md.book$(s)), // 換商品：自動 unsub 舊的、sub 新的
      this.settings.throttle(),
      map((b) => {
        this.settings.uiUpdates++;
        return b;
      }),
    ),
  );

  protected readonly view = computed(() => {
    const b = this.book();
    if (!b || b.seq < 0) return null;
    const asks = topLevels(b.asks, 10, 'asks').reverse();
    const bids = topLevels(b.bids, 10, 'bids');
    const bestAsk = asks.at(-1)?.price ?? 0;
    const bestBid = bids[0]?.price ?? 0;
    const max = Math.max(asks[0]?.total ?? 0, bids.at(-1)?.total ?? 0) || 1;
    return { seq: b.seq, asks, bids, max, mid: (bestAsk + bestBid) / 2, spread: bestAsk - bestBid, fmt: bestBid > 10 ? '1.2-2' : '1.4-4' };
  });

  constructor() {
    // 計算 seq 重新同步次數（book$ 內部 retry 時 seq 會回到快照值）
    let prevSeq = -1;
    toObservable(this.book)
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((b) => {
        if (b && b.seq < prevSeq) this.resyncs.update((n) => n + 1);
        prevSeq = b?.seq ?? -1;
      });
  }
}

type Trade = Extract<ServerMsg, { ch: 'trade' }>;

@Component({
  selector: 'app-trades',
  imports: [DecimalPipe, DatePipe],
  template: `
    <div class="trades">
      <div class="h"><span>價格</span><span>數量</span><span>時間</span></div>
      @for (t of trades(); track t.ts + t.price) {
        <div class="t">
          <span [class.up]="t.side === 'buy'" [class.down]="t.side === 'sell'">{{ t.price | number: '1.2-2' }}</span>
          <span>{{ t.qty }}</span>
          <span class="muted">{{ t.ts | date: 'HH:mm:ss' }}</span>
        </div>
      }
    </div>
  `,
  styles: `
    .trades { font-family: var(--font-mono); font-size: 12px; font-variant-numeric: tabular-nums; }
    .h, .t { display: grid; grid-template-columns: 1fr 1fr 1fr; text-align: right; }
    .h { color: var(--text-muted); }
  `,
})
export class Trades {
  private readonly md = inject(MarketDataService);
  // scan 保留最近 18 筆（像 ReplaySubject 的視窗）
  protected readonly trades = toSignal(
    this.md.trades$('BTCUSDT').pipe(scan((list: Trade[], t) => [t, ...list].slice(0, 18), [])),
    { initialValue: [] as Trade[] },
  );
}

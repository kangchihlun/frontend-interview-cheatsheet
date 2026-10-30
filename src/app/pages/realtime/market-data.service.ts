import { Service, signal } from '@angular/core';
import { defer, Observable, retry, scan, share, timer } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';
import { ClientMsg, FakeWebSocket, ServerMsg } from './fake-socket';
import { applyBookMsg, BookMsg, BookState, EMPTY_BOOK } from './order-book';

export type ConnStatus = 'idle' | 'connecting' | 'open' | 'reconnecting';
type Channel = ServerMsg['ch'];
type MsgOf<C extends Channel> = Extract<ServerMsg, { ch: C }>;

/**
 * 行情服務：一條 WebSocket 連線，多個頻道 multiplex 共用
 * - 連線狀態用 signal 對外公開
 * - 斷線自動重連（指數退避，上限 8 秒），重連後 multiplex 會自動重送訂閱訊息
 * - 同一頻道多個元件訂閱時用 share() 共用，不重複送 sub
 */
@Service()
export class MarketDataService {
  readonly status = signal<ConnStatus>('idle');
  readonly retries = signal(0);
  /** 收到的原始訊息數（不用 signal，避免每則訊息都觸發變更偵測） */
  messageCount = 0;

  private readonly socket$ = webSocket<ServerMsg | ClientMsg>({
    url: 'wss://mock-exchange.example/ws',
    WebSocketCtor: FakeWebSocket as unknown as typeof WebSocket, // ← 換成真的交易所只要拿掉這行
    openObserver: { next: () => this.status.set('open') },
    closeObserver: { next: (e) => this.status.set(e.wasClean ? 'idle' : 'reconnecting') },
  });

  private readonly cache = new Map<string, Observable<ServerMsg>>();

  ticker$(symbol: string) {
    return this.channel('ticker', symbol);
  }

  trades$(symbol: string) {
    return this.channel('trade', symbol);
  }

  /** 委託簿：scan 合併快照 + 增量；seq 跳號時拋錯 → retry 重新訂閱拿新快照 */
  book$(symbol: string): Observable<BookState> {
    return defer(() =>
      this.raw<BookMsg>('book', symbol).pipe(scan((state, msg) => applyBookMsg(state, msg), EMPTY_BOOK)),
    ).pipe(this.reconnect(), share());
  }

  private channel<C extends Channel>(ch: C, symbol: string): Observable<MsgOf<C>> {
    const key = `${ch}:${symbol}`;
    if (!this.cache.has(key)) {
      this.cache.set(key, this.raw<MsgOf<C>>(ch, symbol).pipe(this.reconnect(), share()));
    }
    return this.cache.get(key) as Observable<MsgOf<C>>;
  }

  private raw<T extends ServerMsg>(ch: Channel, symbol: string): Observable<T> {
    return defer(() => {
      if (this.status() === 'idle') this.status.set('connecting');
      return this.socket$.multiplex(
        () => ({ op: 'sub', ch, symbol }) satisfies ClientMsg,
        () => ({ op: 'unsub', ch, symbol }) satisfies ClientMsg,
        (m) => {
          const ok = !('op' in m) && m.ch === ch && m.symbol === symbol;
          if (ok) this.messageCount++;
          return ok;
        },
      ) as Observable<T>;
    });
  }

  private reconnect<T>() {
    return retry<T>({
      delay: (_err, attempt) => {
        this.retries.update((n) => n + 1);
        this.status.set('reconnecting');
        return timer(Math.min(500 * 2 ** (attempt - 1), 8000));
      },
      resetOnSuccess: true, // 成功收到資料後，退避時間歸零
    });
  }
}

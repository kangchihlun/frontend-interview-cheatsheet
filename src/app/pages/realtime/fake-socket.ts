/**
 * 假的 WebSocket（模擬交易所行情伺服器），實作瀏覽器 WebSocket 介面的子集，
 * 透過 rxjs webSocket({ WebSocketCtor }) 注入 —— 所以前端程式碼跟連真的交易所一模一樣。
 *
 * 協定：
 *   client → { op: 'sub' | 'unsub', ch: 'ticker' | 'book' | 'trade', symbol }
 *   server → { ch: 'ticker', symbol, price, change, ts }
 *            { ch: 'book', symbol, type: 'snapshot' | 'delta', seq, bids, asks }
 *            { ch: 'trade', symbol, price, qty, side, ts }
 */
export type Level = [price: number, qty: number];

export type ServerMsg =
  | { ch: 'ticker'; symbol: string; price: number; change: number; ts: number }
  | { ch: 'book'; symbol: string; type: 'snapshot' | 'delta'; seq: number; bids: Level[]; asks: Level[] }
  | { ch: 'trade'; symbol: string; price: number; qty: number; side: 'buy' | 'sell'; ts: number };

export type ClientMsg = { op: 'sub' | 'unsub'; ch: ServerMsg['ch']; symbol: string };

const BASE: Record<string, number> = { BTCUSDT: 67890, ETHUSDT: 3456, SOLUSDT: 178, BNBUSDT: 612, XRPUSDT: 0.62 };

export class FakeExchange {
  /** 混亂模式：隨機斷線、隨機丟掉一個 delta（造成 seq 跳號） */
  static chaos = false;
  /** 每秒每個商品的 ticker 數量 */
  static tickRate = 20;
}

export class FakeWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readyState = FakeWebSocket.CONNECTING;
  binaryType: BinaryType = 'blob';
  onopen: ((e: Event) => void) | null = null;
  onmessage: ((e: MessageEvent) => void) | null = null;
  onclose: ((e: CloseEvent) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;

  private readonly timers = new Set<ReturnType<typeof setInterval>>();
  private readonly subs = new Map<string, ReturnType<typeof setInterval>>();
  private readonly prices = new Map<string, number>();
  private readonly seqs = new Map<string, number>();

  constructor(readonly url: string) {
    const t = setTimeout(() => {
      this.readyState = FakeWebSocket.OPEN;
      this.onopen?.(new Event('open'));
      // 混亂模式：3~8 秒後隨機斷線
      const chaos = setInterval(() => {
        if (FakeExchange.chaos && Math.random() < 0.25) this.drop();
      }, 2000);
      this.timers.add(chaos);
    }, 400);
    this.timers.add(t as unknown as ReturnType<typeof setInterval>);
  }

  send(raw: string) {
    if (this.readyState !== FakeWebSocket.OPEN) throw new Error('WebSocket is not open');
    const msg = JSON.parse(raw) as ClientMsg;
    const key = `${msg.ch}:${msg.symbol}`;
    if (msg.op === 'unsub') {
      clearInterval(this.subs.get(key));
      this.subs.delete(key);
      return;
    }
    if (this.subs.has(key)) return;
    if (msg.ch === 'book') this.emit(this.bookSnapshot(msg.symbol));
    const period = msg.ch === 'ticker' ? 1000 / FakeExchange.tickRate : msg.ch === 'book' ? 120 : 250;
    this.subs.set(
      key,
      setInterval(() => this.produce(msg.ch, msg.symbol), period),
    );
  }

  close(code = 1000, reason = '') {
    if (this.readyState >= FakeWebSocket.CLOSING) return;
    this.shutdown();
    this.onclose?.(new CloseEvent('close', { code, reason, wasClean: code === 1000 }));
  }

  addEventListener() {}
  removeEventListener() {}

  // ── server 端邏輯 ──────────────────────────────

  private drop() {
    this.shutdown();
    this.onclose?.(new CloseEvent('close', { code: 1006, reason: 'abnormal closure (chaos)', wasClean: false }));
  }

  private shutdown() {
    this.readyState = FakeWebSocket.CLOSED;
    this.timers.forEach((t) => clearInterval(t));
    this.subs.forEach((t) => clearInterval(t));
    this.timers.clear();
    this.subs.clear();
  }

  private price(symbol: string) {
    const base = BASE[symbol] ?? 100;
    const prev = this.prices.get(symbol) ?? base;
    const next = Math.max(base * 0.5, prev * (1 + (Math.random() - 0.5) * 0.0015));
    this.prices.set(symbol, next);
    return next;
  }

  private produce(ch: ServerMsg['ch'], symbol: string) {
    const base = BASE[symbol] ?? 100;
    if (ch === 'ticker') {
      const price = this.price(symbol);
      this.emit({ ch, symbol, price, change: ((price - base) / base) * 100, ts: Date.now() });
    } else if (ch === 'trade') {
      if (Math.random() < 0.4) return;
      this.emit({ ch, symbol, price: this.price(symbol), qty: +(Math.random() * 2).toFixed(4), side: Math.random() > 0.5 ? 'buy' : 'sell', ts: Date.now() });
    } else {
      const seq = (this.seqs.get(symbol) ?? 0) + 1;
      this.seqs.set(symbol, seq);
      // 混亂模式：偶爾「漏送」一個 delta，讓 client 偵測 seq 跳號
      if (FakeExchange.chaos && Math.random() < 0.03) return;
      const mid = this.prices.get(symbol) ?? base;
      const tick = tickSize(base);
      const rnd = (side: 1 | -1): Level => {
        const p = roundTo(mid + side * tick * (1 + Math.floor(Math.random() * 12)), tick);
        return [p, Math.random() < 0.2 ? 0 : +(Math.random() * 5).toFixed(3)]; // qty 0 = 刪除該價位
      };
      this.emit({ ch, symbol, type: 'delta', seq, bids: [rnd(-1), rnd(-1)], asks: [rnd(1), rnd(1)] });
    }
  }

  private bookSnapshot(symbol: string): ServerMsg {
    const base = BASE[symbol] ?? 100;
    const mid = this.prices.get(symbol) ?? base;
    const tick = tickSize(base);
    const side = (dir: 1 | -1): Level[] =>
      Array.from({ length: 15 }, (_, i) => [roundTo(mid + dir * tick * (i + 1), tick), +(Math.random() * 5 + 0.1).toFixed(3)]);
    const seq = this.seqs.get(symbol) ?? 0;
    return { ch: 'book', symbol, type: 'snapshot', seq, bids: side(-1), asks: side(1) };
  }

  private emit(msg: ServerMsg) {
    if (this.readyState !== FakeWebSocket.OPEN) return;
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(msg) }));
  }
}

function tickSize(base: number) {
  return base > 1000 ? 0.5 : base > 10 ? 0.01 : 0.0001;
}

function roundTo(v: number, step: number) {
  return Math.round(v / step) * step;
}

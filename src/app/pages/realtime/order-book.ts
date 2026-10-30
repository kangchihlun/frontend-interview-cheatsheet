import { Level, ServerMsg } from './fake-socket';

export interface BookState {
  seq: number;
  bids: Map<number, number>;
  asks: Map<number, number>;
}

export type BookMsg = Extract<ServerMsg, { ch: 'book' }>;

export class SequenceGapError extends Error {
  constructor(
    readonly expected: number,
    readonly got: number,
  ) {
    super(`seq gap: expected ${expected}, got ${got}`);
  }
}

export const EMPTY_BOOK: BookState = { seq: -1, bids: new Map(), asks: new Map() };

/**
 * 委託簿「快照 + 增量」合併（純函式，方便單元測試）
 * - snapshot：整本覆蓋
 * - delta：qty = 0 代表刪除該價位，否則覆寫
 * - seq 必須連續，跳號代表漏訊息 → 丟出錯誤讓上層重新訂閱取得新快照
 */
export function applyBookMsg(state: BookState, msg: BookMsg): BookState {
  if (msg.type === 'snapshot') {
    return { seq: msg.seq, bids: new Map(msg.bids), asks: new Map(msg.asks) };
  }
  if (state.seq < 0) return state; // 還沒收到快照前的 delta 直接忽略
  if (msg.seq <= state.seq) return state; // 重複 / 過期訊息
  if (msg.seq !== state.seq + 1) throw new SequenceGapError(state.seq + 1, msg.seq);

  const bids = new Map(state.bids);
  const asks = new Map(state.asks);
  apply(bids, msg.bids);
  apply(asks, msg.asks);
  return { seq: msg.seq, bids, asks };
}

function apply(side: Map<number, number>, levels: Level[]) {
  for (const [price, qty] of levels) {
    if (qty === 0) side.delete(price);
    else side.set(price, qty);
  }
}

export interface BookRow {
  price: number;
  qty: number;
  /** 累積量，用來畫深度條 */
  total: number;
}

/** 取前 N 檔並計算累積深度：bids 由高到低、asks 由低到高 */
export function topLevels(side: Map<number, number>, n: number, dir: 'bids' | 'asks'): BookRow[] {
  const sorted = [...side.entries()].sort((a, b) => (dir === 'bids' ? b[0] - a[0] : a[0] - b[0])).slice(0, n);
  let total = 0;
  return sorted.map(([price, qty]) => ({ price, qty, total: (total += qty) }));
}

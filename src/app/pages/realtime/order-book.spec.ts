import { describe, expect, it } from 'vitest';
import { applyBookMsg, BookMsg, EMPTY_BOOK, SequenceGapError, topLevels } from './order-book';

const snapshot: BookMsg = {
  ch: 'book',
  symbol: 'BTCUSDT',
  type: 'snapshot',
  seq: 10,
  bids: [
    [100, 1],
    [99, 2],
  ],
  asks: [
    [101, 1],
    [102, 3],
  ],
};

const delta = (seq: number, bids: [number, number][] = [], asks: [number, number][] = []): BookMsg => ({
  ch: 'book',
  symbol: 'BTCUSDT',
  type: 'delta',
  seq,
  bids,
  asks,
});

describe('applyBookMsg', () => {
  it('snapshot 會整本覆蓋', () => {
    const s = applyBookMsg(EMPTY_BOOK, snapshot);
    expect(s.seq).toBe(10);
    expect([...s.bids]).toEqual([
      [100, 1],
      [99, 2],
    ]);
  });

  it('快照前收到的 delta 直接忽略', () => {
    expect(applyBookMsg(EMPTY_BOOK, delta(1, [[1, 1]]))).toBe(EMPTY_BOOK);
  });

  it('delta 覆寫數量，qty = 0 刪除價位', () => {
    const s0 = applyBookMsg(EMPTY_BOOK, snapshot);
    const s1 = applyBookMsg(s0, delta(11, [[100, 5], [99, 0]], [[103, 1]]));
    expect(s1.bids.get(100)).toBe(5);
    expect(s1.bids.has(99)).toBe(false);
    expect(s1.asks.get(103)).toBe(1);
    // 不可變：舊 state 不被修改
    expect(s0.bids.get(100)).toBe(1);
  });

  it('重複 / 過期的 seq 會被忽略', () => {
    const s0 = applyBookMsg(EMPTY_BOOK, snapshot);
    expect(applyBookMsg(s0, delta(10, [[100, 9]]))).toBe(s0);
  });

  it('seq 跳號丟出 SequenceGapError', () => {
    const s0 = applyBookMsg(EMPTY_BOOK, snapshot);
    expect(() => applyBookMsg(s0, delta(12))).toThrow(SequenceGapError);
  });
});

describe('topLevels', () => {
  it('bids 由高到低、asks 由低到高，並計算累計量', () => {
    const s = applyBookMsg(EMPTY_BOOK, snapshot);
    expect(topLevels(s.bids, 5, 'bids').map((r) => [r.price, r.total])).toEqual([
      [100, 1],
      [99, 3],
    ]);
    expect(topLevels(s.asks, 1, 'asks')).toEqual([{ price: 101, qty: 1, total: 1 }]);
  });
});

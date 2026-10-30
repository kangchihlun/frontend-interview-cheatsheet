import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { curry, debounce, deepClone, EventEmitter, flatten, formatThousands, LRUCache, promiseAll, runWithConcurrency, throttle } from './handwritten';

describe('debounce', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('連續呼叫只執行最後一次', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d(1);
    d(2);
    vi.advanceTimersByTime(99);
    d(3);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it('cancel 後不會執行', () => {
    const fn = vi.fn();
    const d = debounce(fn, 100);
    d();
    d.cancel();
    vi.runAllTimers();
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('throttle', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('leading 立即執行，期間內最後一次 trailing 執行', () => {
    const fn = vi.fn();
    const t = throttle(fn, 100);
    t('a'); // leading
    t('b');
    t('c');
    expect(fn).toHaveBeenNthCalledWith(1, 'a');
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('c');
  });
});

describe('deepClone', () => {
  it('處理巢狀、Date、Map、Set 與循環參照', () => {
    const src: Record<string, unknown> = { a: { b: [1, { c: 2 }] }, d: new Date(1000), m: new Map([['k', { v: 1 }]]), s: new Set([1, 2]) };
    src['self'] = src;
    const out = deepClone(src);

    expect(out).not.toBe(src);
    expect(out).toEqual(src);
    expect(out['self']).toBe(out);
    expect(out['d']).not.toBe(src['d']);
    expect((out['m'] as Map<string, object>).get('k')).not.toBe((src['m'] as Map<string, object>).get('k'));
  });
});

describe('promiseAll', () => {
  it('依輸入順序回傳結果', async () => {
    const slow = new Promise((r) => setTimeout(() => r('slow'), 20));
    await expect(promiseAll([slow, 'sync', Promise.resolve('fast')])).resolves.toEqual(['slow', 'sync', 'fast']);
  });

  it('任一失敗就 reject', async () => {
    await expect(promiseAll([Promise.resolve(1), Promise.reject(new Error('boom'))])).rejects.toThrow('boom');
  });

  it('空陣列立即 resolve', async () => {
    await expect(promiseAll([])).resolves.toEqual([]);
  });
});

describe('runWithConcurrency', () => {
  it('同時執行數不超過上限，且結果順序正確', async () => {
    let running = 0;
    let peak = 0;
    const tasks = [30, 10, 20, 5].map((ms, i) => async () => {
      peak = Math.max(peak, ++running);
      await new Promise((r) => setTimeout(r, ms));
      running--;
      return i;
    });
    await expect(runWithConcurrency(tasks, 2)).resolves.toEqual([0, 1, 2, 3]);
    expect(peak).toBe(2);
  });
});

describe('其他手寫題', () => {
  it('curry', () => {
    const add = curry((a: number, b: number, c: number) => a + b + c);
    expect(add(1)(2)(3)).toBe(6);
    expect(add(1, 2)(3)).toBe(6);
    expect(add(1, 2, 3)).toBe(6);
  });

  it('flatten', () => {
    expect(flatten([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
    expect(flatten([1, [2, [3, [4]]]], 1)).toEqual([1, 2, [3, [4]]]);
  });

  it('EventEmitter on / once / off', () => {
    const e = new EventEmitter<{ msg: [string] }>();
    const on = vi.fn();
    const once = vi.fn();
    const off = e.on('msg', on);
    e.once('msg', once);
    e.emit('msg', 'a');
    e.emit('msg', 'b');
    off();
    e.emit('msg', 'c');
    expect(on.mock.calls).toEqual([['a'], ['b']]);
    expect(once).toHaveBeenCalledTimes(1);
  });

  it('LRUCache 淘汰最久未使用', () => {
    const c = new LRUCache<string, number>(2);
    c.set('a', 1);
    c.set('b', 2);
    c.get('a');
    c.set('c', 3);
    expect(c.get('b')).toBeUndefined();
    expect(c.keys()).toEqual(['a', 'c']);
  });

  it.each([
    [1234567.891, '1,234,567.891'],
    [-1000, '-1,000'],
    [999, '999'],
    ['1000000', '1,000,000'],
  ])('formatThousands(%s) = %s', (input, expected) => {
    expect(formatThousands(input)).toBe(expected);
  });
});

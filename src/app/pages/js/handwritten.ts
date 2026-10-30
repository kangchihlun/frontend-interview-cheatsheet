// 手寫題：面試最常要求現場實作的函式（皆有對應單元測試 handwritten.spec.ts）

/** 1. debounce：停止觸發 wait 毫秒後才執行最後一次 */
export function debounce<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const debounced = (...args: A) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
  debounced.cancel = () => clearTimeout(timer);
  return debounced;
}

/** 2. throttle：wait 毫秒內最多執行一次（leading + trailing） */
export function throttle<A extends unknown[]>(fn: (...args: A) => void, wait: number) {
  let last = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: A | undefined;
  return (...args: A) => {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      last = now;
      fn(...args);
    } else {
      pending = args;
      timer ??= setTimeout(() => {
        last = Date.now();
        timer = undefined;
        fn(...pending!);
      }, remaining);
    }
  };
}

/** 3. deepClone：處理循環參照、Date、RegExp、Map、Set、陣列（現代也可用 structuredClone） */
export function deepClone<T>(value: T, seen = new WeakMap<object, unknown>()): T {
  if (value === null || typeof value !== 'object') return value;
  if (seen.has(value)) return seen.get(value) as T;
  if (value instanceof Date) return new Date(value) as T;
  if (value instanceof RegExp) return new RegExp(value.source, value.flags) as T;
  if (value instanceof Map) {
    const m = new Map();
    seen.set(value, m);
    value.forEach((v, k) => m.set(deepClone(k, seen), deepClone(v, seen)));
    return m as T;
  }
  if (value instanceof Set) {
    const s = new Set();
    seen.set(value, s);
    value.forEach((v) => s.add(deepClone(v, seen)));
    return s as T;
  }
  const out = (Array.isArray(value) ? [] : Object.create(Object.getPrototypeOf(value))) as Record<PropertyKey, unknown>;
  seen.set(value, out);
  for (const key of Reflect.ownKeys(value)) out[key] = deepClone((value as Record<PropertyKey, unknown>)[key], seen);
  return out as T;
}

/** 4. Promise.all：保持順序、任一失敗就 reject、空陣列直接 resolve */
export function promiseAll<T>(items: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]> {
  return new Promise((resolve, reject) => {
    const list = [...items];
    const results: Awaited<T>[] = new Array(list.length);
    let done = 0;
    if (list.length === 0) return resolve(results);
    list.forEach((item, i) => {
      Promise.resolve(item).then((v) => {
        results[i] = v as Awaited<T>;
        if (++done === list.length) resolve(results);
      }, reject);
    });
  });
}

/** 5. 限制並發數的請求池（例如同時最多 3 個上傳） */
export async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

/** 6. curry */
export function curry(fn: (...args: any[]) => any): any {
  return function curried(this: unknown, ...args: unknown[]): unknown {
    return args.length >= fn.length ? fn.apply(this, args) : (...more: unknown[]) => curried.apply(this, [...args, ...more]);
  };
}

/** 7. 陣列攤平（不用 Array.prototype.flat） */
export function flatten(arr: unknown[], depth = Infinity): unknown[] {
  return depth > 0 ? arr.reduce<unknown[]>((acc, v) => acc.concat(Array.isArray(v) ? flatten(v, depth - 1) : [v]), []) : arr.slice();
}

/** 8. EventEmitter（觀察者模式） */
export class EventEmitter<Events extends Record<string, unknown[]>> {
  private handlers = new Map<keyof Events, Set<(...args: any[]) => void>>();

  on<K extends keyof Events>(event: K, fn: (...args: Events[K]) => void) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(fn);
    return () => this.off(event, fn); // 回傳取消函式
  }

  once<K extends keyof Events>(event: K, fn: (...args: Events[K]) => void) {
    const off = this.on(event, (...args) => {
      off();
      fn(...args);
    });
    return off;
  }

  off<K extends keyof Events>(event: K, fn: (...args: Events[K]) => void) {
    this.handlers.get(event)?.delete(fn);
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]) {
    [...(this.handlers.get(event) ?? [])].forEach((fn) => fn(...args));
  }
}

/** 9. LRU Cache：利用 Map 保持插入順序 */
export class LRUCache<K, V> {
  private map = new Map<K, V>();
  constructor(private readonly capacity: number) {}

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const v = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, v); // 移到最新
    return v;
  }

  set(key: K, value: V) {
    this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) this.map.delete(this.map.keys().next().value!); // 刪最舊
  }

  keys() {
    return [...this.map.keys()];
  }
}

/** 10. 千分位格式化（不用 toLocaleString） */
export function formatThousands(n: number | string): string {
  const [int, dec] = String(n).split('.');
  const sign = int.startsWith('-') ? '-' : '';
  const digits = int.replace('-', '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return sign + digits + (dec ? `.${dec}` : '');
}

/** 11. 手寫 call / bind */
export function myCall<T, A extends unknown[], R>(fn: (this: T, ...args: A) => R, thisArg: T, ...args: A): R {
  const key = Symbol('fn');
  const ctx = (thisArg ?? globalThis) as Record<symbol, unknown>;
  ctx[key] = fn;
  try {
    return (ctx[key] as (...a: A) => R)(...args);
  } finally {
    delete ctx[key];
  }
}

export function myBind<T, R>(fn: (this: T, ...args: any[]) => R, thisArg: T, ...preset: unknown[]) {
  return (...args: unknown[]) => fn.apply(thisArg, [...preset, ...args]);
}

import { Component, signal } from '@angular/core';
import { curry, debounce, deepClone, EventEmitter, flatten, formatThousands, LRUCache, myBind, myCall, promiseAll, runWithConcurrency, throttle } from './handwritten';

interface Check {
  name: string;
  run: () => Promise<string> | string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const CHECKS: Check[] = [
  {
    name: 'debounce(fn, 100)：50ms 內連呼叫 5 次',
    run: async () => {
      const calls: number[] = [];
      const d = debounce((n: number) => calls.push(n), 100);
      for (let i = 1; i <= 5; i++) {
        d(i);
        await sleep(10);
      }
      await sleep(150);
      return `實際執行 ${calls.length} 次，參數 = ${calls}`;
    },
  },
  {
    name: 'throttle(fn, 100)：300ms 內每 20ms 呼叫一次',
    run: async () => {
      let count = 0;
      const t = throttle(() => count++, 100);
      const end = Date.now() + 300;
      while (Date.now() < end) {
        t();
        await sleep(20);
      }
      await sleep(120);
      return `執行 ${count} 次（約 300 / 100 + 1）`;
    },
  },
  {
    name: 'deepClone：循環參照 + Date + Map',
    run: () => {
      const a: Record<string, unknown> = { d: new Date(0), m: new Map([['k', { v: 1 }]]) };
      a['self'] = a;
      const b = deepClone(a);
      return `b !== a: ${b !== a}，b.self === b: ${b['self'] === b}，Date 是新物件: ${b['d'] !== a['d']}，Map 內物件是新的: ${(b['m'] as Map<string, object>).get('k') !== (a['m'] as Map<string, object>).get('k')}`;
    },
  },
  {
    name: 'promiseAll：保持順序（後完成的排前面也一樣）',
    run: async () => {
      const r = await promiseAll([sleep(60).then(() => 'A'), 'B', sleep(10).then(() => 'C')]);
      const err = await promiseAll([Promise.reject(new Error('x')), 1]).catch((e: Error) => `rejected: ${e.message}`);
      return `${JSON.stringify(r)}；有一個失敗 → ${err}`;
    },
  },
  {
    name: 'runWithConcurrency：6 個任務、上限 2',
    run: async () => {
      let running = 0;
      let peak = 0;
      const tasks = Array.from({ length: 6 }, (_, i) => async () => {
        running++;
        peak = Math.max(peak, running);
        await sleep(30);
        running--;
        return i;
      });
      const r = await runWithConcurrency(tasks, 2);
      return `結果 ${JSON.stringify(r)}，同時執行最大數 = ${peak}`;
    },
  },
  { name: 'curry((a,b,c) => a+b+c)', run: () => `add(1)(2)(3) = ${curry((a: number, b: number, c: number) => a + b + c)(1)(2)(3)}，add(1, 2)(3) = ${curry((a: number, b: number, c: number) => a + b + c)(1, 2)(3)}` },
  { name: 'flatten([1,[2,[3,[4]]]])', run: () => `depth=∞ → ${JSON.stringify(flatten([1, [2, [3, [4]]]]))}，depth=1 → ${JSON.stringify(flatten([1, [2, [3, [4]]]], 1))}` },
  {
    name: 'EventEmitter：on / once / off',
    run: () => {
      const e = new EventEmitter<{ tick: [number] }>();
      const got: string[] = [];
      const off = e.on('tick', (n) => got.push(`on:${n}`));
      e.once('tick', (n) => got.push(`once:${n}`));
      e.emit('tick', 1);
      e.emit('tick', 2);
      off();
      e.emit('tick', 3);
      return got.join(', ');
    },
  },
  {
    name: 'LRUCache(2)',
    run: () => {
      const c = new LRUCache<string, number>(2);
      c.set('a', 1);
      c.set('b', 2);
      c.get('a'); // a 變最新
      c.set('c', 3); // 淘汰 b
      return `keys = ${JSON.stringify(c.keys())}（b 被淘汰）`;
    },
  },
  { name: 'formatThousands', run: () => [1234567.891, -1000, 999].map(formatThousands).join(' | ') },
  {
    name: 'myCall / myBind',
    run: () => {
      function greet(this: { name: string }, greeting: string) {
        return `${greeting}, ${this.name}`;
      }
      return `${myCall(greet, { name: 'call' }, 'Hi')} / ${myBind(greet, { name: 'bind' }, 'Hello')()}`;
    },
  },
];

@Component({
  selector: 'app-handwritten-demo',
  template: `
    <button class="btn primary" type="button" (click)="runAll()">▶ 全部執行</button>
    <table class="simple tbl">
      @for (c of checks; track c.name; let i = $index) {
        <tr>
          <td><button class="btn" type="button" (click)="run(i)">▶</button></td>
          <td>{{ c.name }}</td>
          <td class="res">{{ results()[i] ?? '' }}</td>
        </tr>
      }
    </table>
  `,
  styles: `.tbl { margin-top: 10px; } .res { font-family: var(--font-mono); font-size: 12px; }`,
})
export class HandwrittenDemo {
  protected readonly checks = CHECKS;
  protected readonly results = signal<Record<number, string>>({});

  protected async run(i: number) {
    this.results.update((r) => ({ ...r, [i]: '執行中…' }));
    const out = await CHECKS[i].run();
    this.results.update((r) => ({ ...r, [i]: out }));
  }

  protected runAll() {
    CHECKS.forEach((_, i) => this.run(i));
  }
}

import { Component, DestroyRef, ElementRef, inject, signal, viewChild, afterNextRender } from '@angular/core';
import { auditTime, bufferTime, debounceTime, fromEvent, map, Observable, sampleTime, share, throttleTime } from 'rxjs';

type Op = 'raw' | 'throttleTime(300)' | 'auditTime(300)' | 'sampleTime(300)' | 'debounceTime(300)' | 'bufferTime(1000)';

/** 高頻事件（滑鼠、scroll、行情 tick）的節流比較 */
@Component({
  selector: 'app-rate-limit-demo',
  template: `
    <div #pad class="pad">在這裡移動滑鼠 🖱️（或用手指滑動）</div>
    <table class="simple">
      <tr><th>運算子</th><th>觸發次數</th><th>最後值 (x)</th><th>說明</th></tr>
      @for (op of ops; track op) {
        <tr>
          <td><code>{{ op }}</code></td>
          <td><b>{{ counts()[op] }}</b></td>
          <td>{{ lasts()[op] }}</td>
          <td class="muted">{{ hints[op] }}</td>
        </tr>
      }
    </table>
    <button class="btn" type="button" (click)="reset()">歸零</button>
  `,
  styles: `
    .pad { height: 120px; display: grid; place-items: center; margin-bottom: 10px; border: 2px dashed var(--primary); border-radius: 8px; touch-action: none; user-select: none; }
    td { font-size: 13px; }
  `,
})
export class RateLimitDemo {
  protected readonly ops: Op[] = ['raw', 'throttleTime(300)', 'auditTime(300)', 'sampleTime(300)', 'debounceTime(300)', 'bufferTime(1000)'];
  protected readonly hints: Record<Op, string> = {
    raw: '原始事件',
    'throttleTime(300)': '先送第一個，之後 300ms 內忽略（leading）→ 按鈕防連點、捲動',
    'auditTime(300)': '收到後等 300ms 送「期間最後一個」（trailing）→ 行情 UI 更新',
    'sampleTime(300)': '固定每 300ms 取樣一次最新值（沒新值不送）',
    'debounceTime(300)': '停止 300ms 後才送 → 搜尋輸入、resize 結束',
    'bufferTime(1000)': '每 1 秒把期間所有事件打包成陣列 → 批次寫入、批次渲染',
  };
  protected readonly counts = signal<Record<Op, number>>(this.zero());
  protected readonly lasts = signal<Record<Op, string>>(this.blank());
  private readonly pad = viewChild.required<ElementRef<HTMLElement>>('pad');

  constructor() {
    const destroyRef = inject(DestroyRef);
    // DOM 存在後才能 fromEvent
    afterNextRender(() => {
      const move$ = fromEvent<PointerEvent>(this.pad().nativeElement, 'pointermove').pipe(
        map((e) => Math.round(e.offsetX)),
        share(),
      );
      const streams: Record<Op, Observable<number | number[]>> = {
        raw: move$,
        'throttleTime(300)': move$.pipe(throttleTime(300)),
        'auditTime(300)': move$.pipe(auditTime(300)),
        'sampleTime(300)': move$.pipe(sampleTime(300)),
        'debounceTime(300)': move$.pipe(debounceTime(300)),
        'bufferTime(1000)': move$.pipe(bufferTime(1000)),
      };
      const subs = this.ops.map((op) =>
        streams[op].subscribe((v) => {
          if (Array.isArray(v) && v.length === 0) return;
          this.counts.update((c) => ({ ...c, [op]: c[op] + 1 }));
          this.lasts.update((l) => ({ ...l, [op]: Array.isArray(v) ? `[${v.length} 筆]` : String(v) }));
        }),
      );
      destroyRef.onDestroy(() => subs.forEach((s) => s.unsubscribe()));
    });
  }

  protected reset() {
    this.counts.set(this.zero());
    this.lasts.set(this.blank());
  }

  private zero(): Record<Op, number> {
    return Object.fromEntries(this.ops.map((o) => [o, 0])) as Record<Op, number>;
  }

  private blank(): Record<Op, string> {
    return Object.fromEntries(this.ops.map((o) => [o, '-'])) as Record<Op, string>;
  }
}

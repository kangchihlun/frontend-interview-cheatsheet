import { Component, signal } from '@angular/core';
import { HeavyChart } from './heavy-chart';

type Status = 'idle' | 'loading' | 'error' | 'done';

@Component({
  selector: 'app-control-flow-demo',
  imports: [HeavyChart],
  template: `
    <div class="row">
      @for (s of statuses; track s) {
        <button class="btn" type="button" [class.primary]="status() === s" (click)="status.set(s)">{{ s }}</button>
      }
      <button class="btn" type="button" (click)="add()">+ 新增</button>
      <button class="btn" type="button" (click)="shuffle()">打亂（觀察 track 保留 DOM）</button>
      <button class="btn" type="button" (click)="items.set([])">清空</button>
    </div>

    <!-- @switch -->
    <p>
      @switch (status()) {
        @case ('loading') { <span class="muted">⏳ 載入中…</span> }
        @case ('error') { <span class="down">✗ 發生錯誤</span> }
        @case ('done') { <span class="up">✓ 完成</span> }
        @default { <span>待命</span> }
      }
    </p>

    <!-- @let：模板區域變數 -->
    @let total = items().length;
    @let evens = items().filter(isEven).length;
    <p class="muted">&#64;let total = {{ total }}，偶數 id = {{ evens }}</p>

    <!-- @for：track 必填；內建 $index $first $last $even $odd $count -->
    <ul class="list">
      @for (item of items(); track item.id; let i = $index, first = $first, last = $last, even = $even) {
        <li [class.even]="even">
          #{{ i }} id={{ item.id }} {{ item.name }}
          @if (first) { <span class="tag">first</span> }
          @if (last) { <span class="tag">last</span> }
          <input placeholder="打字後按打亂，輸入值會跟著元素走" />
        </li>
      } @empty {
        <li class="muted">&#64;empty：沒有資料</li>
      }
    </ul>

    <!-- @if / @else if / @else + as 別名 -->
    @if (items().at(0); as firstItem) {
      <p>第一筆：{{ firstItem.name }}</p>
    } @else {
      <p class="muted">沒有第一筆</p>
    }

    <!-- @defer：延遲載入（獨立 chunk） -->
    <h4>&#64;defer (on interaction) — 點擊下方區塊才下載並渲染 HeavyChart 元件</h4>
    @defer (on interaction; prefetch on hover) {
      <app-heavy-chart />
    } @placeholder (minimum 300ms) {
      <div class="ph">👆 點我載入圖表（滑過時就會 prefetch）</div>
    } @loading (after 100ms; minimum 500ms) {
      <div class="ph">載入中…</div>
    } @error {
      <div class="ph down">載入失敗</div>
    }
  `,
  styles: `
    .list { padding-left: 18px; }
    li { padding: 2px 0; }
    li.even { color: var(--primary); }
    li input { margin-left: 8px; width: 220px; font-size: 12px; }
    .tag { font-size: 11px; background: var(--surface-2); border: 1px solid var(--border); border-radius: 4px; padding: 0 4px; margin-left: 4px; }
    .ph { padding: 20px; border: 1px dashed var(--border); border-radius: 6px; text-align: center; cursor: pointer; }
  `,
})
export class ControlFlowDemo {
  protected readonly statuses: Status[] = ['idle', 'loading', 'error', 'done'];
  protected readonly status = signal<Status>('idle');
  private nextId = 4;
  protected readonly items = signal([
    { id: 1, name: 'BTC' },
    { id: 2, name: 'ETH' },
    { id: 3, name: 'SOL' },
  ]);

  protected isEven = (x: { id: number }) => x.id % 2 === 0;

  protected add() {
    const id = this.nextId++;
    this.items.update((l) => [...l, { id, name: `COIN-${id}` }]);
  }

  protected shuffle() {
    this.items.update((l) => [...l].sort(() => Math.random() - 0.5));
  }
}

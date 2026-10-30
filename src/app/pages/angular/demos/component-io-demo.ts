import { Component, computed, input, model, output, signal, viewChild } from '@angular/core';

/** 子元件：input() / model() / output() —— 取代 @Input / @Output 裝飾器 */
@Component({
  selector: 'app-order-ticket',
  template: `
    <div class="ticket" [class.buy]="side() === 'buy'">
      <strong>{{ symbol() }}</strong>
      <div class="row">
        <button class="btn" type="button" (click)="side.set('buy')">Buy</button>
        <button class="btn" type="button" (click)="side.set('sell')">Sell</button>
        <span class="muted">side（model 雙向綁定）= {{ side() }}</span>
      </div>
      <label>數量 <input type="number" [value]="qty()" (input)="qty.set(+$any($event.target).value)" /></label>
      <button class="btn primary" type="button" [disabled]="qty() <= 0" (click)="submit()">送出（output）</button>
    </div>
  `,
  styles: `
    .ticket { display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 2px solid var(--down); border-radius: 8px; }
    .ticket.buy { border-color: var(--up); }
  `,
})
export class OrderTicket {
  readonly symbol = input.required<string>(); // 必填 input
  readonly maxQty = input(100, { transform: (v: number | string) => Number(v) }); // 帶 transform
  readonly side = model<'buy' | 'sell'>('buy'); // 雙向綁定：父層 [(side)]
  readonly placed = output<{ symbol: string; side: string; qty: number }>(); // 事件

  protected readonly qty = signal(1);

  submit() {
    this.placed.emit({ symbol: this.symbol(), side: this.side(), qty: Math.min(this.qty(), this.maxQty()) });
  }

  /** 公開方法：讓父層透過 viewChild 呼叫 */
  reset() {
    this.qty.set(1);
    this.side.set('buy');
  }
}

@Component({
  selector: 'app-component-io-demo',
  imports: [OrderTicket],
  template: `
    <div class="grid">
      <app-order-ticket symbol="BTC/USDT" maxQty="5" [(side)]="side" (placed)="onPlaced($event)" />
      <div>
        <p>父層的 side signal：<b [class.up]="side() === 'buy'" [class.down]="side() === 'sell'">{{ side() }}</b></p>
        <button class="btn" type="button" (click)="side.set(side() === 'buy' ? 'sell' : 'buy')">由父層切換 side</button>
        <button class="btn" type="button" (click)="ticket().reset()">viewChild 呼叫子元件 reset()</button>
        <p class="muted">已送出 {{ count() }} 筆（maxQty="5" 透過 transform 轉成 number 並限制上限）</p>
        <div class="log">
          @for (o of orders(); track $index) {
            <div>{{ o }}</div>
          } @empty {
            尚無委託
          }
        </div>
      </div>
    </div>
  `,
  styles: `.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }`,
})
export class ComponentIoDemo {
  protected readonly side = signal<'buy' | 'sell'>('buy');
  protected readonly orders = signal<string[]>([]);
  protected readonly count = computed(() => this.orders().length);
  protected readonly ticket = viewChild.required(OrderTicket);

  protected onPlaced(o: { symbol: string; side: string; qty: number }) {
    this.orders.update((list) => [`${o.side.toUpperCase()} ${o.qty} ${o.symbol}`, ...list]);
  }
}

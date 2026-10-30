import { Component, computed, effect, linkedSignal, signal, untracked } from '@angular/core';

interface Product {
  symbol: string;
  price: number;
  minQty: number;
}

const PRODUCTS: Product[] = [
  { symbol: 'BTC', price: 67890, minQty: 0.001 },
  { symbol: 'ETH', price: 3456, minQty: 0.01 },
  { symbol: 'SOL', price: 178, minQty: 1 },
];

@Component({
  selector: 'app-signals-demo',
  template: `
    <div class="row">
      @for (p of products; track p.symbol) {
        <button class="btn" type="button" [class.primary]="selected().symbol === p.symbol" (click)="selected.set(p)">
          {{ p.symbol }}
        </button>
      }
    </div>

    <div class="row line">
      <label>
        數量（linkedSignal：換商品時自動重設為最小下單量，但仍可手動修改）
        <input type="number" [value]="qty()" [step]="selected().minQty" (input)="qty.set(+$any($event.target).value)" />
      </label>
      <label><input type="checkbox" [checked]="withFee()" (change)="withFee.set(!withFee())" /> 含手續費 0.1%</label>
    </div>

    <table class="simple">
      <tr><th>signal</th><td>selected = {{ selected().symbol }} &#64; {{ selected().price }}</td></tr>
      <tr><th>linkedSignal</th><td>qty = {{ qty() }}</td></tr>
      <tr><th>computed</th><td>notional = {{ notional().toFixed(2) }}</td></tr>
      <tr><th>computed</th><td>total = {{ total().toFixed(2) }}</td></tr>
    </table>
    <div class="log">
      effect log（最新在上）：
      @for (l of logs(); track $index) {
        <div>{{ l }}</div>
      }
    </div>
  `,
  styles: `
    .line { margin: 10px 0; }
    label { font-size: 13px; }
  `,
})
export class SignalsDemo {
  protected readonly products = PRODUCTS;

  // 1. signal：可寫入的狀態
  protected readonly selected = signal(PRODUCTS[0]);
  protected readonly withFee = signal(false);

  // 2. linkedSignal：「依賴其他 signal 的可寫狀態」—來源改變時重算，平常可手動 set
  protected readonly qty = linkedSignal(() => this.selected().minQty);

  // 3. computed：衍生值，lazy + memoized，只有依賴改變才重算
  protected readonly notional = computed(() => this.selected().price * this.qty());
  protected readonly total = computed(() => this.notional() * (this.withFee() ? 1.001 : 1));

  protected readonly logs = signal<string[]>([]);

  constructor() {
    // 4. effect：副作用（log、localStorage、呼叫非 Angular API），不要拿來同步 state
    effect(() => {
      const msg = `${new Date().toLocaleTimeString()}  ${this.selected().symbol} × ${this.qty()} = ${this.total().toFixed(2)}`;
      // untracked：讀取 logs 但不把它當依賴，避免無限迴圈
      untracked(() => this.logs.update((l) => [msg, ...l].slice(0, 8)));
    });
  }
}

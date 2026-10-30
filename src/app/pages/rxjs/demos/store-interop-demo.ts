import { Component, computed, inject, Injectable, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject, debounceTime, map, scan, startWith, Subject } from 'rxjs';

type Action = { type: 'add'; symbol: string; qty: number } | { type: 'remove'; symbol: string } | { type: 'clear' };

/** 1) RxJS 版 store：Subject<Action> + scan(reducer) —— Redux 的最小實作 */
@Injectable()
export class WatchlistStore {
  private readonly actions$ = new Subject<Action>();
  readonly state$ = this.actions$.pipe(
    scan((state: Record<string, number>, a: Action) => {
      switch (a.type) {
        case 'add':
          return { ...state, [a.symbol]: (state[a.symbol] ?? 0) + a.qty };
        case 'remove': {
          const { [a.symbol]: _, ...rest } = state;
          return rest;
        }
        case 'clear':
          return {};
      }
    }, {}),
    startWith({} as Record<string, number>),
  );
  dispatch(a: Action) {
    this.actions$.next(a);
  }
}

/** 2) BehaviorSubject 版 service（Angular 傳統寫法） */
@Injectable()
export class BalanceService {
  private readonly balance = new BehaviorSubject(1000);
  readonly balance$ = this.balance.asObservable(); // 對外只暴露 Observable，避免外部 next()
  deposit(n: number) {
    this.balance.next(this.balance.value + n);
  }
}

@Component({
  selector: 'app-store-interop-demo',
  providers: [WatchlistStore, BalanceService],
  template: `
    <div class="grid">
      <section>
        <h4>Subject + scan（reducer）</h4>
        <div class="row">
          @for (s of ['BTC', 'ETH', 'SOL']; track s) {
            <button class="btn" type="button" (click)="store.dispatch({ type: 'add', symbol: s, qty: 1 })">+{{ s }}</button>
          }
          <button class="btn" type="button" (click)="store.dispatch({ type: 'remove', symbol: 'BTC' })">移除 BTC</button>
          <button class="btn" type="button" (click)="store.dispatch({ type: 'clear' })">清空</button>
        </div>
        <p>toSignal(state$) → {{ entries() }}</p>
        <p class="muted">computed 總數：{{ total() }}</p>
      </section>
      <section>
        <h4>BehaviorSubject service</h4>
        <button class="btn" type="button" (click)="balance.deposit(100)">存入 100</button>
        <p>餘額：{{ bal() }}</p>
      </section>
      <section>
        <h4>toObservable(signal) → debounceTime</h4>
        <input type="range" min="0" max="100" [value]="slider()" (input)="slider.set(+$any($event.target).value)" />
        <p>signal 即時值：{{ slider() }} · 防抖 500ms 後：{{ debouncedSlider() }}</p>
      </section>
    </div>
  `,
  styles: `.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; } h4 { margin: 0 0 8px; }`,
})
export class StoreInteropDemo {
  protected readonly store = inject(WatchlistStore);
  protected readonly balance = inject(BalanceService);

  // Observable → Signal（自動在 destroy 時退訂）
  private readonly state = toSignal(this.store.state$, { requireSync: true });
  protected readonly entries = computed(() => JSON.stringify(this.state()));
  protected readonly total = computed(() => Object.values(this.state()).reduce((a, b) => a + b, 0));
  protected readonly bal = toSignal(this.balance.balance$, { initialValue: 0 });

  // Signal → Observable → 用 RxJS 運算子 → 再回 Signal
  protected readonly slider = signal(50);
  protected readonly debouncedSlider = toSignal(toObservable(this.slider).pipe(debounceTime(500), map((v) => `${v}`)), {
    initialValue: '50',
  });
}

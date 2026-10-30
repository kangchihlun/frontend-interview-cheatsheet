import { Component, inject, Injectable, InjectionToken, Service, signal } from '@angular/core';

/** InjectionToken：注入「非 class」的值（設定、函式） */
export const FEE_RATE = new InjectionToken<number>('FEE_RATE', { factory: () => 0.001 });

/** Angular 22 新增的 @Service()：預設自動 provide 在 root（等同 @Injectable({ providedIn: 'root' })） */
@Service()
export class AppClock {
  readonly startedAt = new Date().toLocaleTimeString();
}

/** 傳統寫法：@Injectable 不指定 providedIn → 必須在 providers 陣列提供 */
@Injectable()
export class CartStore {
  private static seq = 0;
  readonly instanceId = ++CartStore.seq;
  readonly count = signal(0);
  add() {
    this.count.update((c) => c + 1);
  }
}

@Component({
  selector: 'app-cart-widget',
  template: `
    <div class="w">
      CartStore 實例 #{{ store.instanceId }} · count = {{ store.count() }}
      <button class="btn" type="button" (click)="store.add()">+1</button>
      <small class="muted">fee = {{ fee }}</small>
    </div>
  `,
  styles: `.w { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding: 6px 10px; border: 1px solid var(--border); border-radius: 6px; margin: 4px 0; }`,
})
export class CartWidget {
  protected readonly store = inject(CartStore); // 往上找最近的 injector
  protected readonly fee = inject(FEE_RATE);
}

@Component({ selector: 'app-cart-a', imports: [CartWidget], template: `<app-cart-widget />` })
export class CartA {}

/** 這個元件自己 providers: [CartStore] → 它與子孫拿到獨立的新實例 */
@Component({
  selector: 'app-cart-b',
  imports: [CartWidget],
  providers: [CartStore, { provide: FEE_RATE, useValue: 0.0005 }],
  template: `<app-cart-widget /><app-cart-widget />`,
})
export class CartB {}

@Component({
  selector: 'app-di-demo',
  imports: [CartA, CartB],
  providers: [CartStore], // demo 層級提供一個
  template: `
    <p class="muted">AppClock（&#64;Service 自動 root 單例）啟動時間：{{ clock.startedAt }}</p>
    <p>兩個 &lt;app-cart-a&gt; 共用 demo 層級的 CartStore：</p>
    <app-cart-a />
    <app-cart-a />
    <p>&lt;app-cart-b&gt; 自己 providers 了 CartStore（以及覆寫 FEE_RATE），內部兩個 widget 共用「B 的」實例：</p>
    <app-cart-b />
  `,
})
export class DiDemo {
  protected readonly clock = inject(AppClock);
}

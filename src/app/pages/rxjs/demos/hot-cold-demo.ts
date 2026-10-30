import { Component, OnDestroy, signal } from '@angular/core';
import { interval, Observable, share, shareReplay, Subscription, take } from 'rxjs';

type Mode = 'cold' | 'share' | 'shareReplay';

@Component({
  selector: 'app-hot-cold-demo',
  template: `
    <div class="row">
      @for (m of modes; track m) {
        <button class="btn" type="button" [class.primary]="mode() === m" (click)="switch(m)">{{ m }}</button>
      }
      <button class="btn" type="button" (click)="addSubscriber()">新增訂閱者</button>
    </div>
    <p class="muted">{{ hints[mode()] }}</p>
    <p>「後端」被執行次數（模擬 HTTP / WebSocket 連線數）：<b class="warn">{{ executions() }}</b></p>
    <div class="subs">
      @for (s of subscribers(); track s.id) {
        <div class="sub">訂閱者 #{{ s.id }}：{{ s.values.join(', ') }}</div>
      }
    </div>
  `,
  styles: `
    .warn { color: var(--warn); font-size: 18px; }
    .subs { display: grid; gap: 4px; font-family: var(--font-mono); font-size: 12px; }
    .sub { padding: 4px 8px; background: var(--surface-2); border-radius: 4px; }
  `,
})
export class HotColdDemo implements OnDestroy {
  protected readonly modes: Mode[] = ['cold', 'share', 'shareReplay'];
  protected readonly hints: Record<Mode, string> = {
    cold: 'Cold：每個訂閱者各自觸發一次來源（每人各自從 0 開始、各自打一次 API）',
    share: 'Hot（share）：多個訂閱者共用同一個執行；晚到的只收到之後的值',
    shareReplay: 'shareReplay({ bufferSize: 1, refCount: true })：共用 + 晚到者先收到最後一個值（快取設定檔、使用者資訊）',
  };
  protected readonly mode = signal<Mode>('cold');
  protected readonly executions = signal(0);
  protected readonly subscribers = signal<{ id: number; values: number[] }[]>([]);
  private source$!: Observable<number>;
  private subs = new Subscription();

  constructor() {
    this.build();
  }

  private build() {
    const base$ = new Observable<number>((sub) => {
      this.executions.update((n) => n + 1); // 每次「真正執行」來源就 +1
      return interval(800).pipe(take(10)).subscribe(sub);
    });
    const m = this.mode();
    this.source$ = m === 'cold' ? base$ : m === 'share' ? base$.pipe(share()) : base$.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  protected switch(m: Mode) {
    this.subs.unsubscribe();
    this.subs = new Subscription();
    this.mode.set(m);
    this.executions.set(0);
    this.subscribers.set([]);
    this.build();
  }

  protected addSubscriber() {
    const id = this.subscribers().length + 1;
    this.subscribers.update((s) => [...s, { id, values: [] }]);
    this.subs.add(
      this.source$.subscribe((v) =>
        this.subscribers.update((list) => list.map((s) => (s.id === id ? { ...s, values: [...s.values, v] } : s))),
      ),
    );
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}

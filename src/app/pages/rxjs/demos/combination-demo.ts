import { Component, DestroyRef, inject, signal } from '@angular/core';
import { combineLatest, forkJoin, map, merge, Observable, Subject, withLatestFrom, zip } from 'rxjs';

type Name = 'combineLatest' | 'withLatestFrom' | 'zip' | 'merge' | 'forkJoin';

@Component({
  selector: 'app-combination-demo',
  template: `
    <div class="row">
      <button class="btn" type="button" (click)="emitA()">A.next(a{{ a() + 1 }})</button>
      <button class="btn" type="button" (click)="emitB()">B.next(b{{ b() + 1 }})</button>
      <button class="btn" type="button" (click)="completeAll()">A、B complete()</button>
      <button class="btn" type="button" (click)="reset()">重置</button>
    </div>
    <div class="grid">
      @for (n of names; track n) {
        <section>
          <h4><code>{{ n }}</code></h4>
          <p class="muted">{{ hints[n] }}</p>
          <div class="out">
            @for (v of out()[n]; track $index) {
              <span>{{ v }}</span>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px; }
    section { border: 1px solid var(--border); border-radius: 6px; padding: 8px; }
    h4 { margin: 0; } p { font-size: 12px; margin: 2px 0 6px; min-height: 52px; }
    .out { display: flex; flex-wrap: wrap; gap: 4px; }
    .out span { font-family: var(--font-mono); font-size: 12px; background: var(--surface-2); padding: 1px 6px; border-radius: 4px; }
  `,
})
export class CombinationDemo {
  protected readonly names: Name[] = ['combineLatest', 'withLatestFrom', 'zip', 'merge', 'forkJoin'];
  protected readonly hints: Record<Name, string> = {
    combineLatest: '每個來源都至少發過一次後，任一來源發值就輸出「各自最新值」→ 多個篩選條件',
    withLatestFrom: '只有 A（主串流）發值時才輸出，順便帶 B 的最新值 → 送出時帶上目前設定',
    zip: '一對一配對（第 n 個配第 n 個）',
    merge: '交錯輸出，誰先來誰先出',
    forkJoin: '全部 complete 後只輸出一次「各自最後值」→ 平行請求多個 API（像 Promise.all）',
  };
  protected readonly a = signal(0);
  protected readonly b = signal(0);
  protected readonly out = signal<Record<Name, string[]>>(this.empty());
  private a$ = new Subject<string>();
  private b$ = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);
  private teardown: () => void = () => {};

  constructor() {
    this.wire();
    this.destroyRef.onDestroy(() => this.teardown());
  }

  private wire() {
    const streams: Record<Name, Observable<string>> = {
      combineLatest: combineLatest([this.a$, this.b$]).pipe(map(([a, b]) => `[${a},${b}]`)),
      withLatestFrom: this.a$.pipe(
        withLatestFrom(this.b$),
        map(([a, b]) => `[${a},${b}]`),
      ),
      zip: zip(this.a$, this.b$).pipe(map(([a, b]) => `[${a},${b}]`)),
      merge: merge(this.a$, this.b$),
      forkJoin: forkJoin([this.a$, this.b$]).pipe(map(([a, b]) => `[${a},${b}] ✓`)),
    };
    const subs = this.names.map((n) =>
      streams[n].subscribe({
        next: (v) => this.push(n, v),
        complete: () => this.push(n, '|'),
      }),
    );
    this.teardown = () => subs.forEach((s) => s.unsubscribe());
  }

  protected emitA() {
    this.a.update((v) => v + 1);
    this.a$.next(`a${this.a()}`);
  }

  protected emitB() {
    this.b.update((v) => v + 1);
    this.b$.next(`b${this.b()}`);
  }

  protected completeAll() {
    this.a$.complete();
    this.b$.complete();
  }

  protected reset() {
    this.teardown();
    this.a$ = new Subject<string>();
    this.b$ = new Subject<string>();
    this.a.set(0);
    this.b.set(0);
    this.out.set(this.empty());
    this.wire();
  }

  private push(n: Name, v: string) {
    this.out.update((o) => ({ ...o, [n]: [...o[n], v] }));
  }

  private empty(): Record<Name, string[]> {
    return { combineLatest: [], withLatestFrom: [], zip: [], merge: [], forkJoin: [] };
  }
}


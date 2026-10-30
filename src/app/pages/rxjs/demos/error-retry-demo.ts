import { Component, signal } from '@angular/core';
import { catchError, defer, finalize, Observable, of, retry, tap, throwError, timer } from 'rxjs';

@Component({
  selector: 'app-error-retry-demo',
  template: `
    <div class="row">
      <label>失敗率 <input type="range" min="0" max="100" [value]="failRate()" (input)="failRate.set(+$any($event.target).value)" /> {{ failRate() }}%</label>
      <button class="btn primary" type="button" [disabled]="running()" (click)="run()">呼叫 API（最多重試 3 次，指數退避）</button>
    </div>
    <div class="log">
      @for (l of logs(); track $index) {
        <div>{{ l }}</div>
      }
    </div>
  `,
})
export class ErrorRetryDemo {
  protected readonly failRate = signal(70);
  protected readonly running = signal(false);
  protected readonly logs = signal<string[]>([]);
  private t0 = 0;

  /** defer：每次 (重新) 訂閱都重新執行工廠函式 → retry 才會真的「再打一次 API」 */
  private flakyApi(): Observable<string> {
    return defer(() => {
      this.log('→ 發送請求');
      return Math.random() * 100 < this.failRate() ? throwError(() => new Error('503 Service Unavailable')) : of('{ "balance": 1000 }');
    });
  }

  protected run() {
    this.logs.set([]);
    this.t0 = performance.now();
    this.running.set(true);
    this.flakyApi()
      .pipe(
        tap({ error: (e: Error) => this.log(`✗ ${e.message}`) }),
        retry({
          count: 3,
          // 指數退避：300ms、600ms、1200ms
          delay: (err, retryCount) => {
            const ms = 300 * 2 ** (retryCount - 1);
            this.log(`  第 ${retryCount} 次重試，等待 ${ms}ms`);
            return timer(ms);
          },
        }),
        catchError((e: Error) => {
          this.log(`⚠ 重試用盡，回傳 fallback（${e.message}）`);
          return of('{ "balance": null, "cached": true }');
        }),
        finalize(() => {
          this.log('finalize：無論成功失敗都執行（關 loading）');
          this.running.set(false);
        }),
      )
      .subscribe((v) => this.log(`✓ 結果 ${v}`));
  }

  private log(msg: string) {
    const ms = Math.round(performance.now() - this.t0);
    this.logs.update((l) => [...l, `+${String(ms).padStart(4)}ms  ${msg}`]);
  }
}

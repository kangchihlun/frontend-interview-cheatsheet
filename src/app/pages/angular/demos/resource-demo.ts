import { Component, debounced, resource, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { delay, of, throwError } from 'rxjs';

const SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT'];

/** 模擬 API：可被 AbortSignal 取消；輸入 "err" 會失敗 */
function searchApi(q: string, abortSignal: AbortSignal): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      if (q.includes('err')) reject(new Error('伺服器錯誤 500'));
      else resolve(SYMBOLS.filter((s) => s.includes(q.toUpperCase())));
    }, 600);
    abortSignal.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new DOMException('aborted', 'AbortError'));
    });
  });
}

@Component({
  selector: 'app-resource-demo',
  template: `
    <div class="grid">
      <section>
        <h4>resource() + debounced()（Promise 版）</h4>
        <input placeholder="輸入 btc / eth，輸入 err 模擬錯誤" [value]="query()" (input)="query.set($any($event.target).value)" />
        <p class="muted">status = <code>{{ results.status() }}</code> · isLoading = {{ results.isLoading() }}</p>
        @if (results.error(); as err) {
          <p class="down">{{ err.message }} <button class="btn" type="button" (click)="results.reload()">重試 reload()</button></p>
        } @else if (results.hasValue()) {
          <ul>
            @for (s of results.value(); track s) {
              <li>{{ s }}</li>
            } @empty {
              <li class="muted">查無結果</li>
            }
          </ul>
        }
      </section>

      <section>
        <h4>rxResource()（Observable 版）</h4>
        <div class="row">
          @for (id of [1, 2, 3, 99]; track id) {
            <button class="btn" type="button" [class.primary]="userId() === id" (click)="userId.set(id)">user {{ id }}</button>
          }
        </div>
        <p class="muted">status = <code>{{ user.status() }}</code>（99 會失敗）</p>
        @if (user.isLoading()) {
          <p>載入中…</p>
        } @else if (user.error()) {
          <p class="down">找不到使用者</p>
        } @else {
          <p>{{ user.value()?.name }}（VIP {{ user.value()?.vip }}）</p>
        }
        <button class="btn" type="button" (click)="user.set({ name: '本地覆寫', vip: 0 })">set() 本地值（status → local）</button>
      </section>
    </div>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    h4 { margin: 0 0 8px; }
    input { width: 100%; }
  `,
})
export class ResourceDemo {
  protected readonly query = signal('');

  // debounced()：Angular 22 新增（experimental），回傳一個 Resource，value() 為防抖後的值
  private readonly debouncedQuery = debounced(this.query, 400);

  // params 改變 → 自動取消上一次（abortSignal）並重新載入，類似 switchMap
  protected readonly results = resource({
    params: () => this.debouncedQuery.value() ?? '',
    loader: ({ params, abortSignal }) => searchApi(params, abortSignal),
    defaultValue: [],
  });

  protected readonly userId = signal(1);
  protected readonly user = rxResource({
    params: () => ({ id: this.userId() }),
    stream: ({ params }) =>
      params.id === 99
        ? throwError(() => new Error('404')).pipe(delay(400))
        : of({ name: `User #${params.id}`, vip: params.id * 2 }).pipe(delay(400)),
  });
}

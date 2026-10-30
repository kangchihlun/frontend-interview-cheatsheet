import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { HttpLog } from './http-log';
import { Order } from './interceptors';
import { OrdersApi, Page } from './orders-api';

@Component({
  selector: 'app-http-demo',
  template: `
    <div class="grid">
      <section>
        <h4>httpResource：參數是 signal，改變就自動重新請求</h4>
        <div class="row">
          <select [value]="status()" (change)="status.set($any($event.target).value); page.set(1)">
            <option value="">全部狀態</option>
            <option value="open">open</option>
            <option value="filled">filled</option>
            <option value="cancelled">cancelled</option>
          </select>
          <button class="btn" type="button" [disabled]="page() <= 1" (click)="page.set(page() - 1)">‹</button>
          <span>第 {{ page() }} / {{ totalPages() }} 頁</span>
          <button class="btn" type="button" [disabled]="page() >= totalPages()" (click)="page.set(page() + 1)">›</button>
          @if (orders.isLoading()) {
            <span class="muted">載入中…</span>
          }
        </div>
        <table class="simple tbl">
          <tr><th>#</th><th>商品</th><th>方向</th><th>價格</th><th>數量</th><th>狀態</th><th></th></tr>
          @for (o of orders.value()?.items ?? []; track o.id) {
            <tr>
              <td>{{ o.id }}</td>
              <td>{{ o.symbol }}</td>
              <td [class.up]="o.side === 'buy'" [class.down]="o.side === 'sell'">{{ o.side }}</td>
              <td>{{ o.price }}</td>
              <td>{{ o.qty }}</td>
              <td>{{ o.status }}</td>
              <td class="actions">
                @if (o.status === 'open') {
                  <button class="btn" type="button" (click)="cancel(o)">取消(PATCH)</button>
                }
                <button class="btn" type="button" (click)="remove(o)">刪除</button>
              </td>
            </tr>
          }
        </table>
      </section>

      <section>
        <h4>其他情境</h4>
        <div class="col">
          <button class="btn" type="button" (click)="create(0.5)">POST 新增委託 → 201</button>
          <button class="btn" type="button" (click)="create(0)">POST qty=0 → 422 驗證錯誤</button>
          <button class="btn" type="button" (click)="get(999)">GET 不存在 → 404</button>
          <button class="btn" type="button" (click)="flaky()">GET /api/flaky（60% 失敗，攔截器自動重試 2 次）</button>
          <label>
            <input type="checkbox" [checked]="!!log.token()" (change)="log.token.set(log.token() ? null : 'demo-jwt-token')" />
            已登入（authInterceptor 會加上 Authorization）
          </label>
          <button class="btn" type="button" (click)="secure()">GET /api/secure（需登入，否則 401）</button>
        </div>
        @if (message(); as m) {
          <p [class.down]="m.error" [class.up]="!m.error">{{ m.text }}</p>
        }
      </section>
    </div>

    <h4>請求紀錄（loggingInterceptor） <button class="btn" type="button" (click)="log.clear()">清除</button></h4>
    <table class="simple tbl">
      <tr><th>方法</th><th>URL</th><th>狀態</th><th>耗時</th><th>Auth</th><th>備註</th></tr>
      @for (e of log.entries(); track e.id) {
        <tr>
          <td><code>{{ e.method }}</code></td>
          <td>{{ e.url }}</td>
          <td [class.up]="+e.status < 400" [class.down]="+e.status >= 400">{{ e.status }}</td>
          <td>{{ e.ms }}ms</td>
          <td>{{ e.auth ? '✓' : '' }}</td>
          <td class="muted">{{ e.note }}</td>
        </tr>
      }
    </table>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(240px, 1fr); gap: 20px; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    .col { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; font-size: 13px; }
    .tbl { margin-top: 8px; font-size: 13px; }
    .actions { white-space: nowrap; }
    .actions .btn { font-size: 12px; padding: 1px 6px; }
    h4 { margin: 0 0 8px; }
  `,
})
export class HttpDemo {
  protected readonly log = inject(HttpLog);
  private readonly api = inject(OrdersApi);
  private readonly http = inject(HttpClient);

  protected readonly status = signal('');
  protected readonly page = signal(1);
  protected readonly message = signal<{ text: string; error: boolean } | null>(null);

  // httpResource（Angular 22 正式 API）：回傳 Resource，value / isLoading / error / reload 都是 signal
  protected readonly orders = httpResource<Page<Order>>(() => ({
    url: '/api/orders',
    params: { page: this.page(), size: 5, ...(this.status() ? { status: this.status() } : {}) },
  }));

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil((this.orders.value()?.total ?? 0) / 5)));

  protected create(qty: number) {
    this.api.create({ symbol: 'BTCUSDT', side: 'buy', price: 67890, qty }).subscribe({
      next: (o) => {
        this.ok(`建立成功 #${o.id}`);
        this.orders.reload();
      },
      error: (e: HttpErrorResponse) => this.err(e),
    });
  }

  protected cancel(o: Order) {
    this.api.update(o.id, { status: 'cancelled' }).subscribe({ next: () => this.orders.reload(), error: (e) => this.err(e) });
  }

  protected remove(o: Order) {
    this.api.remove(o.id).subscribe({ next: () => this.orders.reload(), error: (e) => this.err(e) });
  }

  protected get(id: number) {
    this.api.get(id).subscribe({ next: (o) => this.ok(JSON.stringify(o)), error: (e) => this.err(e) });
  }

  protected flaky() {
    this.http.get('/api/flaky').subscribe({ next: () => this.ok('成功（看紀錄：可能是重試後才成功）'), error: (e) => this.err(e) });
  }

  protected secure() {
    this.http.get<{ secret: string }>('/api/secure').subscribe({ next: (r) => this.ok(r.secret), error: (e) => this.err(e) });
  }

  private ok(text: string) {
    this.message.set({ text, error: false });
  }

  private err(e: HttpErrorResponse) {
    this.message.set({ text: `${e.status} ${e.error?.message ?? e.statusText}`, error: true });
  }
}

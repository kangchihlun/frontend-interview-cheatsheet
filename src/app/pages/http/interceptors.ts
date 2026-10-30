import { HttpErrorResponse, HttpEventType, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { defer, delay, dematerialize, materialize, Observable, of, retry, tap, throwError, timer } from 'rxjs';
import { HttpLog } from './http-log';

/** 1. 帶上 token（只處理自家 API，不要把 token 送去第三方網域） */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(HttpLog).token();
  if (!token || !req.url.startsWith('/api/')) return next(req);
  // HttpRequest 是 immutable，要用 clone 修改
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};

/** 2. 記錄每個請求的方法、狀態碼、耗時 */
export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const log = inject(HttpLog);
  const started = performance.now();
  const base = { method: req.method, url: req.urlWithParams, auth: req.headers.has('Authorization') };
  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === HttpEventType.Response) log.add({ ...base, status: event.status, ms: Math.round(performance.now() - started) });
      },
      error: (err: HttpErrorResponse) => log.add({ ...base, status: err.status, ms: Math.round(performance.now() - started), note: err.error?.message }),
    }),
  );
};

/** 3. GET 遇到 5xx / 網路錯誤自動重試（POST 不重試：非冪等，避免重複下單） */
export const retryInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.method !== 'GET') return next(req);
  return next(req).pipe(
    retry({
      count: 2,
      delay: (err: HttpErrorResponse, i) => (err.status >= 500 || err.status === 0 ? timer(200 * 2 ** (i - 1)) : throwError(() => err)),
    }),
  );
};

// ─────────────────────────────────────────────────────────────
// 4. 模擬後端（只在 demo 中使用）：攔截 /api/* 直接回應，不會真的發出網路請求
// ─────────────────────────────────────────────────────────────
export interface Order {
  id: number;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  qty: number;
  status: 'open' | 'filled' | 'cancelled';
}

const db: Order[] = Array.from({ length: 23 }, (_, i) => ({
  id: i + 1,
  symbol: ['BTCUSDT', 'ETHUSDT', 'SOLUSDT'][i % 3],
  side: i % 2 ? 'sell' : 'buy',
  price: [67000, 3400, 170][i % 3] + i * 3,
  qty: +((i % 5) + 0.5).toFixed(2),
  status: (['open', 'filled', 'cancelled'] as const)[i % 4 === 0 ? 2 : i % 3 === 0 ? 1 : 0],
}));
let nextId = db.length + 1;

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith('/api/')) return next(req);

  const ok = <T>(body: T, status = 200) => of(new HttpResponse({ status, body, url: req.url }));
  const fail = (status: number, message: string) =>
    throwError(() => new HttpErrorResponse({ status, statusText: message, url: req.url, error: { message } }));

  const route = (): Observable<HttpResponse<unknown>> => {
    const [, , resource, idStr] = req.url.split('/'); // '/api/orders/3' → ['', 'api', 'orders', '3']
    const id = Number(idStr);

    if (resource === 'flaky') return Math.random() < 0.6 ? fail(503, 'Service Unavailable') : ok({ ok: true });
    if (resource === 'secure') return req.headers.has('Authorization') ? ok({ secret: '餘額 1,000 USDT' }) : fail(401, 'Unauthorized');
    if (resource !== 'orders') return fail(404, 'Not Found');

    switch (req.method) {
      case 'GET': {
        if (idStr) {
          const o = db.find((x) => x.id === id);
          return o ? ok(o) : fail(404, `Order ${id} not found`);
        }
        const status = req.params.get('status');
        const page = Number(req.params.get('page') ?? 1);
        const size = Number(req.params.get('size') ?? 5);
        const filtered = status ? db.filter((o) => o.status === status) : db;
        return ok({ items: filtered.slice((page - 1) * size, page * size), total: filtered.length, page, size });
      }
      case 'POST': {
        const body = req.body as Partial<Order>;
        if (!body.qty || body.qty <= 0) return fail(422, 'qty 必須大於 0');
        const created: Order = { id: nextId++, symbol: body.symbol ?? 'BTCUSDT', side: body.side ?? 'buy', price: body.price ?? 0, qty: body.qty, status: 'open' };
        db.unshift(created);
        return ok(created, 201);
      }
      case 'PATCH': {
        const o = db.find((x) => x.id === id);
        if (!o) return fail(404, `Order ${id} not found`);
        Object.assign(o, req.body);
        return ok(o);
      }
      case 'DELETE': {
        const i = db.findIndex((x) => x.id === id);
        if (i < 0) return fail(404, `Order ${id} not found`);
        db.splice(i, 1);
        return of(new HttpResponse({ status: 204, url: req.url }));
      }
      default:
        return fail(405, 'Method Not Allowed');
    }
  };

  // defer：每次（重試）訂閱都重新跑一次路由；materialize/dematerialize：讓錯誤也套用 delay 模擬網路延遲
  return defer(route).pipe(materialize(), delay(250 + Math.random() * 300), dematerialize());
};

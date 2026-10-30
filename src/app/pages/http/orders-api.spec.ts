import { HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { HttpLog } from './http-log';
import { authInterceptor } from './interceptors';
import { OrdersApi } from './orders-api';

describe('OrdersApi + authInterceptor', () => {
  let api: OrdersApi;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      // provideHttpClientTesting 必須放在 provideHttpClient 之後，它會攔下所有請求交給 HttpTestingController
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    api = TestBed.inject(OrdersApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify()); // 確認沒有未處理的請求

  it('list() 帶分頁與篩選 query string', () => {
    let total = 0;
    api.list({ page: 2, size: 5, status: 'open' }).subscribe((p) => (total = p.total));

    const req = http.expectOne((r) => r.url === '/api/orders');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('status')).toBe('open');
    req.flush({ items: [], total: 42, page: 2, size: 5 });

    expect(total).toBe(42);
  });

  it('create() 送出 POST body', () => {
    api.create({ symbol: 'BTCUSDT', side: 'buy', price: 1, qty: 2 }).subscribe();
    const req = http.expectOne('/api/orders');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ symbol: 'BTCUSDT', side: 'buy', price: 1, qty: 2 });
    req.flush({ id: 1 }, { status: 201, statusText: 'Created' });
  });

  it('錯誤回應會以 HttpErrorResponse 傳遞', () => {
    let error: HttpErrorResponse | undefined;
    api.get(999).subscribe({ error: (e) => (error = e) });
    http.expectOne('/api/orders/999').flush({ message: 'not found' }, { status: 404, statusText: 'Not Found' });
    expect(error?.status).toBe(404);
    expect(error?.error.message).toBe('not found');
  });

  it('有 token 時 authInterceptor 加上 Authorization header', () => {
    TestBed.inject(HttpLog).token.set('abc');
    api.get(1).subscribe();
    const req = http.expectOne('/api/orders/1');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush({});
  });

  it('沒有 token 時不加 header', () => {
    api.get(1).subscribe();
    const req = http.expectOne('/api/orders/1');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });
});

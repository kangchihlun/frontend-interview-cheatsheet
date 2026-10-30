import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from './interceptors';

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

/** RESTful 資源封裝：元件不直接碰 URL 與 HttpClient */
@Service()
export class OrdersApi {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/orders';

  list(query: { page: number; size: number; status?: string }): Observable<Page<Order>> {
    let params = new HttpParams().set('page', query.page).set('size', query.size);
    if (query.status) params = params.set('status', query.status);
    return this.http.get<Page<Order>>(this.base, { params }); // GET    /api/orders?page=1&size=5
  }

  get(id: number) {
    return this.http.get<Order>(`${this.base}/${id}`); //         GET    /api/orders/1
  }

  create(body: Omit<Order, 'id' | 'status'>) {
    return this.http.post<Order>(this.base, body); //             POST   /api/orders       → 201
  }

  update(id: number, patch: Partial<Order>) {
    return this.http.patch<Order>(`${this.base}/${id}`, patch); // PATCH  /api/orders/1     部分更新
  }

  remove(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`); //        DELETE /api/orders/1     → 204
  }
}

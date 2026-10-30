import { TestBed } from '@angular/core/testing';
import { firstValueFrom, take, tap, toArray } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { FakeExchange } from './fake-socket';
import { MarketDataService } from './market-data.service';

describe('MarketDataService（透過 FakeWebSocket）', () => {
  afterEach(() => (FakeExchange.chaos = false));

  it('ticker$ 收到行情時為 open；最後一個訂閱者離開後連線關閉回到 idle', async () => {
    const md = TestBed.inject(MarketDataService);
    let statusWhileStreaming = '';
    const ticks = await firstValueFrom(
      md.ticker$('BTCUSDT').pipe(
        take(3),
        tap(() => (statusWhileStreaming = md.status())),
        toArray(),
      ),
    );
    expect(ticks.map((t) => t.symbol)).toEqual(['BTCUSDT', 'BTCUSDT', 'BTCUSDT']);
    expect(ticks[0].price).toBeGreaterThan(0);
    expect(statusWhileStreaming).toBe('open');
    expect(md.status()).toBe('idle');
  });

  it('book$ 先收到快照，之後 seq 遞增', async () => {
    const md = TestBed.inject(MarketDataService);
    const books = await firstValueFrom(md.book$('ETHUSDT').pipe(take(3), toArray()));
    expect(books[0].bids.size).toBe(15);
    expect(books[2].seq).toBe(books[1].seq + 1);
  });
});

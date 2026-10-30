import { Component, computed, signal } from '@angular/core';

interface Level {
  price: number;
  size: number;
}

@Component({
  selector: 'app-trading-dashboard',
  templateUrl: './trading-dashboard.html',
  styleUrl: './trading-dashboard.scss',
})
export class TradingDashboard {
  protected readonly side = signal<'buy' | 'sell'>('buy');
  protected readonly tab = signal<'pos' | 'orders'>('pos');
  protected readonly tickers = [
    { s: 'BTC', p: 67890.5, c: 2.31 },
    { s: 'ETH', p: 3456.2, c: -1.12 },
    { s: 'SOL', p: 178.9, c: 5.4 },
    { s: 'BNB', p: 612.3, c: 0.42 },
    { s: 'XRP', p: 0.62, c: -0.8 },
  ];

  /** 假的走勢：隨機漫步轉成 SVG polyline 的 points */
  protected readonly chartPoints = (() => {
    let v = 50;
    return Array.from({ length: 60 }, (_, i) => {
      v = Math.max(5, Math.min(95, v + Math.sin(i / 3) * 4 + (i % 7) - 3));
      return `${(i / 59) * 100},${100 - v}`;
    }).join(' ');
  })();

  protected readonly asks: Level[] = makeLevels(67891, 1);
  protected readonly bids: Level[] = makeLevels(67889, -1);
  protected readonly maxSize = computed(() => Math.max(...[...this.asks, ...this.bids].map((l) => l.size)));
}

function makeLevels(start: number, dir: 1 | -1): Level[] {
  return Array.from({ length: 8 }, (_, i) => ({
    price: start + dir * i * 0.5,
    size: +(((i * 37) % 11) / 3 + 0.2).toFixed(3),
  }));
}

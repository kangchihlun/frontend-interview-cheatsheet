import { Component } from '@angular/core';

@Component({
  selector: 'app-sticky-scroll',
  templateUrl: './sticky-scroll.html',
  styleUrl: './sticky-scroll.scss',
})
export class StickyScroll {
  protected readonly cols = ['開盤', '最高', '最低', '收盤', '成交量', '漲跌', '漲跌%', '買價', '賣價'];
  protected readonly rows = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX', 'DOT', 'LINK', 'MATIC', 'LTC', 'TRX', 'ATOM', 'UNI'];
  protected readonly groups = ['A', 'B', 'C', 'D', 'E'].map((name) => ({
    name: `${name} 開頭`,
    items: Array.from({ length: 5 }, (_, i) => `${name}-商品 ${i + 1}`),
  }));
}

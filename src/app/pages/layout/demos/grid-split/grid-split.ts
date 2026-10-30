import { Component } from '@angular/core';

@Component({
  selector: 'app-grid-split',
  templateUrl: './grid-split.html',
  styleUrl: './grid-split.scss',
})
export class GridSplit {
  protected readonly cards = [1, 2, 3, 4, 5, 6, 7];
  protected readonly subCards = [
    { title: 'BTC/USDT', body: '短內容' },
    { title: 'ETH/USDT 永續合約（標題比較長會換行）', body: '內文長度不同，但按鈕依然在同一水平線上，因為三列都對齊父網格。' },
    { title: 'SOL/USDT', body: '中等長度的內文說明。' },
  ];
}

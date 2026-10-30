import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-nested-layout',
  templateUrl: './nested-layout.html',
  styleUrl: './nested-layout.scss',
})
export class NestedLayout {
  protected readonly fixed = signal(true);
  protected readonly outline = signal(true);
  protected readonly panels = ['K 線', '委託簿', '成交明細', '持倉'];
  protected readonly rows = Array.from({ length: 30 }, (_, i) => i + 1);
}

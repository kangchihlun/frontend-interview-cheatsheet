import { Component } from '@angular/core';

/** 被 @defer 延遲載入的元件：build 時會被切成獨立的 lazy chunk */
@Component({
  selector: 'app-heavy-chart',
  template: `
    <div class="chart">
      @for (h of bars; track $index) {
        <span [style.height.%]="h"></span>
      }
    </div>
    <p class="muted">HeavyChart 已載入（查看 Network 會看到一個新的 chunk）</p>
  `,
  styles: `
    .chart { display: flex; align-items: flex-end; gap: 3px; height: 120px; padding: 8px; background: var(--surface-2); border-radius: 6px; }
    span { flex: 1; background: var(--primary); border-radius: 2px 2px 0 0; }
  `,
})
export class HeavyChart {
  protected readonly bars = Array.from({ length: 40 }, (_, i) => 20 + Math.abs(Math.sin(i / 4)) * 80);
}

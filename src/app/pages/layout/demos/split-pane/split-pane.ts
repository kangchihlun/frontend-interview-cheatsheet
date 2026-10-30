import { Component, ElementRef, signal, viewChild } from '@angular/core';

type Axis = 'x' | 'y';

/**
 * 可拖拉分割視窗（類似 VS Code / 交易終端機）
 * - 尺寸存在 signal（百分比），模板用 [style.flex-basis.%] 綁定
 * - setPointerCapture：拖出 gutter 範圍也能持續收到 pointermove
 */
@Component({
  selector: 'app-split-pane',
  templateUrl: './split-pane.html',
  styleUrl: './split-pane.scss',
})
export class SplitPane {
  protected readonly left = signal(30);
  protected readonly top = signal(60);
  protected readonly dragging = signal<Axis | null>(null);

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly rightCol = viewChild.required<ElementRef<HTMLElement>>('rightCol');

  protected start(axis: Axis, e: PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    this.dragging.set(axis);
  }

  protected move(e: PointerEvent) {
    const axis = this.dragging();
    if (!axis) return;
    if (axis === 'x') {
      const rect = this.root().nativeElement.getBoundingClientRect();
      this.left.set(clamp(((e.clientX - rect.left) / rect.width) * 100, 15, 85));
    } else {
      const rect = this.rightCol().nativeElement.getBoundingClientRect();
      this.top.set(clamp(((e.clientY - rect.top) / rect.height) * 100, 15, 85));
    }
  }

  protected end() {
    this.dragging.set(null);
  }

  protected reset() {
    this.left.set(30);
    this.top.set(60);
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

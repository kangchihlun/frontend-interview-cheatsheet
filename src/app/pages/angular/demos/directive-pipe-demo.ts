import { Component, Directive, effect, ElementRef, inject, input, Pipe, PipeTransform, Renderer2, signal } from '@angular/core';

/** 自訂屬性型 directive：價格變動時閃爍綠/紅（交易 UI 常見） */
@Directive({
  selector: '[appPriceFlash]',
  host: {
    class: 'price-flash',
    '[class.flash-up]': 'dir() === 1',
    '[class.flash-down]': 'dir() === -1',
    '(animationend)': 'dir.set(0)',
  },
})
export class PriceFlash {
  readonly appPriceFlash = input.required<number>();
  protected readonly dir = signal<0 | 1 | -1>(0);
  private prev?: number;

  constructor() {
    effect(() => {
      const v = this.appPriceFlash();
      if (this.prev !== undefined && v !== this.prev) this.dir.set(v > this.prev ? 1 : -1);
      this.prev = v;
    });
  }
}

/** 直接操作 DOM 時用 Renderer2（SSR 安全），不要直接 el.nativeElement.style */
@Directive({ selector: '[appAutoFocus]' })
export class AutoFocus {
  constructor() {
    const el = inject<ElementRef<HTMLInputElement>>(ElementRef);
    inject(Renderer2).setAttribute(el.nativeElement, 'placeholder', 'appAutoFocus 設定了 placeholder');
    queueMicrotask(() => el.nativeElement.focus());
  }
}

/** 純 pipe（pure: true 預設）：只有輸入參考改變才重新計算 */
@Pipe({ name: 'compact' })
export class CompactNumberPipe implements PipeTransform {
  transform(v: number, digits = 1): string {
    const units = ['', 'K', 'M', 'B', 'T'];
    let i = 0;
    while (Math.abs(v) >= 1000 && i < units.length - 1) {
      v /= 1000;
      i++;
    }
    return `${v.toFixed(i === 0 ? 0 : digits)}${units[i]}`;
  }
}

@Component({
  selector: 'app-directive-pipe-demo',
  imports: [PriceFlash, AutoFocus, CompactNumberPipe],
  template: `
    <div class="row">
      <button class="btn" type="button" (click)="tick(1)">價格 ↑</button>
      <button class="btn" type="button" (click)="tick(-1)">價格 ↓</button>
      <span class="price" [appPriceFlash]="price()">{{ price().toFixed(2) }}</span>
    </div>
    <p>成交量：{{ volume() }} → <b>{{ volume() | compact }}</b>（自訂 pipe）、{{ volume() | compact: 3 }}</p>
    <input appAutoFocus />
  `,
  styles: `
    .price { font-family: var(--font-mono); font-size: 20px; padding: 2px 8px; border-radius: 4px; }
    .flash-up { animation: up 0.6s; }
    .flash-down { animation: down 0.6s; }
    @keyframes up { from { background: color-mix(in srgb, var(--up) 60%, transparent); } }
    @keyframes down { from { background: color-mix(in srgb, var(--down) 60%, transparent); } }
  `,
})
export class DirectivePipeDemo {
  protected readonly price = signal(67890.5);
  protected readonly volume = signal(1234567890);

  protected tick(d: number) {
    this.price.update((p) => p + d * Math.random() * 20);
    this.volume.update((v) => Math.round(v * (1 + Math.random() * 0.1)));
  }
}

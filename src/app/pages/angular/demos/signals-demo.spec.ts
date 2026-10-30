import { FormControl } from '@angular/forms';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { tickSize } from './reactive-forms-demo';
import { SignalsDemo } from './signals-demo';

describe('SignalsDemo', () => {
  it('換商品時 linkedSignal 會把數量重設為最小下單量，computed 跟著更新', async () => {
    const fixture = TestBed.createComponent(SignalsDemo);
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;

    const buttons = el.querySelectorAll<HTMLButtonElement>('button');
    buttons[1].click(); // ETH
    await fixture.whenStable();

    const qty = el.querySelector<HTMLInputElement>('input[type=number]')!;
    expect(qty.value).toBe('0.01');
    expect(el.textContent).toContain('notional = 34.56');
  });
});

describe('tickSize validator', () => {
  it('價格必須是 tick 的倍數', () => {
    const v = tickSize(0.5);
    expect(v(new FormControl(100.5))).toBeNull();
    expect(v(new FormControl(100.3))).toEqual({ tickSize: { step: 0.5 } });
    expect(v(new FormControl(null))).toBeNull();
  });
});

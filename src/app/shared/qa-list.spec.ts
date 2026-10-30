import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { QaList } from './qa-list';

describe('QaList（元件測試）', () => {
  let fixture: ComponentFixture<QaList>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [QaList] }).compileComponents();
    fixture = TestBed.createComponent(QaList);
    // signal input 用 setInput 設定
    fixture.componentRef.setInput('items', [
      { q: '什麼是 switchMap？', a: '取消舊的' },
      { q: 'BFC 是什麼？', a: '區塊格式化上下文', level: 2 },
    ]);
    await fixture.whenStable(); // zoneless：等待變更偵測完成
    el = fixture.nativeElement;
  });

  it('渲染所有題目與數量', () => {
    expect(el.querySelectorAll('details').length).toBe(2);
    expect(el.querySelector('h2')?.textContent).toContain('2 題');
  });

  it('搜尋會過濾題目', async () => {
    const input = el.querySelector<HTMLInputElement>('input[type=search]')!;
    input.value = 'bfc';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    const items = el.querySelectorAll('summary');
    expect(items.length).toBe(1);
    expect(items[0].textContent).toContain('BFC');
  });

  it('全部展開按鈕會打開所有 details', async () => {
    el.querySelector<HTMLButtonElement>('button')!.click();
    await fixture.whenStable();
    el.querySelectorAll('details').forEach((d) => expect(d.open).toBe(true));
  });
});

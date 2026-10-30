import { JsonPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormArray, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

/** 自訂同步 validator：價格必須是 tick size 的倍數 */
export function tickSize(step: number): ValidatorFn {
  return (c: AbstractControl): ValidationErrors | null => {
    const v = Number(c.value);
    if (!v) return null;
    const ok = Math.abs(Math.round(v / step) * step - v) < 1e-9;
    return ok ? null : { tickSize: { step } };
  };
}

/** 跨欄位 validator（掛在 FormGroup）：停損價必須低於買入價 */
const stopBelowPrice: ValidatorFn = (g: AbstractControl): ValidationErrors | null => {
  const price = g.get('price')?.value;
  const stop = g.get('stopLoss')?.value;
  return price && stop && stop >= price ? { stopAbovePrice: true } : null;
};

@Component({
  selector: 'app-reactive-forms-demo',
  imports: [ReactiveFormsModule, JsonPipe],
  template: `
    <form class="form" [formGroup]="orderForm" (ngSubmit)="submit()">
      <label>
        商品
        <select formControlName="symbol">
          <option>BTCUSDT</option>
          <option>ETHUSDT</option>
        </select>
      </label>
      <label>
        價格（tick 0.5）
        <input type="number" formControlName="price" />
        @if (orderForm.controls.price.hasError('tickSize')) {
          <small class="down">價格需為 0.5 的倍數</small>
        }
        @if (orderForm.controls.price.hasError('required') && orderForm.controls.price.touched) {
          <small class="down">必填</small>
        }
      </label>
      <label>
        停損價
        <input type="number" formControlName="stopLoss" />
        @if (orderForm.hasError('stopAbovePrice')) {
          <small class="down">停損價必須低於價格（FormGroup 層級驗證）</small>
        }
      </label>

      <fieldset formArrayName="takeProfits">
        <legend>分批停利（FormArray）</legend>
        @for (tp of takeProfits.controls; track tp; let i = $index) {
          <div class="row">
            <input type="number" [formControlName]="i" />
            <button class="btn" type="button" (click)="takeProfits.removeAt(i)">✕</button>
          </div>
        }
        <button class="btn" type="button" (click)="addTp()">+ 新增停利</button>
      </fieldset>

      <div class="row">
        <button class="btn primary" type="submit" [disabled]="orderForm.invalid">送出</button>
        <button class="btn" type="button" (click)="orderForm.reset()">reset</button>
        <span class="muted">status（toSignal(statusChanges)）= {{ status() }}</span>
      </div>
    </form>
    <pre class="log">getRawValue(): {{ value() | json }}</pre>
  `,
  styles: `
    .form { display: grid; gap: 10px; max-width: 420px; }
    label { display: flex; flex-direction: column; font-size: 13px; }
    fieldset { border: 1px solid var(--border); border-radius: 6px; display: grid; gap: 6px; }
    input.ng-invalid.ng-touched { border-color: var(--down); }
  `,
})
export class ReactiveFormsDemo {
  private readonly fb = inject(FormBuilder).nonNullable; // nonNullable：reset() 回到初始值而不是 null

  protected readonly orderForm = this.fb.group(
    {
      symbol: 'BTCUSDT',
      price: [67890, [Validators.required, Validators.min(0), tickSize(0.5)]],
      stopLoss: [67000],
      takeProfits: this.fb.array([this.fb.control(70000)]),
    },
    { validators: stopBelowPrice },
  );

  protected get takeProfits(): FormArray {
    return this.orderForm.controls.takeProfits;
  }

  // Observable → Signal
  protected readonly status = toSignal(this.orderForm.statusChanges, { initialValue: this.orderForm.status });
  protected readonly value = toSignal(this.orderForm.valueChanges, { initialValue: this.orderForm.getRawValue() });

  protected addTp() {
    this.takeProfits.push(this.fb.control(0));
  }

  protected submit() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }
    alert(JSON.stringify(this.orderForm.getRawValue()));
  }
}

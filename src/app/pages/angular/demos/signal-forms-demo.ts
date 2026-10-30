import { JsonPipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { email, form, FormField, min, minLength, required, submit, validate } from '@angular/forms/signals';

interface Registration {
  email: string;
  password: string;
  confirm: string;
  leverage: number;
  agree: boolean;
}

@Component({
  selector: 'app-signal-forms-demo',
  imports: [FormField, JsonPipe],
  template: `
    <form class="form" (submit)="onSubmit($event)" novalidate>
      <label>
        Email
        <input type="email" [formField]="f.email" />
        @if (f.email().touched() && f.email().invalid()) {
          @for (e of f.email().errors(); track e.kind) {
            <small class="down">{{ e.message }}</small>
          }
        }
      </label>
      <label>
        密碼（至少 8 碼）
        <input type="password" [formField]="f.password" />
        @if (f.password().touched() && f.password().invalid()) {
          <small class="down">{{ f.password().errors()[0].message }}</small>
        }
      </label>
      <label>
        確認密碼（跨欄位驗證）
        <input type="password" [formField]="f.confirm" />
        @if (f.confirm().touched() && f.confirm().invalid()) {
          <small class="down">{{ f.confirm().errors()[0].message }}</small>
        }
      </label>
      <label>
        槓桿倍數（1 以上）
        <input type="number" [formField]="f.leverage" />
        @if (f.leverage().invalid()) {
          <small class="down">{{ f.leverage().errors()[0].message }}</small>
        }
      </label>
      <label class="check"><input type="checkbox" [formField]="f.agree" /> 我同意風險揭露</label>

      <div class="row">
        <button class="btn primary" type="submit" [disabled]="f().submitting()">{{ f().submitting() ? '送出中…' : '註冊' }}</button>
        <span class="muted">valid={{ f().valid() }} · dirty={{ f().dirty() }}</span>
      </div>
      @if (result()) {
        <p class="up">{{ result() }}</p>
      }
    </form>
    <p class="muted">model signal（form 直接讀寫這個 signal，沒有另一份拷貝）：</p>
    <pre class="log">{{ model() | json }}</pre>
  `,
  styles: `
    .form { display: grid; gap: 10px; max-width: 420px; }
    label { display: flex; flex-direction: column; gap: 2px; font-size: 13px; }
    label.check { flex-direction: row; align-items: center; gap: 6px; }
    input.ng-invalid.ng-touched { border-color: var(--down); }
  `,
})
export class SignalFormsDemo {
  // 1. 資料模型就是一個 signal
  protected readonly model = signal<Registration>({ email: '', password: '', confirm: '', leverage: 1, agree: false });
  protected readonly result = signal('');

  // 2. form(model, schema)：在 schema 函式中宣告驗證規則
  protected readonly f = form(this.model, (p) => {
    required(p.email, { message: 'Email 必填' });
    email(p.email, { message: 'Email 格式錯誤' });
    required(p.password, { message: '密碼必填' });
    minLength(p.password, 8, { message: '密碼至少 8 碼' });
    validate(p.confirm, ({ value, valueOf }) =>
      value() !== valueOf(p.password) ? { kind: 'mismatch', message: '兩次密碼不一致' } : null,
    );
    min(p.leverage, 1, { message: '槓桿至少 1 倍' });
    required(p.agree, { message: '必須同意' });
  });

  protected async onSubmit(e: Event) {
    e.preventDefault();
    // submit()：標記全部 touched，valid 時才執行 action；action 期間 submitting() = true
    await submit(this.f, async () => {
      await new Promise((r) => setTimeout(r, 800));
      this.result.set(`註冊成功：${this.model().email}`);
      return undefined;
    });
  }
}

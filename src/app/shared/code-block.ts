import { Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-code',
  template: `
    <div class="code">
      <div class="bar">
        <span>{{ lang() }}</span>
        <button type="button" (click)="copy()">{{ copied() ? '已複製 ✓' : '複製' }}</button>
      </div>
      <pre><code>{{ code().trim() }}</code></pre>
    </div>
  `,
  styles: `
    .code {
      border: 1px solid var(--border);
      border-radius: 6px;
      background: var(--code-bg);
      overflow: hidden;
      margin: 8px 0;
    }
    .bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 2px 8px;
      font-size: 12px;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      button {
        background: none;
        border: none;
        color: var(--primary);
        font-size: 12px;
      }
    }
    pre {
      margin: 0;
      padding: 10px 12px;
      overflow: auto;
      max-height: 480px;
      font-size: 12.5px;
      line-height: 1.55;
    }
    code {
      background: none;
      border: none;
      padding: 0;
      white-space: pre;
    }
  `,
})
export class CodeBlock {
  readonly code = input.required<string>();
  readonly lang = input('ts');
  protected readonly copied = signal(false);

  protected async copy() {
    await navigator.clipboard?.writeText(this.code().trim());
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1200);
  }
}

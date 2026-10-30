import { Component, computed, input, signal } from '@angular/core';
import { CodeBlock } from './code-block';

type View = 'preview' | 'html' | 'scss' | 'ts';

/**
 * Demo 外框：預覽（content projection）+ 原始碼分頁。
 * html / scss 通常用 `import x from './a.scss' with { loader: 'text' }` 傳入，與實際渲染同一份原始碼。
 */
@Component({
  selector: 'app-demo',
  imports: [CodeBlock],
  template: `
    <article class="demo">
      <header>
        <div>
          <h3>{{ title() }}</h3>
          @if (desc()) {
            <p class="muted" [innerHTML]="desc()"></p>
          }
        </div>
        <nav>
          @for (v of views(); track v.id) {
            <button type="button" [class.on]="view() === v.id" (click)="view.set(v.id)">{{ v.label }}</button>
          }
        </nav>
      </header>
      <div class="preview" [hidden]="view() !== 'preview'"><ng-content /></div>
      @switch (view()) {
        @case ('html') {
          <app-code [code]="html()!" lang="html" />
        }
        @case ('scss') {
          <app-code [code]="scss()!" lang="scss" />
        }
        @case ('ts') {
          <app-code [code]="ts()!" lang="ts" />
        }
      }
    </article>
  `,
  styles: `
    .demo {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 14px 16px;
      margin-bottom: 16px;
    }
    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 8px;
      margin-bottom: 10px;
      h3 {
        margin: 0;
        font-size: 17px;
      }
      p {
        margin: 4px 0 0;
        font-size: 13.5px;
      }
    }
    nav {
      display: flex;
      gap: 4px;
      align-self: flex-start;
      button {
        border: 1px solid var(--border);
        background: var(--surface-2);
        color: var(--text-muted);
        border-radius: 6px;
        padding: 2px 10px;
        font-size: 13px;
        &.on {
          color: #fff;
          background: var(--primary);
          border-color: var(--primary);
        }
      }
    }
  `,
})
export class DemoCard {
  readonly title = input.required<string>();
  readonly desc = input<string>();
  readonly html = input<string>();
  readonly scss = input<string>();
  readonly ts = input<string>();
  protected readonly view = signal<View>('preview');
  protected readonly views = computed(() => {
    const list: { id: View; label: string }[] = [{ id: 'preview', label: '畫面' }];
    if (this.html()) list.push({ id: 'html', label: 'HTML' });
    if (this.scss()) list.push({ id: 'scss', label: 'SCSS' });
    if (this.ts()) list.push({ id: 'ts', label: 'TS' });
    return list;
  });
}

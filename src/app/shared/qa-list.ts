import { Component, computed, input, signal } from '@angular/core';
import { CodeBlock } from './code-block';
import { QaItem } from './qa.model';

@Component({
  selector: 'app-qa-list',
  imports: [CodeBlock],
  template: `
    <section class="qa">
      <header>
        <h2>{{ heading() }} <small class="muted">（{{ filtered().length }} 題）</small></h2>
        <div class="row">
          <input type="search" placeholder="搜尋題目…" [value]="keyword()" (input)="keyword.set($any($event.target).value)" />
          <button class="btn" type="button" (click)="openAll.set(!openAll())">
            {{ openAll() ? '全部收合' : '全部展開' }}
          </button>
        </div>
      </header>
      @for (item of filtered(); track item.q; let i = $index) {
        <details [open]="openAll()">
          <summary>
            <span class="no">Q{{ i + 1 }}</span>
            <span class="lv lv{{ item.level ?? 1 }}">{{ levels[(item.level ?? 1) - 1] }}</span>
            {{ item.q }}
          </summary>
          <div class="answer" [innerHTML]="item.a"></div>
          @if (item.code) {
            <app-code [code]="item.code" />
          }
        </details>
      } @empty {
        <p class="muted">沒有符合的題目</p>
      }
    </section>
  `,
  styles: `
    .qa {
      margin-top: 24px;
    }
    header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      h2 {
        margin: 0;
        font-size: 20px;
      }
    }
    details {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      margin: 8px 0;
      padding: 0 14px;
      &[open] {
        padding-bottom: 10px;
        border-color: color-mix(in srgb, var(--primary) 50%, var(--border));
      }
    }
    summary {
      cursor: pointer;
      padding: 10px 0;
      font-weight: 600;
    }
    .no {
      color: var(--primary);
      margin-right: 6px;
      font-family: var(--font-mono);
    }
    .lv {
      font-size: 11px;
      font-weight: 500;
      border-radius: 10px;
      padding: 1px 8px;
      margin-right: 6px;
      vertical-align: 1px;
    }
    .lv1 {
      background: color-mix(in srgb, var(--up) 20%, transparent);
      color: var(--up);
    }
    .lv2 {
      background: color-mix(in srgb, var(--warn) 20%, transparent);
      color: var(--warn);
    }
    .lv3 {
      background: color-mix(in srgb, var(--down) 20%, transparent);
      color: var(--down);
    }
    .answer {
      line-height: 1.75;
    }
  `,
})
export class QaList {
  readonly items = input.required<QaItem[]>();
  readonly heading = input('面試考題');
  protected readonly levels = ['基礎', '進階', '加分'];
  protected readonly keyword = signal('');
  protected readonly openAll = signal(false);
  protected readonly filtered = computed(() => {
    const k = this.keyword().trim().toLowerCase();
    return k ? this.items().filter((i) => (i.q + i.a + (i.code ?? '')).toLowerCase().includes(k)) : this.items();
  });
}

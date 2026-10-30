import { Component, input, model } from '@angular/core';

export interface TabDef {
  id: string;
  label: string;
}

/** 頁內子頁籤，使用 model() 做雙向綁定：<app-sub-tabs [tabs]="tabs" [(active)]="active" /> */
@Component({
  selector: 'app-sub-tabs',
  template: `
    <div class="tabs" role="tablist">
      @for (t of tabs(); track t.id) {
        <button
          type="button"
          role="tab"
          [attr.aria-selected]="active() === t.id"
          [class.on]="active() === t.id"
          (click)="active.set(t.id)"
        >
          {{ t.label }}
        </button>
      }
    </div>
  `,
  styles: `
    .tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0 0 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    button {
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-muted);
      border-radius: 999px;
      padding: 4px 14px;
      font-size: 13.5px;
      &:hover {
        color: var(--text);
      }
      &.on {
        color: var(--text);
        border-color: var(--primary);
        background: color-mix(in srgb, var(--primary) 18%, var(--surface));
      }
    }
  `,
})
export class SubTabs {
  readonly tabs = input.required<TabDef[]>();
  readonly active = model.required<string>();
}

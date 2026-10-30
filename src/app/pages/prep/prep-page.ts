import { Component, computed, effect, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { BEHAVIOR_QA, CHECKLIST, LIVE_CODING, REQUIREMENT_MAP } from './prep.data';

const STORAGE_KEY = 'prep-checklist';

@Component({
  selector: 'app-prep-page',
  imports: [PageHeader, SubTabs, DemoCard, QaList, RouterLink],
  template: `
    <app-page-header title="面試準備" intro="把職缺要求逐條對應到本站的頁籤，加上現場 coding 題、行為面試與反問清單。" />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />
    @switch (active()) {
      @case ('map') {
        <app-demo title="職缺要求 → 準備重點" desc="依 position-requirement.md 整理">
          <div class="scroll">
            <table class="simple">
              <tr><th>職缺要求</th><th>可能被問 / 被要求展示</th><th>對應頁籤</th></tr>
              @for (r of map; track r.req) {
                <tr>
                  <td><b>{{ r.req }}</b>@if (r.nice) { <span class="nice">Nice to have</span> }</td>
                  <td [innerHTML]="r.focus"></td>
                  <td class="links">
                    @for (l of r.links; track l) {
                      <a [routerLink]="'/' + l">{{ l }}</a>
                    }
                  </td>
                </tr>
              }
            </table>
          </div>
        </app-demo>
      }
      @case ('coding') {
        <app-demo title="現場 Coding / 白板題（可能的題目）" desc="大多都能在本站找到可執行的參考實作。">
          <ol class="coding">
            @for (c of coding; track c.title) {
              <li>
                <b>{{ c.title }}</b> <span class="muted">— {{ c.hint }}</span>
                @if (c.link) {
                  <a [routerLink]="'/' + c.link">→ 參考</a>
                }
              </li>
            }
          </ol>
        </app-demo>
      }
      @case ('check') {
        <app-demo title="面試前檢查清單" [desc]="'已完成 ' + doneCount() + ' / ' + checklist.length + '（存在瀏覽器 localStorage）'">
          <ul class="check">
            @for (c of checklist; track c; let i = $index) {
              <li>
                <label [class.done]="done().has(i)"><input type="checkbox" [checked]="done().has(i)" (change)="toggle(i)" /> {{ c }}</label>
              </li>
            }
          </ul>
        </app-demo>
      }
      @default {
        <app-qa-list heading="行為面試 / 自我介紹 / 反問" [items]="behavior" />
      }
    }
  `,
  styles: `
    .scroll { overflow-x: auto; }
    .nice { display: inline-block; margin-left: 6px; font-size: 11px; padding: 0 6px; border-radius: 8px; background: color-mix(in srgb, var(--warn) 20%, transparent); color: var(--warn); }
    .links { white-space: nowrap; } .links a { margin-right: 8px; }
    .coding li { margin: 6px 0; }
    .check { list-style: none; padding: 0; }
    .check li { padding: 4px 0; }
    .done { color: var(--text-muted); text-decoration: line-through; }
  `,
})
export default class PrepPage {
  protected readonly tabs: TabDef[] = [
    { id: 'map', label: '職缺對應表' },
    { id: 'coding', label: '現場 Coding 題' },
    { id: 'behavior', label: '📝 行為面試 / 反問' },
    { id: 'check', label: '檢查清單' },
  ];
  protected readonly active = signal('map');
  protected readonly map = REQUIREMENT_MAP;
  protected readonly coding = LIVE_CODING;
  protected readonly behavior = BEHAVIOR_QA;
  protected readonly checklist = CHECKLIST;
  protected readonly done = signal(new Set<number>(load()));
  protected readonly doneCount = computed(() => this.done().size);

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.done()]));
      } catch {
        /* 無痕模式 */
      }
    });
  }

  protected toggle(i: number) {
    this.done.update((s) => {
      const next = new Set(s);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }
}

function load(): number[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

import { Component, DestroyRef, inject, signal } from '@angular/core';
import { concatMap, exhaustMap, mergeMap, Observable, OperatorFunction, Subject, switchMap } from 'rxjs';

type Op = 'switchMap' | 'mergeMap' | 'concatMap' | 'exhaustMap';

interface Lane {
  op: Op;
  hint: string;
  events: { text: string; kind: 'start' | 'done' | 'cancel' }[];
}

/**
 * 四種「高階映射」運算子比較：每次點擊送出一個耗時 1.2 秒的請求
 * 快速連點 3 次觀察每條 lane 的差別
 */
@Component({
  selector: 'app-flattening-demo',
  template: `
    <div class="row">
      <button class="btn primary" type="button" (click)="click()">送出請求 #{{ n() + 1 }}（快速連點！）</button>
      <button class="btn" type="button" (click)="clear()">清除</button>
    </div>
    <div class="lanes">
      @for (lane of lanes(); track lane.op) {
        <section>
          <h4><code>{{ lane.op }}</code></h4>
          <p class="muted">{{ lane.hint }}</p>
          <div class="events">
            @for (e of lane.events; track $index) {
              <span class="ev {{ e.kind }}">{{ e.text }}</span>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    .lanes { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 10px; margin-top: 10px; }
    section { border: 1px solid var(--border); border-radius: 6px; padding: 8px; }
    h4 { margin: 0; } p { font-size: 12px; margin: 2px 0 6px; min-height: 36px; }
    .events { display: flex; flex-wrap: wrap; gap: 4px; }
    .ev { font-size: 12px; font-family: var(--font-mono); padding: 1px 6px; border-radius: 4px; }
    .start { background: var(--surface-2); }
    .done { background: color-mix(in srgb, var(--up) 30%, transparent); color: var(--up); }
    .cancel { background: color-mix(in srgb, var(--down) 25%, transparent); color: var(--down); text-decoration: line-through; }
  `,
})
export class FlatteningDemo {
  protected readonly n = signal(0);
  private readonly clicks$ = new Subject<number>();
  protected readonly lanes = signal<Lane[]>([
    { op: 'switchMap', hint: '取消前一個，只保留最新 → 搜尋、切換頁籤', events: [] },
    { op: 'mergeMap', hint: '全部並行，完成順序不固定 → 平行上傳、互不相關的請求', events: [] },
    { op: 'concatMap', hint: '排隊依序執行 → 下單、需保證順序的寫入', events: [] },
    { op: 'exhaustMap', hint: '執行中忽略新的 → 防止重複送出、登入按鈕', events: [] },
  ]);

  constructor() {
    const destroyRef = inject(DestroyRef);
    type Project = (id: number) => Observable<number>;
    const ops: Record<Op, (fn: Project) => OperatorFunction<number, number>> = {
      switchMap: (fn) => switchMap(fn),
      mergeMap: (fn) => mergeMap(fn),
      concatMap: (fn) => concatMap(fn),
      exhaustMap: (fn) => exhaustMap(fn),
    };
    (Object.keys(ops) as Op[]).forEach((op) => {
      const sub = this.clicks$.pipe(ops[op]((id) => this.fakeRequest(op, id))).subscribe((id) => this.log(op, `✓ #${id}`, 'done'));
      destroyRef.onDestroy(() => sub.unsubscribe());
    });
  }

  /** 模擬 API：subscribe 時開始；被取消（unsubscribe）時記錄 cancel */
  private fakeRequest(op: Op, id: number): Observable<number> {
    return new Observable<number>((subscriber) => {
      this.log(op, `▶ #${id}`, 'start');
      let done = false;
      const t = setTimeout(() => {
        done = true;
        subscriber.next(id);
        subscriber.complete();
      }, 1200);
      // teardown：完成或被 unsubscribe 時都會執行，用 done 分辨是不是被取消
      return () => {
        clearTimeout(t);
        if (!done) this.log(op, `✕ #${id}`, 'cancel');
      };
    });
  }

  protected click() {
    this.n.update((v) => v + 1);
    this.clicks$.next(this.n());
  }

  protected clear() {
    this.n.set(0);
    this.lanes.update((ls) => ls.map((l) => ({ ...l, events: [] })));
  }

  private log(op: Op, text: string, kind: 'start' | 'done' | 'cancel') {
    this.lanes.update((ls) => ls.map((l) => (l.op === op ? { ...l, events: [...l.events, { text, kind }] } : l)));
  }
}

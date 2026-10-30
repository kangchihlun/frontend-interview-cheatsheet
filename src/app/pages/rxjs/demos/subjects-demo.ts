import { Component, OnDestroy, signal } from '@angular/core';
import { AsyncSubject, BehaviorSubject, ReplaySubject, Subject, Subscription } from 'rxjs';

type Kind = 'Subject' | 'BehaviorSubject(0)' | 'ReplaySubject(2)' | 'AsyncSubject';

@Component({
  selector: 'app-subjects-demo',
  template: `
    <div class="row">
      <button class="btn primary" type="button" (click)="emit()">next({{ value() + 1 }})</button>
      <button class="btn" type="button" (click)="subscribeLate()">新增訂閱者 #{{ subCount() + 1 }}</button>
      <button class="btn" type="button" (click)="complete()">complete()</button>
      <button class="btn" type="button" (click)="reset()">重置</button>
    </div>
    <p class="muted">步驟：先 next 幾次 → 新增訂閱者 → 再 next → complete，比較晚到的訂閱者收到什麼。</p>
    <div class="grid">
      @for (k of kinds; track k) {
        <section>
          <h4><code>{{ k }}</code></h4>
          <p class="muted">{{ hints[k] }}</p>
          <div class="log">
            @for (l of logs()[k]; track $index) {
              <div>{{ l }}</div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: `
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; }
    section { border: 1px solid var(--border); border-radius: 6px; padding: 8px; }
    h4 { margin: 0; } p { font-size: 12px; margin: 2px 0; min-height: 34px; }
  `,
})
export class SubjectsDemo implements OnDestroy {
  protected readonly kinds: Kind[] = ['Subject', 'BehaviorSubject(0)', 'ReplaySubject(2)', 'AsyncSubject'];
  protected readonly hints: Record<Kind, string> = {
    Subject: '沒有記憶，晚到只收到之後的值',
    'BehaviorSubject(0)': '一定有初始值，訂閱時立刻拿到「目前值」；可用 .value 同步讀取',
    'ReplaySubject(2)': '重播最近 N 筆給新訂閱者',
    AsyncSubject: '只在 complete 時送出最後一個值',
  };
  protected readonly value = signal(0);
  protected readonly subCount = signal(0);
  protected readonly logs = signal<Record<Kind, string[]>>(this.emptyLogs());
  private subjects = this.create();
  private subs = new Subscription();

  private create(): Record<Kind, Subject<number>> {
    return {
      Subject: new Subject<number>(),
      'BehaviorSubject(0)': new BehaviorSubject<number>(0),
      'ReplaySubject(2)': new ReplaySubject<number>(2),
      AsyncSubject: new AsyncSubject<number>(),
    };
  }

  private emptyLogs(): Record<Kind, string[]> {
    return { Subject: [], 'BehaviorSubject(0)': [], 'ReplaySubject(2)': [], AsyncSubject: [] };
  }

  protected emit() {
    this.value.update((v) => v + 1);
    this.kinds.forEach((k) => this.subjects[k].next(this.value()));
    this.push('all', `── next(${this.value()})`);
  }

  protected subscribeLate() {
    const id = this.subCount() + 1;
    this.subCount.set(id);
    this.push('all', `── 訂閱者 #${id} 加入`);
    this.kinds.forEach((k) => {
      this.subs.add(
        this.subjects[k].subscribe({
          next: (v) => this.push(k, `  #${id} 收到 ${v}`),
          complete: () => this.push(k, `  #${id} complete`),
        }),
      );
    });
  }

  protected complete() {
    this.push('all', '── complete()');
    this.kinds.forEach((k) => this.subjects[k].complete());
  }

  protected reset() {
    this.subs.unsubscribe();
    this.subs = new Subscription();
    this.subjects = this.create();
    this.value.set(0);
    this.subCount.set(0);
    this.logs.set(this.emptyLogs());
  }

  private push(k: Kind | 'all', msg: string) {
    this.logs.update((logs) => {
      const next = { ...logs };
      for (const key of k === 'all' ? this.kinds : [k]) next[key] = [...next[key], msg];
      return next;
    });
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
}

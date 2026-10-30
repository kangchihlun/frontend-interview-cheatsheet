import { Component, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, filter, map, Observable, of, startWith, Subject, switchMap, tap } from 'rxjs';

const SYMBOLS = ['BTCUSDT', 'BTCUSDC', 'ETHUSDT', 'ETHBTC', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'ADAUSDT', 'DOGEUSDT', 'LINKUSDT'];

type State = { loading: boolean; items: string[]; error?: string };

/** 經典面試題：自動完成搜尋 */
@Component({
  selector: 'app-typeahead-demo',
  template: `
    <input placeholder="輸入 btc、eth…（輸入 x 觸發錯誤）" (input)="input$.next($any($event.target).value)" />
    @if (state().loading) {
      <p class="muted">搜尋中…</p>
    } @else if (state().error) {
      <p class="down">{{ state().error }}（錯誤被 catchError 吃在內層，外層串流不會死）</p>
    } @else {
      <ul>
        @for (s of state().items; track s) {
          <li>{{ s }}</li>
        }
      </ul>
    }
    <div class="log">
      @for (l of logs(); track $index) {
        <div>{{ l }}</div>
      }
    </div>
  `,
  styles: `input { width: 100%; max-width: 420px; }`,
})
export class TypeaheadDemo {
  protected readonly input$ = new Subject<string>();
  protected readonly logs = signal<string[]>([]);

  protected readonly state = toSignal(
    this.input$.pipe(
      tap((v) => this.log(`keyup  "${v}"`)),
      map((v) => v.trim().toLowerCase()),
      debounceTime(300), //           1. 停止輸入 300ms 才繼續
      distinctUntilChanged(), //      2. 跟上次一樣就不查
      filter((v) => v.length >= 2), // 3. 至少 2 個字
      tap((v) => this.log(`→ 發送請求 "${v}"`)),
      switchMap((q) =>
        //                            4. 新關鍵字來了就取消舊請求
        this.api(q).pipe(
          map((items): State => ({ loading: false, items })),
          startWith<State>({ loading: true, items: [] }),
          catchError((e: Error) => of<State>({ loading: false, items: [], error: e.message })), // 5. 錯誤放內層
        ),
      ),
      takeUntilDestroyed(),
    ),
    { initialValue: { loading: false, items: [] } as State },
  );

  private api(q: string): Observable<string[]> {
    return new Observable<string[]>((sub) => {
      const t = setTimeout(() => {
        if (q.includes('x')) sub.error(new Error('API 500'));
        else {
          sub.next(SYMBOLS.filter((s) => s.toLowerCase().includes(q)));
          sub.complete();
        }
      }, 500 + Math.random() * 500);
      return () => {
        clearTimeout(t);
        if (!sub.closed) this.log(`✕ 取消 "${q}"`);
      };
    });
  }

  private log(msg: string) {
    this.logs.update((l) => [`${new Date().toLocaleTimeString()} ${msg}`, ...l].slice(0, 12));
  }
}

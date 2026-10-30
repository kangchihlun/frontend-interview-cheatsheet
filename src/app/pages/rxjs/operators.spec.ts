import { debounceTime, distinctUntilChanged, exhaustMap, map, Observable, switchMap } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

/** 被測的「搜尋」管線：把它抽成純函式，才能用 marble test 驗證時序 */
export function searchPipeline(input$: Observable<string>, api: (q: string) => Observable<string>) {
  return input$.pipe(debounceTime(3), distinctUntilChanged(), switchMap(api));
}

describe('RxJS marble testing', () => {
  let scheduler: TestScheduler;

  beforeEach(() => {
    scheduler = new TestScheduler((actual, expected) => expect(actual).toEqual(expected));
  });

  it('map', () => {
    scheduler.run(({ cold, expectObservable }) => {
      const src = cold('-a-b-|', { a: 1, b: 2 });
      expectObservable(src.pipe(map((x) => x * 10))).toBe('-a-b-|', { a: 10, b: 20 });
    });
  });

  it('搜尋管線：debounce + distinct + switchMap 取消舊請求', () => {
    scheduler.run(({ hot, cold, expectObservable }) => {
      // 每個 frame = 1ms；api 回應需要 2ms
      const input = hot('  a-b----b-----c-c|');
      const api = (q: string) => cold('--r|', { r: q.toUpperCase() });
      // a 被 b 打斷（debounce）；第二個 b 與上次相同被 distinct 擋掉；c 連打兩次只送一次
      // complete 時 debounce 會立刻送出暫存的 c；switchMap 等內層完成才 complete
      const expected = '   -------B----------C|';
      expectObservable(searchPipeline(input, api)).toBe(expected, { B: 'B', C: 'C' });
    });
  });

  it('exhaustMap：執行中的點擊會被忽略', () => {
    scheduler.run(({ hot, cold, expectObservable }) => {
      const clicks = hot('a-b-c-----d|');
      const req = cold(' -----x|');
      // a 觸發請求；b、c 在請求進行中被忽略；d 觸發第二次請求
      expectObservable(clicks.pipe(exhaustMap(() => req))).toBe('-----x---------x|');
    });
  });
});

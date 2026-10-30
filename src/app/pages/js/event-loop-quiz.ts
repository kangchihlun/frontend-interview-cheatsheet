import { Component, computed, signal } from '@angular/core';
import { CodeBlock } from '../../shared/code-block';

interface Quiz {
  title: string;
  code: string;
}

/** 題目程式碼以字串保存並用 new Function 實際執行，顯示的輸出就是瀏覽器真正的執行順序 */
const QUIZZES: Quiz[] = [
  {
    title: '1. 經典：同步 / microtask / macrotask',
    code: `log('1 script start');
setTimeout(() => log('2 setTimeout'), 0);
Promise.resolve().then(() => log('3 promise1')).then(() => log('4 promise2'));
queueMicrotask(() => log('5 queueMicrotask'));
log('6 script end');`,
  },
  {
    title: '2. async / await',
    code: `async function a1() {
  log('a1 start');
  await a2();
  log('a1 end');         // await 之後 = .then 回呼（microtask）
}
async function a2() { log('a2'); }
log('script start');
setTimeout(() => log('timeout'), 0);
a1();
new Promise((r) => { log('promise executor'); r(); })   // executor 是同步執行
  .then(() => log('then'));
log('script end');`,
  },
  {
    title: '3. setTimeout 裡的 Promise',
    code: `setTimeout(() => {
  log('t1');
  Promise.resolve().then(() => log('t1 micro'));
}, 0);
setTimeout(() => log('t2'), 0);
Promise.resolve().then(() => {
  log('micro');
  setTimeout(() => log('t3 (from micro)'), 0);
});`,
  },
  {
    title: '4. var vs let 迴圈 + 閉包',
    code: `for (var i = 0; i < 3; i++) setTimeout(() => log('var i = ' + i), 0);
for (let j = 0; j < 3; j++) setTimeout(() => log('let j = ' + j), 0);`,
  },
  {
    title: '5. this 綁定',
    code: `const obj = {
  name: 'obj',
  normal() { return this?.name; },
  arrow: () => typeof this,
  nested() { return [1].map(() => this.name)[0]; },
};
const fn = obj.normal;
log('obj.normal() → ' + obj.normal());
log('fn() → ' + fn());                       // 嚴格模式下 this = undefined
log('fn.call({name:"x"}) → ' + fn.call({ name: 'x' }));
log('arrow → this 是 ' + obj.arrow());        // 箭頭函式取外層 this
log('nested 箭頭 → ' + obj.nested());`,
  },
  {
    title: '6. Hoisting 與 TDZ',
    code: `log('a = ' + a);          // var 提升，值為 undefined
var a = 1;
log('foo() = ' + foo());  // function 宣告整個提升
function foo() { return 'hoisted'; }
try { log(b); } catch (e) { log('b → ' + e.name); }  // TDZ
let b = 2;`,
  },
  {
    title: '7. == 與型別轉換',
    code: `log('[] == false → ' + ([] == false));
log('null == undefined → ' + (null == undefined));
log('null === undefined → ' + (null === undefined));
log('NaN === NaN → ' + (NaN === NaN));
log('Object.is(NaN, NaN) → ' + Object.is(NaN, NaN));
log("'5' + 3 → " + ('5' + 3));
log("'5' - 3 → " + ('5' - 3));
log('typeof null → ' + typeof null);
log('0.1 + 0.2 → ' + (0.1 + 0.2));`,
  },
];

@Component({
  selector: 'app-event-loop-quiz',
  imports: [CodeBlock],
  template: `
    <div class="row">
      @for (q of quizzes; track q.title; let i = $index) {
        <button class="btn" type="button" [class.primary]="index() === i" (click)="select(i)">{{ q.title }}</button>
      }
    </div>
    <app-code [code]="quiz().code" lang="js" />
    <div class="row">
      <button class="btn primary" type="button" (click)="run()">▶ 執行（先自己猜順序！）</button>
      <span class="muted">log() 收集輸出，等 50ms 讓所有 macrotask 跑完</span>
    </div>
    @if (output().length) {
      <ol class="log out">
        @for (o of output(); track $index) {
          <li>{{ o }}</li>
        }
      </ol>
    }
  `,
  styles: `.out { padding-left: 36px; }`,
})
export class EventLoopQuiz {
  protected readonly quizzes = QUIZZES;
  protected readonly index = signal(0);
  protected readonly quiz = computed(() => QUIZZES[this.index()]);
  protected readonly output = signal<string[]>([]);

  protected select(i: number) {
    this.index.set(i);
    this.output.set([]);
  }

  protected run() {
    const lines: string[] = [];
    const log = (v: unknown) => lines.push(String(v));
    try {
      // 'use strict' 讓 this 行為與 ES module / class 一致
      new Function('log', `'use strict';\n${this.quiz().code}`)(log);
    } catch (e) {
      lines.push(`Uncaught ${(e as Error).name}: ${(e as Error).message}`);
    }
    setTimeout(() => this.output.set(lines), 50);
  }
}

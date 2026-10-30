import { Component, computed, signal } from '@angular/core';

@Component({
  selector: 'app-box-model',
  template: `
    <div class="row">
      <label><input type="radio" name="bs" [checked]="sizing() === 'content-box'" (change)="sizing.set('content-box')" /> content-box</label>
      <label><input type="radio" name="bs" [checked]="sizing() === 'border-box'" (change)="sizing.set('border-box')" /> border-box</label>
      <label>padding <input type="range" min="0" max="40" [value]="pad()" (input)="pad.set(+$any($event.target).value)" /> {{ pad() }}px</label>
    </div>
    <div class="stage">
      <div class="box" [style.box-sizing]="sizing()" [style.padding.px]="pad()">width: 200px</div>
    </div>
    <p class="muted">實際佔用寬度 = <b>{{ actual() }}px</b>
      （{{ sizing() === 'border-box' ? 'width 已包含 padding + border' : '200 + padding×2 + border 10×2' }}）</p>
  `,
  styles: `
    .stage { padding: 10px; background: var(--surface-2); border-radius: 6px; margin-top: 8px; }
    .box { width: 200px; border: 10px solid var(--warn); background: color-mix(in srgb, var(--primary) 40%, transparent); background-clip: content-box; outline: 1px dashed var(--up); }
  `,
})
export class BoxModel {
  protected readonly sizing = signal<'content-box' | 'border-box'>('content-box');
  protected readonly pad = signal(20);
  protected readonly actual = computed(() => (this.sizing() === 'border-box' ? 200 : 200 + this.pad() * 2 + 20));
}

@Component({
  selector: 'app-bfc-demo',
  template: `
    <div class="cols">
      <div>
        <p class="cap">① margin 合併：上下相鄰 margin 取最大值（20px 與 30px → 30px，不是 50px）</p>
        <div class="wrap"><div class="m m20">margin-bottom: 20px</div><div class="m m30">margin-top: 30px</div></div>
      </div>
      <div>
        <p class="cap">② 父子 margin 穿透：子元素 margin-top 跑到父元素外面 → 父層 display: flow-root 解決</p>
        <label><input type="checkbox" [checked]="bfc()" (change)="bfc.set(!bfc())" /> 父層建立 BFC</label>
        <div class="parent" [class.flow-root]="bfc()"><div class="child">child margin-top: 24px</div></div>
      </div>
      <div>
        <p class="cap">③ 浮動高度塌陷：父層只有 float 子元素時高度為 0 → BFC 包住浮動</p>
        <div class="float-parent" [class.flow-root]="bfc()">
          <div class="float">float</div><div class="float">float</div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
    .cap { font-size: 13px; color: var(--text-muted); margin: 0 0 6px; }
    .wrap { background: var(--surface-2); padding: 1px 8px; border-radius: 6px; }
    .m { background: var(--primary); color: #fff; padding: 4px 8px; font-size: 12px; border-radius: 4px; }
    .m20 { margin-bottom: 20px; } .m30 { margin-top: 30px; }
    .parent { background: var(--surface-2); margin-top: 6px; }
    .child { margin-top: 24px; background: var(--up); color: #fff; padding: 4px 8px; font-size: 12px; }
    .float-parent { border: 2px solid var(--warn); }
    .float { float: left; width: 70px; height: 50px; margin: 4px; background: var(--down); color: #fff; font-size: 12px; text-align: center; }
    .flow-root { display: flow-root; }
  `,
})
export class BfcDemo {
  protected readonly bfc = signal(false);
}

@Component({
  selector: 'app-position-demo',
  template: `
    <div class="row">
      @for (p of positions; track p) {
        <button class="btn" type="button" [class.primary]="pos() === p" (click)="pos.set(p)">{{ p }}</button>
      }
    </div>
    <p class="muted desc">{{ descs[pos()] }}</p>
    <div class="scroller">
      <div class="parent">
        <p>父元素 position: relative（absolute 的定位參考）</p>
        <div class="target" [style.position]="pos()">position: {{ pos() }}<br />top: 20px; left: 40px</div>
        @for (i of filler; track i) {
          <p class="filler">捲動內容 {{ i }}</p>
        }
      </div>
    </div>
  `,
  styles: `
    .desc { font-size: 13px; margin: 6px 0; }
    .scroller { height: 240px; overflow: auto; border: 1px solid var(--border); border-radius: 6px; transform: translateZ(0); }
    .parent { position: relative; margin: 30px; padding: 8px; background: var(--surface-2); border: 1px dashed var(--text-muted); }
    .parent > p { margin: 0 0 6px; font-size: 13px; }
    .target { top: 20px; left: 40px; width: 180px; padding: 6px; background: var(--primary); color: #fff; font-size: 12px; border-radius: 6px; z-index: 1; }
    .filler { margin: 0; padding: 4px 0; font-size: 12px; color: var(--text-muted); }
  `,
})
export class PositionDemo {
  protected readonly positions = ['static', 'relative', 'absolute', 'fixed', 'sticky'] as const;
  protected readonly pos = signal<(typeof this.positions)[number]>('relative');
  protected readonly filler = Array.from({ length: 12 }, (_, i) => i + 1);
  protected readonly descs: Record<string, string> = {
    static: 'static：預設值，top/left 無效，照一般文件流排列。',
    relative: 'relative：相對「自己原本的位置」偏移，原本的空間仍保留。',
    absolute: 'absolute：脫離文件流，相對最近的「非 static 祖先」定位。',
    fixed: 'fixed：相對 viewport 定位；但若祖先有 transform / filter / contain，就會改成相對該祖先（本 demo 的捲動容器有 transform，所以被關在框內）。',
    sticky: 'sticky：在捲動容器內，超過門檻值（top: 20px）前是 relative，之後黏住。往下捲動試試。',
  };
}

@Component({
  selector: 'app-stacking-demo',
  template: `
    <label><input type="checkbox" [checked]="ctx()" (change)="ctx.set(!ctx())" /> 給藍色父層加 <code>opacity: 0.99</code>（建立新的 stacking context）</label>
    <div class="stage">
      <div class="parent-a" [class.ctx]="ctx()">
        父層 A（無 z-index）
        <div class="a-child">A 的子元素 z-index: 999</div>
      </div>
      <div class="b">B z-index: 10</div>
    </div>
    <p class="muted note">勾選後 z-index: 999 也壓不過 B：子元素的 z-index 只在「所屬的 stacking context」內比較，而 A 這個 context 整體的層級是 0（auto）。</p>
  `,
  styles: `
    .stage { position: relative; height: 170px; margin-top: 8px; background: var(--surface-2); border-radius: 6px; }
    .parent-a { position: absolute; top: 14px; left: 14px; width: 220px; height: 130px; padding: 6px; background: color-mix(in srgb, var(--primary) 50%, var(--surface)); font-size: 12px; }
    .parent-a.ctx { opacity: 0.99; }
    .a-child { position: absolute; top: 40px; left: 120px; width: 170px; padding: 8px; background: var(--down); color: #fff; z-index: 999; }
    .b { position: absolute; top: 60px; left: 200px; width: 150px; height: 90px; padding: 8px; background: var(--up); color: #fff; font-size: 12px; z-index: 10; }
    .note { font-size: 13px; }
  `,
})
export class StackingDemo {
  protected readonly ctx = signal(false);
}

/** 特異性計算器：(id, class/attr/pseudo-class, element/pseudo-element) */
export function specificity(selector: string): [number, number, number] {
  let s = selector.replace(/:where\([^)]*\)/g, ''); // :where() 特異性為 0
  // :is() / :not() / :has() 取參數中最高者，這裡簡化：保留參數本身計算
  s = s.replace(/:(is|not|has)\(([^)]*)\)/g, ' $2 ');
  const ids = (s.match(/#[\w-]+/g) ?? []).length;
  const classes = (s.match(/\.[\w-]+|\[[^\]]+\]|(?<!:):(?!:)[\w-]+/g) ?? []).length;
  const elements = (s.replace(/#[\w-]+|\.[\w-]+|\[[^\]]+\]|(?<!:):(?!:)[\w-]+/g, ' ').match(/(^|[\s>+~])[a-zA-Z][\w-]*|::[\w-]+/g) ?? [])
    .length;
  return [ids, classes, elements];
}

@Component({
  selector: 'app-specificity-calc',
  template: `
    <input class="sel" [value]="sel()" (input)="sel.set($any($event.target).value)" />
    <div class="row presets">
      @for (p of presets; track p) {
        <button class="btn" type="button" (click)="sel.set(p)">{{ p }}</button>
      }
    </div>
    <div class="result">
      <span class="pill id">ID {{ spec()[0] }}</span>
      <span class="pill cls">Class/Attr/Pseudo {{ spec()[1] }}</span>
      <span class="pill el">Element {{ spec()[2] }}</span>
      <b>→ ({{ spec().join(', ') }})</b>
    </div>
    <p class="muted note">比較規則：由左到右逐位比較，(1,0,0) &gt; (0,99,99)。inline style &gt; 所有選擇器；!important 最優先。:where() 為 0，:is()/:not()/:has() 取參數中最高者。</p>
  `,
  styles: `
    .sel { width: 100%; font-family: var(--font-mono); font-size: 15px; padding: 8px; }
    .presets { margin: 8px 0; } .presets .btn { font-family: var(--font-mono); font-size: 12px; }
    .result { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .pill { padding: 2px 10px; border-radius: 999px; font-size: 13px; color: #fff; }
    .id { background: var(--down); } .cls { background: var(--primary); } .el { background: var(--up); }
    .note { font-size: 13px; }
  `,
})
export class SpecificityCalc {
  protected readonly sel = signal('#app .menu > li:hover a::before');
  protected readonly presets = ['ul li a', '.nav .item.active', '#main .card', 'input[type="text"]:focus', ':where(.x) .y', 'div:not(.a)'];
  protected readonly spec = computed(() => specificity(this.sel()));
}

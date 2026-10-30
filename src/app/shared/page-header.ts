import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <h1>{{ title() }}</h1>
    <p class="page-intro" [innerHTML]="intro()"></p>
  `,
  styles: `
    h1 {
      margin: 0 0 4px;
      font-size: 24px;
    }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly intro = input('');
}

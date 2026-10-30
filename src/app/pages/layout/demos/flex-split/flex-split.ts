import { Component } from '@angular/core';

@Component({
  selector: 'app-flex-split',
  templateUrl: './flex-split.html',
  styleUrl: './flex-split.scss',
})
export class FlexSplit {
  protected readonly cards = [1, 2, 3, 4, 5];
  protected readonly justify = ['flex-start', 'center', 'space-between', 'space-around', 'space-evenly'];
}

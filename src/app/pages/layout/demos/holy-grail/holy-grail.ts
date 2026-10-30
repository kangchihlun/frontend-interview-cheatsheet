import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-holy-grail',
  templateUrl: './holy-grail.html',
  styleUrl: './holy-grail.scss',
})
export class HolyGrail {
  protected readonly paragraphs = signal<number[]>([]);

  protected add() {
    this.paragraphs.update((list) => [...list, list.length]);
  }

  protected reset() {
    this.paragraphs.set([]);
  }
}

import { Component, signal } from '@angular/core';
import { EncEmulated, EncHost, EncNone, EncShadow } from './encapsulation';

@Component({
  selector: 'app-encapsulation-demo',
  imports: [EncEmulated, EncNone, EncShadow, EncHost],
  templateUrl: './encapsulation-demo.html',
  styleUrl: './encapsulation-demo.scss',
})
export class EncapsulationDemo {
  protected readonly compact = signal(false);
  protected readonly dark = signal(false);
}

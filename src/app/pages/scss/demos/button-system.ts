import { Component } from '@angular/core';

@Component({
  selector: 'app-button-system',
  templateUrl: './button-system.html',
  styleUrl: './button-system.scss',
})
export class ButtonSystem {
  protected readonly variants = ['primary', 'success', 'danger', 'warning'];
  protected readonly sizes = ['sm', 'md', 'lg'];
}

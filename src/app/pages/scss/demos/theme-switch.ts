import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-theme-switch',
  templateUrl: './theme-switch.html',
  styleUrl: './theme-switch.scss',
})
export class ThemeSwitch {
  protected readonly themes = ['ocean', 'forest', 'sunset', 'contrast'] as const;
  protected readonly theme = signal<string>('ocean');
}

import { Component } from '@angular/core';

@Component({
  selector: 'app-centering',
  templateUrl: './centering.html',
  styleUrl: './centering.scss',
})
export class Centering {
  protected readonly methods = [
    { cls: 'flex', name: '1. Flexbox', code: 'display:flex; justify-content:center; align-items:center' },
    { cls: 'grid-place', name: '2. Grid place-items', code: 'display:grid; place-items:center' },
    { cls: 'abs-transform', name: '3. absolute + transform', code: 'top:50%; left:50%; transform:translate(-50%,-50%)' },
    { cls: 'abs-margin', name: '4. absolute + margin:auto', code: 'inset:0; margin:auto; (需固定寬高)' },
    { cls: 'flex-margin', name: '5. flex + margin:auto', code: 'parent display:flex; child margin:auto' },
    { cls: 'inline', name: '6. text-align + line-height', code: 'text-align:center; line-height:容器高' },
  ];
}

import { Routes } from '@angular/router';

export interface NavTab {
  path: string;
  label: string;
  icon: string;
}

/** 頂部頁籤清單（同時也是路由表的來源） */
export const NAV_TABS: NavTab[] = [
  { path: 'layout', label: 'SCSS 排版實戰', icon: '▦' },
  { path: 'scss', label: 'SCSS 語法/架構', icon: '✎' },
  { path: 'css', label: 'CSS/HTML 基礎', icon: '◰' },
  { path: 'angular', label: 'Angular 22', icon: '▲' },
  { path: 'rxjs', label: 'RxJS', icon: '⇶' },
  { path: 'realtime', label: '即時交易資料', icon: '⚡' },
  { path: 'js', label: 'JavaScript/TS', icon: 'JS' },
  { path: 'http', label: 'REST API/HTTP', icon: '⇄' },
  { path: 'testing', label: '單元測試', icon: '✓' },
  { path: 'react', label: 'React 對照', icon: '⚛' },
  { path: 'devops', label: 'Git/Docker/CI/效能', icon: '⚙' },
  { path: 'prep', label: '面試準備', icon: '★' },
];

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'layout' },
  { path: 'layout', title: 'SCSS 排版實戰', loadComponent: () => import('./pages/layout/layout-page') },
  { path: 'scss', title: 'SCSS 語法/架構', loadComponent: () => import('./pages/scss/scss-page') },
  { path: 'css', title: 'CSS/HTML 基礎', loadComponent: () => import('./pages/css/css-page') },
  { path: 'angular', title: 'Angular 22', loadComponent: () => import('./pages/angular/angular-page') },
  { path: 'rxjs', title: 'RxJS', loadComponent: () => import('./pages/rxjs/rxjs-page') },
  { path: 'realtime', title: '即時交易資料', loadComponent: () => import('./pages/realtime/realtime-page') },
  { path: 'js', title: 'JavaScript/TS', loadComponent: () => import('./pages/js/js-page') },
  { path: 'http', title: 'REST API/HTTP', loadComponent: () => import('./pages/http/http-page') },
  { path: 'testing', title: '單元測試', loadComponent: () => import('./pages/testing/testing-page') },
  { path: 'react', title: 'React 對照', loadComponent: () => import('./pages/react/react-page') },
  { path: 'devops', title: 'Git/Docker/CI/效能', loadComponent: () => import('./pages/devops/devops-page') },
  { path: 'prep', title: '面試準備', loadComponent: () => import('./pages/prep/prep-page') },
  { path: '**', redirectTo: 'layout' },
];

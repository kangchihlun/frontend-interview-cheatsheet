import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal } from '@angular/core';

export interface MenuNode {
  id: string;
  label: string;
  icon?: string;
  badge?: number;
  children?: MenuNode[];
}

const MENU: MenuNode[] = [
  { id: 'dash', label: '總覽 Dashboard', icon: '◉' },
  {
    id: 'trade',
    label: '交易管理',
    icon: '⇄',
    children: [
      { id: 'orders', label: '委託單', badge: 3 },
      { id: 'fills', label: '成交紀錄' },
      {
        id: 'risk',
        label: '風控設定',
        children: [
          { id: 'limit', label: '限額規則' },
          { id: 'blacklist', label: '黑名單' },
        ],
      },
    ],
  },
  {
    id: 'users',
    label: '會員中心',
    icon: '☺',
    children: [
      { id: 'list', label: '會員列表' },
      { id: 'kyc', label: 'KYC 審核', badge: 12 },
    ],
  },
  { id: 'report', label: '報表', icon: '▤' },
  { id: 'setting', label: '系統設定', icon: '⚙' },
];

@Component({
  selector: 'app-admin-sidebar',
  imports: [NgTemplateOutlet],
  templateUrl: './admin-sidebar.html',
  styleUrl: './admin-sidebar.scss',
})
export class AdminSidebar {
  protected readonly menu = MENU;
  protected readonly collapsed = signal(false);
  protected readonly mobile = signal(false);
  protected readonly drawerOpen = signal(false);
  protected readonly expanded = signal(new Set<string>(['trade']));
  protected readonly activeId = signal('orders');

  /** 從樹中找出 active 節點的路徑 → 麵包屑 */
  protected readonly breadcrumb = computed(() => findPath(this.menu, this.activeId()) ?? []);

  protected toggleSidebar() {
    if (this.mobile()) this.drawerOpen.update((v) => !v);
    else this.collapsed.update((v) => !v);
  }

  protected toggle(node: MenuNode) {
    if (node.children?.length) {
      // signal 內放 Set 時要建立新實例，否則參考不變不會觸發更新
      this.expanded.update((set) => {
        const next = new Set(set);
        next.has(node.id) ? next.delete(node.id) : next.add(node.id);
        return next;
      });
    } else {
      this.activeId.set(node.id);
      this.drawerOpen.set(false);
    }
  }

  protected isInActivePath(node: MenuNode) {
    return this.breadcrumb().some((n) => n.id === node.id);
  }
}

function findPath(nodes: MenuNode[], id: string): MenuNode[] | null {
  for (const node of nodes) {
    if (node.id === id) return [node];
    const sub = node.children && findPath(node.children, id);
    if (sub) return [node, ...sub];
  }
  return null;
}

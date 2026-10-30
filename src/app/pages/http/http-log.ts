import { Service, signal } from '@angular/core';

export interface LogEntry {
  id: number;
  method: string;
  url: string;
  status: number | string;
  ms: number;
  auth: boolean;
  note?: string;
}

/** 攔截器寫入、畫面讀取的請求紀錄 + 模擬登入 token */
@Service()
export class HttpLog {
  readonly entries = signal<LogEntry[]>([]);
  readonly token = signal<string | null>(null);
  private seq = 0;

  add(e: Omit<LogEntry, 'id'>) {
    this.entries.update((list) => [{ ...e, id: ++this.seq }, ...list].slice(0, 30));
  }

  clear() {
    this.entries.set([]);
  }
}

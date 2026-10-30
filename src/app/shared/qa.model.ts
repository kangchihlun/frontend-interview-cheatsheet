/** 一題面試題。`a` 為 HTML 字串（可用 <code>、<b>、<ul>），`code` 為範例程式碼。 */
export interface QaItem {
  q: string;
  a: string;
  code?: string;
  /** 1 = 基礎必考, 2 = 進階, 3 = 資深加分 */
  level?: 1 | 2 | 3;
}

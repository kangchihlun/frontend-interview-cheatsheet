import { QaItem } from '../../shared/qa.model';

export const COMPARE_ROWS: [string, string, string][] = [
  ['本質', '完整框架（路由、表單、HTTP、DI、測試都內建）', 'UI 函式庫，生態系自選（Router、Redux/Zustand、React Query）'],
  ['模板', 'HTML 模板 + <code>@if</code>/<code>@for</code> 控制流程', 'JSX：JavaScript 表達式（<code>&amp;&amp;</code>、三元、<code>.map()</code>）'],
  ['狀態', '<code>signal()</code>', '<code>useState()</code> / <code>useReducer()</code>'],
  ['衍生值', '<code>computed()</code>（自動追蹤依賴）', '直接在 render 計算 / <code>useMemo(fn, deps)</code>（手動 deps）；React Compiler 可自動 memo'],
  ['副作用', '<code>effect()</code>', '<code>useEffect(fn, deps)</code>，回傳 cleanup'],
  ['父 → 子', '<code>input()</code>', 'props'],
  ['子 → 父', '<code>output()</code>', '傳 callback props（<code>onChange</code>）'],
  ['雙向綁定', '<code>model()</code> + <code>[(value)]</code>', '受控元件：<code>value</code> + <code>onChange</code>'],
  ['DOM 參照', '<code>viewChild()</code>', '<code>useRef()</code>'],
  ['跨層共享', 'DI（service）', 'Context（<code>createContext</code> + <code>useContext</code>）'],
  ['全域狀態', 'NgRx Store / SignalStore / service + signal', 'Redux Toolkit / Zustand / Jotai'],
  ['非同步資料', '<code>httpResource</code> / <code>resource</code> / RxJS', 'TanStack Query / SWR / <code>use()</code> + Suspense'],
  ['更新機制', '細粒度：signal 改變只更新讀到它的綁定', '狀態改變 → 重新執行元件函式 → Virtual DOM diff'],
  ['樣式', 'SCSS + ViewEncapsulation（預設隔離）', 'CSS Modules / styled-components / Tailwind'],
  ['列表 key', '<code>@for (x of list; track x.id)</code>', '<code>list.map(x =&gt; &lt;Row key={x.id} /&gt;)</code>'],
  ['延遲載入', '<code>loadComponent</code> / <code>@defer</code>', '<code>React.lazy</code> + <code>Suspense</code>'],
  ['SSR 框架', 'Angular SSR（內建）', 'Next.js（App Router、RSC）'],
  ['表單', 'Reactive / Signal Forms（內建驗證）', 'React Hook Form + Zod'],
  ['測試', 'Vitest + TestBed', 'Vitest/Jest + React Testing Library'],
];

export const SIDE_BY_SIDE = [
  {
    title: '計數器 + 衍生值 + 副作用',
    angular: `@Component({
  selector: 'app-counter',
  template: \`
    <button (click)="count.update(c => c + 1)">+</button>
    <p>{{ count() }} × 2 = {{ double() }}</p>
  \`,
})
export class Counter {
  count = signal(0);
  double = computed(() => this.count() * 2);
  constructor() {
    effect(() => document.title = \`count: \${this.count()}\`);
  }
}`,
    react: `export function Counter() {
  const [count, setCount] = useState(0);
  const double = count * 2; // 每次 render 重算；昂貴時用 useMemo

  useEffect(() => {
    document.title = \`count: \${count}\`;
  }, [count]); // 依賴要手動列出

  return (
    <>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <p>{count} × 2 = {double}</p>
    </>
  );
}`,
  },
  {
    title: '列表 + 條件渲染 + 事件往上傳',
    angular: `@Component({
  selector: 'app-watchlist',
  template: \`
    @for (t of tickers(); track t.symbol) {
      <div (click)="pick.emit(t.symbol)" [class.up]="t.change > 0">
        {{ t.symbol }} {{ t.price }}
        @if (t.change > 5) { <span>🔥</span> }
      </div>
    } @empty {
      <p>沒有資料</p>
    }
  \`,
})
export class Watchlist {
  tickers = input.required<Ticker[]>();
  pick = output<string>();
}`,
    react: `type Props = { tickers: Ticker[]; onPick: (s: string) => void };

export function Watchlist({ tickers, onPick }: Props) {
  if (tickers.length === 0) return <p>沒有資料</p>;
  return (
    <>
      {tickers.map(t => (
        <div key={t.symbol} onClick={() => onPick(t.symbol)}
             className={t.change > 0 ? 'up' : undefined}>
          {t.symbol} {t.price}
          {t.change > 5 && <span>🔥</span>}
        </div>
      ))}
    </>
  );
}`,
  },
  {
    title: '訂閱 WebSocket 行情（記得清理）',
    angular: `export class Ticker {
  private md = inject(MarketDataService);
  symbol = input.required<string>();

  // switchMap：symbol 變了自動退訂舊的
  price = toSignal(
    toObservable(this.symbol).pipe(
      switchMap(s => this.md.ticker$(s)),
      auditTime(100),
      map(t => t.price),
    ),
  );
}`,
    react: `export function useTicker(symbol: string) {
  const [price, setPrice] = useState<number>();

  useEffect(() => {
    const ws = new WebSocket(URL);
    ws.onopen = () => ws.send(JSON.stringify({ op: 'sub', symbol }));
    ws.onmessage = e => setPrice(JSON.parse(e.data).price);
    return () => ws.close(); // cleanup：symbol 改變或 unmount
  }, [symbol]);

  return price;
}`,
  },
  {
    title: '全域狀態：NgRx SignalStore vs Redux Toolkit',
    angular: `export const CartStore = signalStore(
  { providedIn: 'root' },
  withState({ items: [] as Item[] }),
  withComputed(({ items }) => ({
    total: computed(() => items().reduce((s, i) => s + i.price, 0)),
  })),
  withMethods(store => ({
    add(item: Item) { patchState(store, s => ({ items: [...s.items, item] })); },
  })),
);
// 元件：store = inject(CartStore); store.total()`,
    react: `const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] as Item[] },
  reducers: {
    add(state, action: PayloadAction<Item>) {
      state.items.push(action.payload); // Immer 讓你「看起來」可變
    },
  },
});
export const store = configureStore({ reducer: { cart: cartSlice.reducer } });
// 元件：const total = useSelector(selectTotal); dispatch(add(item))`,
  },
];

export const REACT_QA: QaItem[] = [
  {
    q: 'React 的 render 流程？什麼會觸發重新渲染？',
    a: `state 改變（<code>setState</code>）、父元件重新渲染、Context 值改變 → 重新執行元件函式 → 產生新的 Virtual DOM → reconciliation（diff）→ commit 到真實 DOM。父元件 render 時子元件預設也會 render（即使 props 沒變），可用 <code>React.memo</code> 避免。`,
    level: 1,
  },
  {
    q: 'useEffect 的依賴陣列？常見陷阱？',
    a: `<code>[]</code> 只在 mount 執行；<code>[a, b]</code> 在 a 或 b 改變時執行；不傳每次 render 都執行。回傳函式為 cleanup（下次執行前與 unmount 時呼叫）。
      陷阱：漏寫依賴導致 stale closure（讀到舊值）、物件/函式依賴每次都是新參考造成無限迴圈、在 effect 中做可以在 render 時計算的事。React 18+ StrictMode 開發模式會刻意執行兩次 effect 以檢查 cleanup。`,
    level: 1,
  },
  {
    q: 'useMemo、useCallback、React.memo 差別？',
    a: `<code>useMemo</code> 快取計算結果；<code>useCallback</code> 快取函式參考；<code>React.memo</code> 讓元件在 props 淺比較相同時跳過 render。三者常搭配使用（傳給 memo 子元件的 callback 要 useCallback）。React 19 的 React Compiler 可自動做 memo，減少手寫。`,
    level: 2,
  },
  {
    q: '為什麼列表需要 key？為什麼不要用 index？',
    a: `key 讓 React 辨識哪個元素對應哪筆資料。用 index 時，插入/刪除/排序會讓狀態（輸入框值、焦點）錯位，也會造成不必要的重建。跟 Angular <code>@for track</code> 是同一個觀念。`,
    level: 1,
  },
  {
    q: '受控元件與非受控元件？',
    a: `受控：值存在 state，<code>value</code> + <code>onChange</code>，React 是唯一資料來源。非受控：值存在 DOM，用 <code>ref</code> 讀取（<code>defaultValue</code>），React Hook Form 主要用此方式以減少 render。`,
    level: 1,
  },
  {
    q: 'Redux 的核心概念？Redux Toolkit 改善了什麼？',
    a: `單一 store、state 唯讀、透過 dispatch action、reducer 是純函式產生新 state；selector 讀取。RTK：<code>createSlice</code> 自動產生 action、內建 Immer（可「直接修改」草稿）、<code>configureStore</code> 預設 DevTools 與 thunk、RTK Query 處理 API 快取。`,
    level: 1,
  },
  {
    q: 'Custom Hook 是什麼？規則？',
    a: `以 <code>use</code> 開頭、內部使用其他 hooks 的函式，用來重用有狀態的邏輯（如 <code>useTicker</code>、<code>useDebounce</code>）。Hooks 規則：只能在元件或 custom hook 頂層呼叫，不能放在條件、迴圈、巢狀函式中（React 依呼叫順序對應 state）。`,
    level: 1,
  },
  {
    q: 'Next.js App Router、Server Components、SSR/SSG/ISR？',
    a: `<ul>
      <li>App Router：<code>app/</code> 資料夾即路由，<code>layout.tsx</code> 巢狀版面、<code>loading.tsx</code>、<code>error.tsx</code>。</li>
      <li>React Server Components：預設在伺服器執行、不送 JS 到瀏覽器，可直接存取資料；需要互動時加 <code>'use client'</code>。</li>
      <li>SSR：每次請求渲染；SSG：build 時產生；ISR：靜態頁定期重新產生（<code>revalidate</code>）。</li>
      <li>Server Actions：表單直接呼叫伺服器函式。</li>
    </ul>`,
    level: 2,
  },
  {
    q: 'React 19 有哪些新功能？',
    a: `Actions（<code>useActionState</code>、<code>useFormStatus</code>、<code>useOptimistic</code>）、<code>use()</code> 讀取 Promise/Context、ref 可以直接當 prop 傳（不用 forwardRef）、文件 metadata（<code>&lt;title&gt;</code> 可寫在元件中）、React Compiler（自動 memo）。`,
    level: 3,
  },
  {
    q: '你會怎麼比較 Angular 與 React？什麼專案適合哪個？',
    a: `Angular：完整、有規範、DI、TypeScript first、適合大型企業/多人長期維護的系統（如交易後台），學習曲線較陡。React：彈性、生態廣、人才多、適合需要快速迭代或高度客製的產品，但需要團隊自訂規範與選型。
      加分回答：Angular signals 是細粒度更新，不需要手動 memo 與依賴陣列；React 心智模型簡單（UI = f(state)），JSX 就是 JavaScript。`,
    level: 1,
  },
];

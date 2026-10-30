// 讓 TS 認得 `import x from './a.scss' with { loader: 'text' }` 這類原始碼匯入（用來在畫面上展示 demo 的原始碼）
declare module '*.scss' {
  const content: string;
  export default content;
}
declare module '*.html' {
  const content: string;
  export default content;
}
declare module '*.ts?raw' {
  const content: string;
  export default content;
}

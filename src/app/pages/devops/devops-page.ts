import { Component, signal } from '@angular/core';
import { CodeBlock } from '../../shared/code-block';
import { DemoCard } from '../../shared/demo-card';
import { PageHeader } from '../../shared/page-header';
import { QaList } from '../../shared/qa-list';
import { SubTabs, TabDef } from '../../shared/sub-tabs';
import { DEVOPS_QA, GIT_CHEATSHEET, GIT_QA, NODE_REDIS_QA, PERF_QA } from './devops.qa';

// 專案根目錄中實際存在、CI 實際使用的檔案
// @ts-ignore
import dockerfile from '../../../../Dockerfile' with { loader: 'text' };
// @ts-ignore
import nginxConf from '../../../../nginx.conf' with { loader: 'text' };
// @ts-ignore
import ciYml from '../../../../.github/workflows/ci.yml' with { loader: 'text' };

@Component({
  selector: 'app-devops-page',
  imports: [PageHeader, SubTabs, DemoCard, QaList, CodeBlock],
  template: `
    <app-page-header title="Git / Docker / CI/CD / Node / Redis / 效能" intro="職缺要求 Git；Nice to have：Docker、CI/CD、Node.js、Redis。下方 Dockerfile、nginx.conf、ci.yml 都是這個專案根目錄的真實檔案。" />
    <app-sub-tabs [tabs]="tabs" [(active)]="active" />
    @switch (active()) {
      @case ('git') {
        <app-demo title="Git 常用指令速查"><app-code [code]="gitSheet" lang="bash" /></app-demo>
        <app-qa-list heading="Git 面試題" [items]="gitQa" />
      }
      @case ('docker') {
        <app-demo title="Dockerfile（multi-stage）" desc="<code>docker build -t cheatsheet . &amp;&amp; docker run -p 8080:80 cheatsheet</code>">
          <app-code [code]="dockerfile" lang="Dockerfile" />
        </app-demo>
        <app-demo title="nginx.conf（SPA fallback + 快取 + 反向代理 WebSocket）"><app-code [code]="nginxConf" lang="nginx" /></app-demo>
        <app-demo title=".github/workflows/ci.yml（GitHub Actions）"><app-code [code]="ciYml" lang="yaml" /></app-demo>
        <app-qa-list heading="Docker / CI/CD 面試題" [items]="devopsQa" />
      }
      @case ('node') {
        <app-qa-list heading="Node.js / Redis 面試題" [items]="nodeQa" />
      }
      @default {
        <app-qa-list heading="前端效能面試題" [items]="perfQa" />
      }
    }
  `,
})
export default class DevopsPage {
  protected readonly tabs: TabDef[] = [
    { id: 'git', label: 'Git' },
    { id: 'docker', label: 'Docker / CI/CD' },
    { id: 'node', label: 'Node.js / Redis' },
    { id: 'perf', label: '效能優化' },
  ];
  protected readonly active = signal('git');
  protected readonly gitSheet = GIT_CHEATSHEET;
  protected readonly gitQa = GIT_QA;
  protected readonly devopsQa = DEVOPS_QA;
  protected readonly nodeQa = NODE_REDIS_QA;
  protected readonly perfQa = PERF_QA;
  protected readonly dockerfile = dockerfile;
  protected readonly nginxConf = nginxConf;
  protected readonly ciYml = ciYml;
}

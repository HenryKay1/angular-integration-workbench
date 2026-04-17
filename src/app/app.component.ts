import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'aiw-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <main class="shell">
      <header class="shell__header">
        <div>
          <h1>Angular Integration Workbench</h1>
          <p>Enterprise-flavored mock integration explorer</p>
        </div>

        <nav class="shell__nav">
          <a routerLink="/" routerLinkActive="shell__link--active" [routerLinkActiveOptions]="{ exact: true }">Dashboard</a>
          <a routerLink="/forms" routerLinkActive="shell__link--active">Forms</a>
          <a routerLink="/records" routerLinkActive="shell__link--active">Records</a>
        </nav>
      </header>

      <section class="shell__content">
        <router-outlet />
      </section>
    </main>
  `,
  styles: [`
    .shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .shell__header {
      padding: 1rem 1.5rem;
      background: #0f172a;
      color: #f8fafc;
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 1rem;
    }

    .shell__header h1,
    .shell__header p {
      margin: 0;
    }

    .shell__header p {
      margin-top: 0.35rem;
      color: #cbd5e1;
    }

    .shell__nav {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .shell__nav a {
      color: #cbd5e1;
      text-decoration: none;
      padding-bottom: 0.2rem;
      border-bottom: 2px solid transparent;
    }

    .shell__link--active {
      color: #ffffff !important;
      border-bottom-color: #ffffff !important;
    }

    .shell__content {
      padding: 1.5rem;
    }
  `]
})
export class AppComponent {}

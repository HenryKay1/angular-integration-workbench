import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'aiw-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <main class="shell">
      <header class="shell__header">
        <h1>Angular Integration Workbench</h1>
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
    }

    .shell__content {
      padding: 1.5rem;
    }
  `]
})
export class AppComponent {}

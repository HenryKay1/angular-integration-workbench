import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RecordService } from '../../../core/services/record.service';

@Component({
  selector: 'aiw-record-list-page',
  standalone: true,
  imports: [AsyncPipe, DatePipe, NgFor, NgIf, RouterLink],
  template: `
    <section class="records-page">
      <h2>Records</h2>

      <p class="records-page__intro">
        Mock-backed integration records loaded through the shared record service.
      </p>

      <ng-container *ngIf="records$ | async as records">
        <p *ngIf="records.length === 0" class="records-page__empty">
          No records are available.
        </p>

        <div *ngIf="records.length > 0" class="record-grid">
          <a
            *ngFor="let record of records"
            class="record-card"
            [routerLink]="['/records', record.id]"
          >
            <div class="record-card__meta">
              <span class="record-card__status">{{ record.status }}</span>
              <span>{{ record.category }}</span>
            </div>

            <h3>{{ record.title }}</h3>
            <p>{{ record.summary }}</p>

            <dl class="record-card__details">
              <div>
                <dt>Owner</dt>
                <dd>{{ record.owner }}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{{ record.updatedAt | date: 'medium' }}</dd>
              </div>
            </dl>
          </a>
        </div>
      </ng-container>
    </section>
  `,
  styles: [`
    .records-page {
      display: grid;
      gap: 1rem;
    }

    .records-page__intro,
    .records-page__empty {
      margin: 0;
      color: #52606d;
    }

    .record-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }

    .record-card {
      display: grid;
      gap: 0.9rem;
      padding: 1.25rem;
      border: 1px solid #d9e2ec;
      border-radius: 0.75rem;
      background: #ffffff;
      color: inherit;
      text-decoration: none;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
    }

    .record-card:hover {
      border-color: #486581;
      transform: translateY(-1px);
    }

    .record-card__meta {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      font-size: 0.875rem;
      color: #52606d;
    }

    .record-card__status {
      font-weight: 700;
      color: #0f172a;
    }

    .record-card h3,
    .record-card p {
      margin: 0;
    }

    .record-card__details {
      display: grid;
      gap: 0.75rem;
      margin: 0;
    }

    .record-card__details div {
      display: grid;
      gap: 0.2rem;
    }

    .record-card__details dt {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #7b8794;
    }

    .record-card__details dd {
      margin: 0;
      color: #1f2933;
    }
  `]
})
export class RecordListPageComponent {
  protected readonly records$ = inject(RecordService).getRecords();
}

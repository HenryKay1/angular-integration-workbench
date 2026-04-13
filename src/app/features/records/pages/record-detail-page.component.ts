import { AsyncPipe, DatePipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { combineLatest, map, switchMap } from 'rxjs';
import { RecordService } from '../../../core/services/record.service';

@Component({
  selector: 'aiw-record-detail-page',
  standalone: true,
  imports: [AsyncPipe, DatePipe, JsonPipe, NgFor, NgIf, RouterLink],
  template: `
    <ng-container *ngIf="viewModel$ | async as viewModel">
      <section *ngIf="viewModel.record; else notFound" class="record-detail">
        <a class="record-detail__back" routerLink="/records">Back to records</a>

        <header class="record-detail__header">
          <div>
            <p class="record-detail__eyebrow">{{ viewModel.record.category }}</p>
            <h2>{{ viewModel.record.title }}</h2>
            <p>{{ viewModel.record.summary }}</p>
          </div>

          <div class="record-detail__status">{{ viewModel.record.status }}</div>
        </header>

        <section class="record-detail__grid">
          <article class="record-panel">
            <h3>Overview</h3>
            <dl class="record-overview">
              <div>
                <dt>Owner</dt>
                <dd>{{ viewModel.record.owner }}</dd>
              </div>
              <div>
                <dt>Created</dt>
                <dd>{{ viewModel.record.createdAt | date: 'medium' }}</dd>
              </div>
              <div>
                <dt>Updated</dt>
                <dd>{{ viewModel.record.updatedAt | date: 'medium' }}</dd>
              </div>
            </dl>
          </article>

          <article class="record-panel">
            <h3>Current Payload</h3>
            <pre>{{ viewModel.record.currentPayload | json }}</pre>
          </article>
        </section>

        <section class="record-panel">
          <div class="record-detail__history-header">
            <h3>History</h3>
            <span>{{ viewModel.history.length }} event(s)</span>
          </div>

          <p *ngIf="viewModel.history.length === 0" class="record-detail__empty">
            No history entries are available for this record.
          </p>

          <div *ngIf="viewModel.history.length > 0" class="history-list">
            <a
              *ngFor="let entry of viewModel.history"
              class="history-entry"
              [routerLink]="['/records', viewModel.record.id, 'history', entry.id]"
            >
              <div>
                <strong>{{ entry.eventType }}</strong>
                <p>{{ entry.notes || 'No additional notes provided.' }}</p>
              </div>
              <div class="history-entry__meta">
                <span>{{ entry.changedBy }}</span>
                <span>{{ entry.changedAt | date: 'medium' }}</span>
              </div>
            </a>
          </div>
        </section>
      </section>
    </ng-container>

    <ng-template #notFound>
      <section class="record-detail">
        <a class="record-detail__back" routerLink="/records">Back to records</a>
        <div class="record-panel">
          <h2>Record not found</h2>
          <p>The requested record id did not match any mock-backed record.</p>
        </div>
      </section>
    </ng-template>
  `,
  styles: [`
    .record-detail {
      display: grid;
      gap: 1rem;
    }

    .record-detail__back {
      width: fit-content;
      color: #0f172a;
      text-decoration: none;
      font-weight: 600;
    }

    .record-detail__header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: start;
      padding: 1.25rem;
      border-radius: 0.75rem;
      background: #ffffff;
      border: 1px solid #d9e2ec;
    }

    .record-detail__header h2,
    .record-detail__header p,
    .record-detail__history-header h3 {
      margin: 0;
    }

    .record-detail__eyebrow {
      margin-bottom: 0.5rem;
      color: #52606d;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 0.8rem;
    }

    .record-detail__status {
      padding: 0.45rem 0.75rem;
      border-radius: 999px;
      background: #d9e2ec;
      font-weight: 700;
      color: #102a43;
    }

    .record-detail__grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    }

    .record-panel {
      display: grid;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 0.75rem;
      background: #ffffff;
      border: 1px solid #d9e2ec;
    }

    .record-panel h3 {
      margin: 0;
    }

    .record-overview {
      display: grid;
      gap: 0.9rem;
      margin: 0;
    }

    .record-overview div {
      display: grid;
      gap: 0.25rem;
    }

    .record-overview dt {
      color: #7b8794;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .record-overview dd {
      margin: 0;
    }

    pre {
      margin: 0;
      padding: 1rem;
      overflow: auto;
      border-radius: 0.75rem;
      background: #102a43;
      color: #f0f4f8;
      font-size: 0.875rem;
    }

    .record-detail__history-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: center;
    }

    .record-detail__empty {
      margin: 0;
      color: #52606d;
    }

    .history-list {
      display: grid;
      gap: 0.75rem;
    }

    .history-entry {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem;
      border-radius: 0.75rem;
      background: #f8fafc;
      color: inherit;
      text-decoration: none;
      border: 1px solid #d9e2ec;
    }

    .history-entry p {
      margin: 0.35rem 0 0;
      color: #52606d;
    }

    .history-entry__meta {
      display: grid;
      gap: 0.25rem;
      min-width: 12rem;
      text-align: right;
      color: #52606d;
      font-size: 0.9rem;
    }
  `]
})
export class RecordDetailPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly recordService = inject(RecordService);

  protected readonly viewModel$ = this.route.paramMap.pipe(
    map((params) => params.get('id') ?? ''),
    switchMap((id) =>
      combineLatest({
        record: this.recordService.getRecordById(id),
        history: this.recordService.getRecordHistory(id)
      })
    )
  );
}

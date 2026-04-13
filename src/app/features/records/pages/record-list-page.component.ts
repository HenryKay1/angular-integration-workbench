import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map, startWith } from 'rxjs';
import { RecordItem } from '../../../core/models/record.model';
import { RecordService } from '../../../core/services/record.service';
import {
  DataViewCardConfig,
  DataViewColumn,
  DataViewComponent
} from '../../../shared/components/data-view/data-view.component';

@Component({
  selector: 'aiw-record-list-page',
  standalone: true,
  imports: [AsyncPipe, JsonPipe, NgIf, DataViewComponent],
  template: `
    <section class="records-page" *ngIf="viewModel$ | async as viewModel">
      <div class="records-page__header">
        <div>
          <h2>Records</h2>
          <p class="records-page__intro">
            Mock-backed integration records loaded through the shared record service.
          </p>
        </div>

        <p class="records-page__count" *ngIf="!viewModel.isLoading">
          {{ viewModel.records.length }} total record(s)
        </p>
      </div>

      <aiw-data-view
        [items]="viewModel.records"
        [columns]="columns"
        [cardConfig]="cardConfig"
        [searchFields]="searchFields"
        [itemLink]="recordLink"
        [isLoading]="viewModel.isLoading"
        [detailTemplate]="recordDetailTemplate"
        initialSortColumn="Updated"
        initialSortDirection="desc"
        searchPlaceholder="Search by title, owner, category, or status"
        emptyMessage="No records are available."
        noResultsMessage="No records match the current search."
      />

      <ng-template #recordDetailTemplate let-record let-mode="mode">
        <section class="record-preview">
          <div class="record-preview__header">
            <div>
              <p class="record-preview__eyebrow">{{ mode === 'grid' ? 'Quick preview' : 'Inline detail' }}</p>
              <h4>{{ record.title }}</h4>
            </div>
            <span class="record-preview__status">{{ record.status }}</span>
          </div>

          <p class="record-preview__summary">{{ record.summary }}</p>

          <dl class="record-preview__meta">
            <div>
              <dt>Owner</dt>
              <dd>{{ record.owner }}</dd>
            </div>
            <div>
              <dt>Category</dt>
              <dd>{{ record.category }}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{{ formatDate(record.createdAt) }}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{{ formatDate(record.updatedAt) }}</dd>
            </div>
          </dl>

          <div class="record-preview__payload">
            <h5>Current payload</h5>
            <pre>{{ record.currentPayload | json }}</pre>
          </div>
        </section>
      </ng-template>
    </section>
  `,
  styles: [`
    .records-page {
      display: grid;
      gap: 1rem;
    }

    .records-page__header {
      display: flex;
      justify-content: space-between;
      align-items: end;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .records-page__header h2,
    .records-page__intro,
    .records-page__count {
      margin: 0;
    }

    .records-page__intro,
    .records-page__count {
      color: #52606d;
    }

    .record-preview {
      display: grid;
      gap: 1rem;
    }

    .record-preview__header {
      display: flex;
      justify-content: space-between;
      align-items: start;
      gap: 1rem;
    }

    .record-preview__header h4,
    .record-preview__summary,
    .record-preview__payload h5 {
      margin: 0;
    }

    .record-preview__eyebrow {
      margin: 0 0 0.4rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #7b8794;
    }

    .record-preview__status {
      padding: 0.4rem 0.75rem;
      border-radius: 999px;
      background: #d9e2ec;
      color: #102a43;
      font-weight: 700;
    }

    .record-preview__summary {
      color: #52606d;
    }

    .record-preview__meta {
      display: grid;
      gap: 0.9rem;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      margin: 0;
    }

    .record-preview__meta div {
      display: grid;
      gap: 0.2rem;
    }

    .record-preview__meta dt {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #7b8794;
    }

    .record-preview__meta dd {
      margin: 0;
      color: #1f2933;
    }

    .record-preview__payload {
      display: grid;
      gap: 0.6rem;
    }

    .record-preview__payload pre {
      margin: 0;
      padding: 1rem;
      overflow: auto;
      border-radius: 0.75rem;
      background: #102a43;
      color: #f0f4f8;
      font-size: 0.85rem;
    }
  `]
})
export class RecordListPageComponent {
  private readonly recordService = inject(RecordService);

  protected readonly viewModel$ = this.recordService.listRecords().pipe(
    map((records) => ({ records, isLoading: false })),
    startWith({ records: [] as RecordItem[], isLoading: true })
  );

  protected readonly columns: DataViewColumn<RecordItem>[] = [
    {
      header: 'Title',
      value: (record) => record.title,
      sortable: true
    },
    {
      header: 'Status',
      value: (record) => record.status,
      sortable: true
    },
    {
      header: 'Owner',
      value: (record) => record.owner,
      sortable: true
    },
    {
      header: 'Category',
      value: (record) => record.category,
      sortable: true
    },
    {
      header: 'Updated',
      value: (record) => this.formatDate(record.updatedAt),
      sortValue: (record) => new Date(record.updatedAt).getTime(),
      sortable: true
    }
  ];

  protected readonly cardConfig: DataViewCardConfig<RecordItem> = {
    eyebrow: (record) => `${record.status} · ${record.category}`,
    title: (record) => record.title,
    description: (record) => record.summary,
    fields: [
      { label: 'Owner', value: (record) => record.owner },
      { label: 'Updated', value: (record) => this.formatDate(record.updatedAt) }
    ]
  };

  protected readonly searchFields = [
    (record: RecordItem) => record.title,
    (record: RecordItem) => record.owner,
    (record: RecordItem) => record.category,
    (record: RecordItem) => record.status
  ];

  protected readonly recordLink = (record: RecordItem): string[] => [
    '/records',
    record.id
  ];

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }
}

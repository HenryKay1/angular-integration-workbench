import { AsyncPipe, NgIf } from '@angular/common';
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
  imports: [AsyncPipe, NgIf, DataViewComponent],
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
        searchPlaceholder="Search by title, owner, category, or status"
        emptyMessage="No records are available."
        noResultsMessage="No records match the current search."
      />
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
  `]
})
export class RecordListPageComponent {
  private readonly recordService = inject(RecordService);

  protected readonly viewModel$ = this.recordService.listRecords().pipe(
    map((records) => ({ records, isLoading: false })),
    startWith({ records: [] as RecordItem[], isLoading: true })
  );

  protected readonly columns: DataViewColumn<RecordItem>[] = [
    { header: 'Title', value: (record) => record.title },
    { header: 'Status', value: (record) => record.status },
    { header: 'Owner', value: (record) => record.owner },
    { header: 'Category', value: (record) => record.category },
    { header: 'Updated', value: (record) => this.formatDate(record.updatedAt) }
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

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }
}

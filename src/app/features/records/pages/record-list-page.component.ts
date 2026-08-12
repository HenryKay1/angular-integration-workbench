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
  templateUrl: './record-list-page.component.html',
  styleUrl: './record-list-page.component.css'
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

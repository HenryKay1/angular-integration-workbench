import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { map, startWith } from 'rxjs';
import { RecordItem } from '../../../core/models/record.model';
import { RecordService } from '../../../core/services/record.service';
import { DataViewComponent } from '../../../shared/components/data-view/data-view.component';
import {
  DataViewCardConfig,
  DataViewColumn,
  DataViewPaginationConfig
} from '../../../shared/components/data-view/data-view.models';

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
      key: 'title',
      header: 'Title',
      value: (record) => record.title,
      sortable: true,
      searchable: true,
      serverField: 'title',
      filter: {
        valueType: 'string',
        controlType: 'input'
      }
    },
    {
      key: 'status',
      header: 'Status',
      value: (record) => record.status,
      sortable: true,
      searchable: true,
      serverField: 'status',
      filter: {
        valueType: 'string',
        controlType: 'select',
        dropdownType: 'single',
        options: [
          { label: 'Active', value: 'Active' },
          { label: 'Draft', value: 'Draft' },
          { label: 'Archived', value: 'Archived' }
        ]
      }
    },
    {
      key: 'owner',
      header: 'Owner',
      value: (record) => record.owner,
      sortable: true,
      searchable: true,
      serverField: 'owner',
      filter: {
        valueType: 'string',
        controlType: 'input'
      }
    },
    {
      key: 'category',
      header: 'Category',
      value: (record) => record.category,
      sortable: true,
      searchable: true,
      serverField: 'category',
      filter: {
        valueType: 'string',
        controlType: 'input'
      }
    },
    {
      key: 'updated',
      header: 'Updated',
      value: (record) => new Date(record.updatedAt),
      sortable: true,
      serverField: 'updatedAt',
      filter: {
        valueType: 'date',
        controlType: 'input'
      }
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

  protected readonly pagination: DataViewPaginationConfig = {
    enabled: true,
    defaultPageSize: 5,
    fastStep: 5
  };

  protected formatDate(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  }
}

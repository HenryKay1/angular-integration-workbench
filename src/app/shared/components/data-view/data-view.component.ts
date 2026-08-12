import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export type DataViewMode = 'grid' | 'table';

export interface DataViewColumn<T> {
  header: string;
  value: (item: T) => string;
  sortValue?: (item: T) => string | number;
  sortable?: boolean;
}

export interface DataViewCardField<T> {
  label: string;
  value: (item: T) => string;
}

export interface DataViewCardConfig<T> {
  eyebrow?: (item: T) => string;
  title: (item: T) => string;
  description?: (item: T) => string;
  fields?: DataViewCardField<T>[];
}

export interface DataViewDetailContext<T> {
  $implicit: T;
  item: T;
  mode: DataViewMode;
}

@Component({
  selector: 'aiw-data-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-view.component.html',
  styleUrl: './data-view.component.css'
})
export class DataViewComponent<T> {
  private readonly router = inject(Router);

  @Input({ required: true }) items: T[] = [];
  @Input({ required: true }) columns: DataViewColumn<T>[] = [];
  @Input({ required: true }) cardConfig!: DataViewCardConfig<T>;
  @Input() searchFields: Array<(item: T) => unknown> = [];
  @Input() searchPlaceholder = 'Search items';
  @Input() emptyMessage = 'No items are available.';
  @Input() noResultsMessage = 'No items match the current search.';
  @Input() loadingMessage = 'Loading items...';
  @Input() isLoading = false;
  @Input() availableViewModes: DataViewMode[] = ['grid', 'table'];
  @Input() initialViewMode: DataViewMode = 'grid';
  @Input() itemLink?: (item: T) => string[];
  @Input() initialSortColumn?: string;
  @Input() initialSortDirection: 'asc' | 'desc' = 'asc';
  @Input() detailTemplate?: TemplateRef<DataViewDetailContext<T>>;

  @Output() itemActivated = new EventEmitter<T>();

  protected searchTerm = '';
  protected selectedViewMode: DataViewMode = this.initialViewMode;
  protected activeSortColumn?: string;
  protected activeSortDirection: 'asc' | 'desc' = this.initialSortDirection;
  protected expandedItem?: T;
  protected detailModalItem?: T;

  protected get processedItems(): T[] {
    return this.sortItems(this.filteredItems);
  }

  protected get filteredItems(): T[] {
    const normalizedTerm = this.searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return this.items;
    }

    return this.items.filter((item) =>
      this.searchFields.some((field) =>
        String(field(item) ?? '').toLowerCase().includes(normalizedTerm)
      )
    );
  }

  ngOnChanges(): void {
    if (!this.availableViewModes.includes(this.selectedViewMode)) {
      this.selectedViewMode = this.availableViewModes[0] ?? 'grid';
    }

    if (!this.activeSortColumn && this.initialSortColumn) {
      this.activeSortColumn = this.initialSortColumn;
      this.activeSortDirection = this.initialSortDirection;
    }
  }

  protected activateItem(item: T): void {
    this.itemActivated.emit(item);

    if (this.itemLink) {
      void this.router.navigate(this.itemLink(item));
    }
  }

  protected toggleInlineDetails(item: T): void {
    this.expandedItem = this.expandedItem === item ? undefined : item;
  }

  protected openDetails(item: T, mode: DataViewMode): void {
    if (mode === 'table') {
      this.toggleInlineDetails(item);
      return;
    }

    this.detailModalItem = item;
  }

  protected closeDetails(): void {
    this.detailModalItem = undefined;
  }

  protected getDetailContext(
    item: T,
    mode: DataViewMode
  ): DataViewDetailContext<T> {
    return {
      $implicit: item,
      item,
      mode
    };
  }

  protected toggleSort(column: DataViewColumn<T>): void {
    const columnKey = column.header;

    if (this.activeSortColumn === columnKey) {
      this.activeSortDirection =
        this.activeSortDirection === 'asc' ? 'desc' : 'asc';
      return;
    }

    this.activeSortColumn = columnKey;
    this.activeSortDirection = 'asc';
  }

  protected getSortIndicator(column: DataViewColumn<T>): string {
    if (this.activeSortColumn !== column.header) {
      return '↕';
    }

    return this.activeSortDirection === 'asc' ? '↑' : '↓';
  }

  private sortItems(items: T[]): T[] {
    const activeColumn = this.columns.find(
      (column) => column.header === this.activeSortColumn && column.sortable
    );

    if (!activeColumn) {
      return items;
    }

    const sortedItems = [...items].sort((left, right) => {
      const leftValue = this.getComparableValue(activeColumn, left);
      const rightValue = this.getComparableValue(activeColumn, right);

      if (leftValue < rightValue) {
        return this.activeSortDirection === 'asc' ? -1 : 1;
      }

      if (leftValue > rightValue) {
        return this.activeSortDirection === 'asc' ? 1 : -1;
      }

      return 0;
    });

    return sortedItems;
  }

  private getComparableValue(column: DataViewColumn<T>, item: T): string | number {
    const rawValue = column.sortValue ? column.sortValue(item) : column.value(item);

    if (typeof rawValue === 'number') {
      return rawValue;
    }

    return rawValue.toLowerCase();
  }
}

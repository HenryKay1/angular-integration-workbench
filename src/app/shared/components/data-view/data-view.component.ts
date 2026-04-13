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
  template: `
    <section class="data-view">
      <div class="data-view__toolbar">
        <label class="data-view__search">
          <span>Search</span>
          <input
            type="search"
            [placeholder]="searchPlaceholder"
            [(ngModel)]="searchTerm"
          />
        </label>

        <div *ngIf="availableViewModes.length > 1" class="data-view__modes">
          <button
            *ngFor="let mode of availableViewModes"
            type="button"
            [class.data-view__mode--active]="mode === selectedViewMode"
            (click)="selectedViewMode = mode"
          >
            {{ mode === 'grid' ? 'Grid' : 'Table' }}
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="data-view__state">
        {{ loadingMessage }}
      </div>

      <ng-container *ngIf="!isLoading">
        <div *ngIf="filteredItems.length === 0" class="data-view__state">
          {{ searchTerm.trim() ? noResultsMessage : emptyMessage }}
        </div>

        <ng-container *ngIf="filteredItems.length > 0">
          <div *ngIf="selectedViewMode === 'grid'" class="data-view__grid">
            <article
              *ngFor="let item of processedItems"
              class="data-view__card"
              tabindex="0"
              (click)="activateItem(item)"
              (keydown.enter)="activateItem(item)"
            >
              <div class="data-view__card-top">
                <span *ngIf="cardConfig.eyebrow" class="data-view__eyebrow">
                  {{ cardConfig.eyebrow(item) }}
                </span>
              </div>

              <h3>{{ cardConfig.title(item) }}</h3>
              <p *ngIf="cardConfig.description">{{ cardConfig.description(item) }}</p>

              <dl *ngIf="cardConfig.fields?.length" class="data-view__card-fields">
                <div *ngFor="let field of cardConfig.fields">
                  <dt>{{ field.label }}</dt>
                  <dd>{{ field.value(item) }}</dd>
                </div>
              </dl>

              <button
                *ngIf="detailTemplate"
                type="button"
                class="data-view__detail-trigger"
                (click)="openDetails(item, 'grid'); $event.stopPropagation()"
              >
                View more
              </button>
            </article>
          </div>

          <div *ngIf="selectedViewMode === 'table'" class="data-view__table-wrap">
            <table class="data-view__table">
              <thead>
                <tr>
                  <th *ngIf="detailTemplate" class="data-view__expander-header" scope="col">
                    <span class="data-view__sr-only">Expand row</span>
                  </th>
                  <th *ngFor="let column of columns" scope="col">
                    <button
                      *ngIf="column.sortable; else staticHeader"
                      type="button"
                      class="data-view__sort-button"
                      (click)="toggleSort(column)"
                    >
                      <span>{{ column.header }}</span>
                      <span class="data-view__sort-indicator">
                        {{ getSortIndicator(column) }}
                      </span>
                    </button>

                    <ng-template #staticHeader>{{ column.header }}</ng-template>
                  </th>
                </tr>
              </thead>
              <tbody>
                <ng-container *ngFor="let item of processedItems">
                  <tr
                    tabindex="0"
                    (click)="activateItem(item)"
                    (keydown.enter)="activateItem(item)"
                  >
                    <td *ngIf="detailTemplate" class="data-view__expander-cell">
                      <button
                        type="button"
                        class="data-view__expander-button"
                        [attr.aria-label]="expandedItem === item ? 'Collapse row details' : 'Expand row details'"
                        (click)="toggleInlineDetails(item); $event.stopPropagation()"
                      >
                        {{ expandedItem === item ? '▾' : '▸' }}
                      </button>
                    </td>
                    <td *ngFor="let column of columns">{{ column.value(item) }}</td>
                  </tr>
                  <tr
                    *ngIf="detailTemplate && expandedItem === item"
                    class="data-view__detail-row"
                  >
                    <td [attr.colspan]="columns.length + 1">
                      <div class="data-view__detail-panel">
                        <ng-container
                          *ngTemplateOutlet="detailTemplate; context: getDetailContext(item, 'table')"
                        />
                      </div>
                    </td>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>
        </ng-container>
      </ng-container>

      <div
        *ngIf="detailTemplate && detailModalItem"
        class="data-view__modal-backdrop"
        (click)="closeDetails()"
      >
        <section
          class="data-view__modal"
          (click)="$event.stopPropagation()"
        >
          <div class="data-view__modal-header">
            <h3>Record detail</h3>
            <button
              type="button"
              class="data-view__modal-close"
              (click)="closeDetails()"
            >
              Close
            </button>
          </div>

          <ng-container
            *ngTemplateOutlet="detailTemplate; context: getDetailContext(detailModalItem, 'grid')"
          />
        </section>
      </div>
    </section>
  `,
  styles: [`
    .data-view {
      display: grid;
      gap: 1rem;
    }

    .data-view__toolbar {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: end;
      flex-wrap: wrap;
    }

    .data-view__search {
      display: grid;
      gap: 0.4rem;
      min-width: min(100%, 20rem);
      color: #334e68;
      font-weight: 600;
    }

    .data-view__search input {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1px solid #bcccdc;
      border-radius: 0.7rem;
      background: #ffffff;
      color: #102a43;
      font: inherit;
    }

    .data-view__modes {
      display: inline-flex;
      padding: 0.2rem;
      border-radius: 999px;
      background: #d9e2ec;
    }

    .data-view__modes button {
      border: 0;
      background: transparent;
      color: #334e68;
      padding: 0.55rem 0.9rem;
      border-radius: 999px;
      cursor: pointer;
      font: inherit;
      font-weight: 600;
    }

    .data-view__mode--active {
      background: #ffffff !important;
      color: #102a43 !important;
      box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08);
    }

    .data-view__state {
      padding: 1rem 1.25rem;
      border-radius: 0.75rem;
      border: 1px dashed #bcccdc;
      background: #f8fafc;
      color: #52606d;
    }

    .data-view__grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    }

    .data-view__card {
      display: grid;
      gap: 0.9rem;
      padding: 1.25rem;
      border: 1px solid #d9e2ec;
      border-radius: 0.75rem;
      background: #ffffff;
      box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      cursor: pointer;
    }

    .data-view__card:hover,
    .data-view__card:focus,
    .data-view__table tbody tr:hover,
    .data-view__table tbody tr:focus {
      border-color: #486581;
      outline: none;
      transform: translateY(-1px);
    }

    .data-view__card h3,
    .data-view__card p {
      margin: 0;
    }

    .data-view__eyebrow {
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #52606d;
    }

    .data-view__card-fields {
      display: grid;
      gap: 0.75rem;
      margin: 0;
    }

    .data-view__card-fields div {
      display: grid;
      gap: 0.2rem;
    }

    .data-view__card-fields dt {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #7b8794;
    }

    .data-view__card-fields dd {
      margin: 0;
      color: #1f2933;
    }

    .data-view__table-wrap {
      overflow: auto;
      border: 1px solid #d9e2ec;
      border-radius: 0.75rem;
      background: #ffffff;
    }

    .data-view__table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-view__table th,
    .data-view__table td {
      padding: 0.95rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e5edf5;
    }

    .data-view__table th {
      background: #f8fafc;
      color: #486581;
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .data-view__sort-button {
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      cursor: pointer;
      font: inherit;
      text-transform: inherit;
      letter-spacing: inherit;
    }

    .data-view__sort-indicator {
      color: #829ab1;
      font-size: 0.9rem;
    }

    .data-view__table tbody tr {
      cursor: pointer;
    }

    .data-view__table tbody tr:last-child td {
      border-bottom: 0;
    }

    .data-view__expander-header,
    .data-view__expander-cell {
      width: 1%;
      white-space: nowrap;
      padding-left: 0.75rem;
      padding-right: 0.5rem;
    }

    .data-view__detail-trigger {
      width: fit-content;
      padding: 0.55rem 0.8rem;
      border: 1px solid #bcccdc;
      border-radius: 999px;
      background: #ffffff;
      color: #102a43;
      cursor: pointer;
      font: inherit;
      font-weight: 600;
    }

    .data-view__expander-button {
      width: 2rem;
      height: 2rem;
      display: grid;
      place-items: center;
      padding: 0;
      border: 1px solid #bcccdc;
      border-radius: 999px;
      background: #ffffff;
      color: #334e68;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
    }

    .data-view__detail-row td {
      background: #f8fafc;
    }

    .data-view__detail-panel {
      padding: 0.25rem 0;
    }

    .data-view__modal-backdrop {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      background: rgba(15, 23, 42, 0.48);
      z-index: 1000;
    }

    .data-view__modal {
      width: min(100%, 42rem);
      max-height: 85vh;
      overflow: auto;
      padding: 1.25rem;
      border-radius: 1rem;
      background: #ffffff;
      box-shadow: 0 30px 80px rgba(15, 23, 42, 0.24);
    }

    .data-view__modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .data-view__modal-header h3 {
      margin: 0;
    }

    .data-view__modal-close {
      border: 0;
      background: transparent;
      color: #486581;
      cursor: pointer;
      font: inherit;
      font-weight: 600;
    }

    .data-view__sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `]
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

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

export type DataViewMode = 'grid' | 'table';

export interface DataViewColumn<T> {
  header: string;
  value: (item: T) => string;
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
              *ngFor="let item of filteredItems"
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
            </article>
          </div>

          <div *ngIf="selectedViewMode === 'table'" class="data-view__table-wrap">
            <table class="data-view__table">
              <thead>
                <tr>
                  <th *ngFor="let column of columns" scope="col">{{ column.header }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let item of filteredItems"
                  tabindex="0"
                  (click)="activateItem(item)"
                  (keydown.enter)="activateItem(item)"
                >
                  <td *ngFor="let column of columns">{{ column.value(item) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>
      </ng-container>
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

    .data-view__table tbody tr {
      cursor: pointer;
    }

    .data-view__table tbody tr:last-child td {
      border-bottom: 0;
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

  @Output() itemActivated = new EventEmitter<T>();

  protected searchTerm = '';
  protected selectedViewMode: DataViewMode = this.initialViewMode;

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
  }

  protected activateItem(item: T): void {
    this.itemActivated.emit(item);

    if (this.itemLink) {
      void this.router.navigate(this.itemLink(item));
    }
  }
}

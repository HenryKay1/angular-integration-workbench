import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  TemplateRef,
  inject
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  DataViewCardConfig,
  DataViewColumn,
  DataViewDetailContext,
  DataViewFilter,
  DataViewFilterColumnConfig,
  DataViewFilterControlType,
  DataViewFilterDraft,
  DataViewFilterLogic,
  DataViewFilterOperator,
  DataViewFilterOperatorOption,
  DataViewFilterOption,
  DataViewFilterValue,
  DataViewFilterValueType,
  DataViewMode,
  DataViewPaginationConfig,
  DataViewProcessingMode,
  DataViewProcessingState,
  DataViewSortDirection,
  DataViewValue
} from './data-view.models';

export type {
  DataViewCardConfig,
  DataViewCardField,
  DataViewColumn,
  DataViewDetailContext,
  DataViewDropdownType,
  DataViewFilter,
  DataViewFilterColumnConfig,
  DataViewFilterControlType,
  DataViewFilterDraft,
  DataViewFilterLogic,
  DataViewFilterOperator,
  DataViewFilterOperatorOption,
  DataViewFilterOption,
  DataViewFilterValue,
  DataViewFilterValueType,
  DataViewMode,
  DataViewPaginationConfig,
  DataViewPaginationState,
  DataViewProcessingMode,
  DataViewProcessingState,
  DataViewSortDirection,
  DataViewSortState,
  DataViewValue
} from './data-view.models';

const FILTER_OPERATOR_LABELS: Record<DataViewFilterOperator, string> = {
  equals: 'Equals',
  notEquals: 'Does not equal',
  contains: 'Contains',
  startsWith: 'Starts with',
  endsWith: 'Ends with',
  greaterThan: 'Greater than',
  greaterThanOrEqual: 'Greater than or equal',
  lessThan: 'Less than',
  lessThanOrEqual: 'Less than or equal',
  containsAny: 'Contains any',
  containsAll: 'Contains all',
  containsNone: 'Contains none'
};

const FILTER_OPERATORS_BY_VALUE_TYPE: Record<
  DataViewFilterValueType,
  DataViewFilterOperator[]
> = {
  string: ['equals', 'notEquals', 'contains', 'startsWith', 'endsWith'],
  number: [
    'equals',
    'notEquals',
    'greaterThan',
    'greaterThanOrEqual',
    'lessThan',
    'lessThanOrEqual'
  ],
  date: ['equals', 'greaterThan', 'lessThan'],
  boolean: ['equals'],
  stringArray: ['containsAny', 'containsAll', 'containsNone']
};

const SINGLE_SELECT_FILTER_OPERATORS: DataViewFilterOperator[] = [
  'equals',
  'notEquals'
];

@Component({
  selector: 'aiw-data-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './data-view.component.html',
  styleUrl: './data-view.component.css'
})
export class DataViewComponent<T> implements OnChanges {
  private readonly router = inject(Router);

  @Input({ required: true }) items: T[] = [];
  @Input({ required: true }) columns: DataViewColumn<T>[] = [];
  @Input({ required: true }) cardConfig!: DataViewCardConfig<T>;
  @Input() processingMode: DataViewProcessingMode = 'client';
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
  @Input() initialSortDirection: DataViewSortDirection = 'asc';
  @Input() detailTemplate?: TemplateRef<DataViewDetailContext<T>>;
  @Input() pagination?: DataViewPaginationConfig;

  @Output() itemActivated = new EventEmitter<T>();

  // Reserved for Phase 2 server processing. Do not emit in Phase 1.
  @Output() processingChanged = new EventEmitter<DataViewProcessingState>();

  protected searchTerm = '';
  protected selectedViewMode: DataViewMode = this.initialViewMode;
  protected activeSortColumn?: string;
  protected activeSortDirection: DataViewSortDirection = this.initialSortDirection;
  protected expandedItem?: T;
  protected detailModalItem?: T;
  protected isFilterModalOpen = false;
  protected activeFilters: DataViewFilter[] = [];
  protected filterDraft: DataViewFilterDraft = {};
  protected editFilterDraft: DataViewFilterDraft = {};
  protected editingFilterId?: string;
  protected filterLogic: DataViewFilterLogic = 'and';
  protected configurationError: string | null = null;
  protected pageIndex = 0;
  protected pageSize = 10;

  private nextFilterId = 1;
  private hasLoggedConfigurationError = false;

  protected get processedItems(): T[] {
    const sortedItems = this.sortItems(this.filteredItems);

    if (!this.isPaginationEnabled) {
      return sortedItems;
    }

    return this.paginateItems(sortedItems);
  }

  protected get filteredItems(): T[] {
    const normalizedTerm = this.searchTerm.trim().toLowerCase();
    const searchedItems = normalizedTerm
      ? this.items.filter((item) =>
          this.searchFields.some((field) =>
            String(field(item) ?? '').toLowerCase().includes(normalizedTerm)
          )
        )
      : this.items;

    if (this.activeFilters.length === 0) {
      return searchedItems;
    }

    return searchedItems.filter((item) => this.itemMatchesActiveFilters(item));
  }

  protected get filterableColumns(): DataViewColumn<T>[] {
    return this.columns.filter((column) => !!column.filter);
  }

  protected get activeFilterCount(): number {
    return this.activeFilters.length;
  }

  protected get hasActiveQuery(): boolean {
    return this.searchTerm.trim().length > 0 || this.activeFilterCount > 0;
  }

  protected get isPaginationEnabled(): boolean {
    return this.pagination?.enabled === true;
  }

  protected get pageCount(): number {
    return Math.max(1, Math.ceil(this.filteredItems.length / this.pageSize));
  }

  protected get currentPage(): number {
    return this.pageIndex + 1;
  }

  protected get pageStartItem(): number {
    if (this.filteredItems.length === 0) {
      return 0;
    }

    return this.pageIndex * this.pageSize + 1;
  }

  protected get pageEndItem(): number {
    return Math.min(this.filteredItems.length, (this.pageIndex + 1) * this.pageSize);
  }

  protected get fastStep(): number {
    return this.toPositiveInteger(this.pagination?.fastStep, 5);
  }

  protected get isFirstPage(): boolean {
    return this.pageIndex <= 0;
  }

  protected get isLastPage(): boolean {
    return this.pageIndex >= this.pageCount - 1;
  }

  protected get visiblePageItems(): Array<number | 'ellipsis'> {
    const pageCount = this.pageCount;
    const currentPage = this.currentPage;

    if (pageCount <= 5) {
      return Array.from({ length: pageCount }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, pageCount, currentPage]);

    if (currentPage > 2) {
      pages.add(currentPage - 1);
    }

    if (currentPage < pageCount - 1) {
      pages.add(currentPage + 1);
    }

    const sortedPages = Array.from(pages).sort((left, right) => left - right);
    const pageItems: Array<number | 'ellipsis'> = [];

    sortedPages.forEach((page, index) => {
      const previousPage = sortedPages[index - 1];

      if (previousPage && page - previousPage > 1) {
        pageItems.push('ellipsis');
      }

      pageItems.push(page);
    });

    return pageItems;
  }

  protected get selectedDraftColumn(): DataViewColumn<T> | undefined {
    return this.columns.find(
      (column) => column.key === this.filterDraft.columnKey
    );
  }

  protected get draftOperatorOptions(): DataViewFilterOperatorOption[] {
    const column = this.selectedDraftColumn;

    if (!column?.filter) {
      return [];
    }

    return this.getOperatorOptions(column.filter);
  }

  protected get draftControlType(): DataViewFilterControlType {
    return this.selectedDraftColumn?.filter?.controlType ?? 'input';
  }

  protected get draftValueType(): DataViewFilterValueType | undefined {
    return this.selectedDraftColumn?.filter?.valueType;
  }

  protected get draftOptions(): DataViewFilterOption[] {
    return this.selectedDraftColumn?.filter?.options ?? [];
  }

  protected get isDraftMultiSelect(): boolean {
    return this.selectedDraftColumn?.filter?.dropdownType === 'multi';
  }

  protected get selectedEditColumn(): DataViewColumn<T> | undefined {
    return this.columns.find(
      (column) => column.key === this.editFilterDraft.columnKey
    );
  }

  protected get editOperatorOptions(): DataViewFilterOperatorOption[] {
    const column = this.selectedEditColumn;

    if (!column?.filter) {
      return [];
    }

    return this.getOperatorOptions(column.filter);
  }

  protected get editControlType(): DataViewFilterControlType {
    return this.selectedEditColumn?.filter?.controlType ?? 'input';
  }

  protected get editValueType(): DataViewFilterValueType | undefined {
    return this.selectedEditColumn?.filter?.valueType;
  }

  protected get editOptions(): DataViewFilterOption[] {
    return this.selectedEditColumn?.filter?.options ?? [];
  }

  protected get isEditMultiSelect(): boolean {
    return this.selectedEditColumn?.filter?.dropdownType === 'multi';
  }

  protected get currentProcessingState(): DataViewProcessingState {
    return this.buildProcessingState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pagination']) {
      this.syncPageSizeFromConfig();
    }

    if (changes['items']) {
      this.clampPageIndex();
    }

    if (
      changes['initialViewMode'] &&
      this.availableViewModes.includes(this.initialViewMode)
    ) {
      this.selectedViewMode = this.initialViewMode;
    }

    if (changes['columns'] || changes['processingMode']) {
      this.configurationError = this.validateConfiguration();
      this.hasLoggedConfigurationError = false;
      this.pruneFiltersForCurrentColumns();
    }

    if (this.configurationError && !this.hasLoggedConfigurationError) {
      console.error(this.configurationError, {
        columns: this.columns,
        processingMode: this.processingMode
      });
      this.hasLoggedConfigurationError = true;
    }

    if (!this.availableViewModes.includes(this.selectedViewMode)) {
      this.selectedViewMode = this.availableViewModes[0] ?? 'grid';
    }

    if (!this.activeSortColumn && this.initialSortColumn) {
      this.activeSortColumn = this.initialSortColumn;
      this.activeSortDirection = this.initialSortDirection;
    }

    this.clampPageIndex();
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

  protected openFilterModal(): void {
    this.isFilterModalOpen = true;
    this.filterDraft = {
      ...this.filterDraft,
      error: undefined
    };
  }

  protected closeFilterModal(): void {
    this.isFilterModalOpen = false;
  }

  protected addDraftFilter(): void {
    const error = this.validateDraftFilter();

    if (error) {
      this.filterDraft = {
        ...this.filterDraft,
        error
      };
      return;
    }

    this.activeFilters = [
      ...this.activeFilters,
      {
        id: this.createFilterId(),
        columnKey: this.filterDraft.columnKey!,
        operator: this.filterDraft.operator!,
        value: this.normalizeFilterValue(this.filterDraft.value)
      }
    ];
    this.resetFilterDraft();
    this.resetPagination();
  }

  protected removeFilter(filterId: string): void {
    this.activeFilters = this.activeFilters.filter(
      (filter) => filter.id !== filterId
    );

    if (this.editingFilterId === filterId) {
      this.resetEditFilterDraft();
    }

    this.resetPagination();
  }

  protected clearAllFilters(): void {
    this.activeFilters = [];
    this.resetFilterDraft();
    this.resetEditFilterDraft();
    this.resetPagination();
  }

  protected handleDraftColumnChange(columnKey: string): void {
    this.filterDraft = {
      columnKey: columnKey || undefined,
      operator: undefined,
      value: this.getEmptyDraftValue(columnKey),
      error: undefined
    };
  }

  protected handleDraftOperatorChange(operator: string): void {
    this.filterDraft = {
      ...this.filterDraft,
      operator: (operator || undefined) as DataViewFilterOperator | undefined,
      error: undefined
    };
  }

  protected handleDraftValueChange(value: DataViewFilterValue): void {
    this.filterDraft = {
      ...this.filterDraft,
      value: this.coerceFilterValue(value, this.draftValueType),
      error: undefined
    };
  }

  protected startFilterEdit(filter: DataViewFilter): void {
    this.filterDraft = {};
    this.editingFilterId = filter.id;
    this.editFilterDraft = {
      columnKey: filter.columnKey,
      operator: filter.operator,
      value: filter.value,
      error: undefined
    };
  }

  protected saveFilterEdit(): void {
    if (!this.editingFilterId) {
      return;
    }

    const error = this.validateFilterInput(
      this.editFilterDraft,
      this.editingFilterId
    );

    if (error) {
      this.editFilterDraft = {
        ...this.editFilterDraft,
        error
      };
      return;
    }

    const editedFilter: DataViewFilter = {
      id: this.editingFilterId,
      columnKey: this.editFilterDraft.columnKey!,
      operator: this.editFilterDraft.operator!,
      value: this.normalizeFilterValue(this.editFilterDraft.value)
    };

    this.activeFilters = this.activeFilters.map((filter) =>
      filter.id === this.editingFilterId ? editedFilter : filter
    );
    this.resetEditFilterDraft();
    this.resetPagination();
  }

  protected handleEditOperatorChange(operator: string): void {
    this.editFilterDraft = {
      ...this.editFilterDraft,
      operator: (operator || undefined) as DataViewFilterOperator | undefined,
      error: undefined
    };
  }

  protected handleEditValueChange(value: DataViewFilterValue): void {
    this.editFilterDraft = {
      ...this.editFilterDraft,
      value: this.coerceFilterValue(value, this.editValueType),
      error: undefined
    };
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
    const columnKey = column.key;

    if (this.activeSortColumn === columnKey) {
      this.activeSortDirection =
        this.activeSortDirection === 'asc' ? 'desc' : 'asc';
      this.resetPagination();
      return;
    }

    this.activeSortColumn = columnKey;
    this.activeSortDirection = 'asc';
    this.resetPagination();
  }

  protected handleSearchTermChange(value: string): void {
    this.searchTerm = value;
    this.resetPagination();
  }

  protected handleFilterLogicChange(logic: DataViewFilterLogic): void {
    this.filterLogic = logic;
    this.resetPagination();
  }

  protected movePage(delta: number): void {
    this.pageIndex = this.clampPageNumber(this.pageIndex + delta);
  }

  protected goToPage(pageNumber: number): void {
    this.pageIndex = this.clampPageNumber(pageNumber - 1);
  }

  protected handlePageItemClick(pageItem: number | 'ellipsis'): void {
    if (typeof pageItem === 'number') {
      this.goToPage(pageItem);
    }
  }

  protected getPageItemLabel(pageItem: number | 'ellipsis'): string {
    return pageItem === 'ellipsis' ? '...' : String(pageItem);
  }

  protected trackPageItem(index: number, pageItem: number | 'ellipsis'): string {
    return `${pageItem}-${index}`;
  }

  protected handlePageInputChange(
    value: string | number,
    input?: HTMLInputElement
  ): void {
    const pageNumber = this.toPositiveInteger(value, this.currentPage);
    this.pageIndex = this.clampPageNumber(pageNumber - 1);

    if (input) {
      input.value = String(this.currentPage);
    }
  }

  protected getSortIndicator(column: DataViewColumn<T>): string {
    if (this.activeSortColumn !== column.key) {
      return '↕';
    }

    return this.activeSortDirection === 'asc' ? '↑' : '↓';
  }

  protected formatColumnValue(value: DataViewValue): string {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleString();
    }

    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return String(value);
  }

  protected getFilterSummary(filter: DataViewFilter): string {
    const column = this.columns.find((item) => item.key === filter.columnKey);

    return [
      column?.header ?? filter.columnKey,
      FILTER_OPERATOR_LABELS[filter.operator],
      this.formatFilterValue(filter.value)
    ].join(' ');
  }

  protected getColumnHeader(columnKey: string): string {
    return this.columns.find((column) => column.key === columnKey)?.header ?? columnKey;
  }

  protected getOperatorLabel(operator: DataViewFilterOperator): string {
    return FILTER_OPERATOR_LABELS[operator];
  }

  protected getInputType(valueType: DataViewFilterValueType | undefined): string {
    if (valueType === 'number') {
      return 'number';
    }

    if (valueType === 'date') {
      return 'date';
    }

    return 'text';
  }

  private sortItems(items: T[]): T[] {
    const activeColumn = this.columns.find(
      (column) => column.key === this.activeSortColumn && column.sortable
    );

    if (!activeColumn) {
      return items;
    }

    return [...items].sort((left, right) => {
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
  }

  private paginateItems(items: T[]): T[] {
    this.clampPageIndex();

    const startIndex = this.pageIndex * this.pageSize;
    return items.slice(startIndex, startIndex + this.pageSize);
  }

  private syncPageSizeFromConfig(): void {
    this.pageSize = this.toPositiveInteger(
      this.pagination?.defaultPageSize,
      10
    );
    this.resetPagination();
  }

  private resetPagination(): void {
    this.pageIndex = 0;
  }

  private clampPageIndex(): void {
    this.pageIndex = this.clampPageNumber(this.pageIndex);
  }

  private clampPageNumber(pageIndex: number): number {
    return Math.min(Math.max(pageIndex, 0), this.pageCount - 1);
  }

  private toPositiveInteger(
    value: string | number | undefined,
    fallback: number
  ): number {
    const numericValue = Number(value);

    if (!Number.isFinite(numericValue) || numericValue < 1) {
      return fallback;
    }

    return Math.floor(numericValue);
  }

  private getComparableValue(column: DataViewColumn<T>, item: T): string | number {
    const rawValue = column.value(item);

    if (typeof rawValue === 'number') {
      return rawValue;
    }

    if (typeof rawValue === 'boolean') {
      return rawValue ? 1 : 0;
    }

    if (rawValue instanceof Date) {
      return rawValue.getTime();
    }

    if (Array.isArray(rawValue)) {
      return rawValue.join(' ').toLowerCase();
    }

    return String(rawValue ?? '').toLowerCase();
  }

  private itemMatchesActiveFilters(item: T): boolean {
    const matches = this.activeFilters.map((filter) =>
      this.itemMatchesFilter(item, filter)
    );

    return this.filterLogic === 'and'
      ? matches.every(Boolean)
      : matches.some(Boolean);
  }

  private itemMatchesFilter(item: T, filter: DataViewFilter): boolean {
    const column = this.getColumnByKey(filter.columnKey);

    if (!column?.filter) {
      return true;
    }

    const rawValue = column.value(item);

    if (column.filter.valueType === 'number') {
      return this.numberMatchesFilter(rawValue, filter);
    }

    if (column.filter.valueType === 'date') {
      return this.dateMatchesFilter(rawValue, filter);
    }

    if (column.filter.valueType === 'boolean') {
      return this.booleanMatchesFilter(rawValue, filter);
    }

    if (column.filter.valueType === 'stringArray') {
      return this.stringArrayMatchesFilter(rawValue, filter);
    }

    return this.stringMatchesFilter(rawValue, filter);
  }

  private stringMatchesFilter(
    rawValue: DataViewValue,
    filter: DataViewFilter
  ): boolean {
    const itemValue = String(rawValue ?? '').toLowerCase();
    const filterValue = String(filter.value ?? '').toLowerCase();

    if (filter.operator === 'equals') {
      return itemValue === filterValue;
    }

    if (filter.operator === 'notEquals') {
      return itemValue !== filterValue;
    }

    if (filter.operator === 'contains') {
      return itemValue.includes(filterValue);
    }

    if (filter.operator === 'startsWith') {
      return itemValue.startsWith(filterValue);
    }

    if (filter.operator === 'endsWith') {
      return itemValue.endsWith(filterValue);
    }

    return true;
  }

  private numberMatchesFilter(
    rawValue: DataViewValue,
    filter: DataViewFilter
  ): boolean {
    const itemValue = Number(rawValue);
    const filterValue =
      typeof filter.value === 'number' ? filter.value : Number(filter.value);

    if (!Number.isFinite(itemValue) || !Number.isFinite(filterValue)) {
      return false;
    }

    if (filter.operator === 'equals') {
      return itemValue === filterValue;
    }

    if (filter.operator === 'notEquals') {
      return itemValue !== filterValue;
    }

    if (filter.operator === 'greaterThan') {
      return itemValue > filterValue;
    }

    if (filter.operator === 'greaterThanOrEqual') {
      return itemValue >= filterValue;
    }

    if (filter.operator === 'lessThan') {
      return itemValue < filterValue;
    }

    if (filter.operator === 'lessThanOrEqual') {
      return itemValue <= filterValue;
    }

    return true;
  }

  private dateMatchesFilter(
    rawValue: DataViewValue,
    filter: DataViewFilter
  ): boolean {
    const itemTimestamp = this.toDateFilterValue(rawValue as DataViewFilterValue);
    const filterTimestamp = this.toDateFilterValue(filter.value);

    if (itemTimestamp === null || filterTimestamp === null) {
      return false;
    }

    if (filter.operator === 'equals') {
      return (
        this.toDateKey(rawValue as DataViewFilterValue) ===
        this.toDateKey(filter.value)
      );
    }

    if (filter.operator === 'greaterThan') {
      return itemTimestamp > filterTimestamp;
    }

    if (filter.operator === 'lessThan') {
      return itemTimestamp < filterTimestamp;
    }

    return true;
  }

  private booleanMatchesFilter(
    rawValue: DataViewValue,
    filter: DataViewFilter
  ): boolean {
    const itemValue =
      typeof rawValue === 'boolean' ? rawValue : String(rawValue) === 'true';
    const filterValue =
      typeof filter.value === 'boolean'
        ? filter.value
        : String(filter.value) === 'true';

    if (filter.operator === 'equals') {
      return itemValue === filterValue;
    }

    if (filter.operator === 'notEquals') {
      return itemValue !== filterValue;
    }

    return true;
  }

  private stringArrayMatchesFilter(
    rawValue: DataViewValue,
    filter: DataViewFilter
  ): boolean {
    const itemValues = new Set(
      (Array.isArray(rawValue) ? rawValue : [rawValue])
        .filter((value) => value !== null && value !== undefined)
        .map((value) => String(value).toLowerCase())
    );
    const filterValues = (Array.isArray(filter.value)
      ? filter.value
      : [filter.value]
    )
      .filter((value) => value !== null && value !== undefined)
      .map((value) => String(value).toLowerCase());

    if (filter.operator === 'containsAny') {
      return filterValues.some((value) => itemValues.has(value));
    }

    if (filter.operator === 'containsAll') {
      return filterValues.every((value) => itemValues.has(value));
    }

    if (filter.operator === 'containsNone') {
      return filterValues.every((value) => !itemValues.has(value));
    }

    if (filter.operator === 'equals') {
      return this.serializeFilterValue(Array.from(itemValues)) ===
        this.serializeFilterValue(filterValues);
    }

    if (filter.operator === 'notEquals') {
      return this.serializeFilterValue(Array.from(itemValues)) !==
        this.serializeFilterValue(filterValues);
    }

    return true;
  }

  private validateDraftFilter(): string | null {
    return this.validateFilterInput(this.filterDraft);
  }

  private validateFilterInput(
    filterInput: DataViewFilterDraft,
    excludedFilterId?: string
  ): string | null {
    const column = filterInput.columnKey
      ? this.getColumnByKey(filterInput.columnKey)
      : undefined;

    if (!filterInput.columnKey || !column?.filter) {
      return 'Select a column before adding a filter.';
    }

    if (!filterInput.operator) {
      return 'Select an expression before adding a filter.';
    }

    if (!this.getCompatibleOperators(column.filter).includes(filterInput.operator)) {
      return 'The selected expression is not compatible with this column.';
    }

    if (!this.hasRequiredValue(filterInput.value)) {
      return 'Enter or select a value before adding a filter.';
    }

    if (!this.isValueCompatible(column.filter, filterInput.value)) {
      return 'The filter value is not compatible with this column.';
    }

    if (this.hasDuplicateFilter(filterInput, excludedFilterId)) {
      return 'This filter has already been added.';
    }

    const combinationError = this.validateFilterCombination(
      filterInput,
      excludedFilterId
    );

    if (combinationError) {
      return combinationError;
    }

    return null;
  }

  private hasRequiredValue(value: DataViewFilterValue | undefined): boolean {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null && value !== undefined && value !== '';
  }

  private isValueCompatible(
    config: DataViewFilterColumnConfig,
    value: DataViewFilterValue | undefined
  ): boolean {
    if (!this.hasRequiredValue(value)) {
      return false;
    }

    if (config.valueType === 'stringArray') {
      return Array.isArray(value) && value.every((item) => typeof item === 'string');
    }

    if (config.valueType === 'number') {
      return typeof value === 'number' && Number.isFinite(value);
    }

    if (config.valueType === 'boolean') {
      return typeof value === 'boolean';
    }

    if (config.valueType === 'date') {
      return typeof value === 'string' || value instanceof Date;
    }

    return typeof value === 'string';
  }

  private hasDuplicateFilter(
    filterInput: DataViewFilterDraft,
    excludedFilterId?: string
  ): boolean {
    const nextValue = this.serializeFilterValue(
      this.normalizeFilterValue(filterInput.value)
    );

    return this.activeFilters.some(
      (filter) =>
        filter.id !== excludedFilterId &&
        filter.columnKey === filterInput.columnKey &&
        filter.operator === filterInput.operator &&
        this.serializeFilterValue(filter.value) === nextValue
    );
  }

  private validateFilterCombination(
    filterInput: DataViewFilterDraft,
    excludedFilterId?: string
  ): string | null {
    if (this.filterLogic !== 'and') {
      return null;
    }

    const column = filterInput.columnKey
      ? this.getColumnByKey(filterInput.columnKey)
      : undefined;

    if (!column?.filter || !filterInput.columnKey || !filterInput.operator) {
      return null;
    }

    const candidate: DataViewFilter = {
      id: excludedFilterId ?? 'draft-filter',
      columnKey: filterInput.columnKey,
      operator: filterInput.operator,
      value: this.normalizeFilterValue(filterInput.value)
    };
    const relatedFilters = [
      ...this.activeFilters.filter(
        (filter) =>
          filter.id !== excludedFilterId &&
          filter.columnKey === candidate.columnKey
      ),
      candidate
    ];
    const equalityError = this.validateEqualityCombination(
      relatedFilters,
      column.header
    );

    if (equalityError) {
      return equalityError;
    }

    if (column.filter.valueType === 'number') {
      return this.validateNumberFilterCombination(relatedFilters, column.header);
    }

    if (column.filter.valueType === 'date') {
      return this.validateDateFilterCombination(relatedFilters, column.header);
    }

    if (column.filter.valueType === 'string') {
      return this.validateStringFilterCombination(relatedFilters, column.header);
    }

    if (column.filter.valueType === 'stringArray') {
      return this.validateStringArrayFilterCombination(
        relatedFilters,
        column.header
      );
    }

    return null;
  }

  private validateEqualityCombination(
    filters: DataViewFilter[],
    columnHeader: string
  ): string | null {
    const equalsFilters = filters.filter((filter) => filter.operator === 'equals');

    for (let index = 0; index < equalsFilters.length; index += 1) {
      const left = equalsFilters[index];
      const leftValue = this.serializeFilterValue(left.value);

      for (const right of equalsFilters.slice(index + 1)) {
        if (this.serializeFilterValue(right.value) !== leftValue) {
          return `This filter conflicts with an existing filter on "${columnHeader}".`;
        }
      }

      const matchingNotEquals = filters.some(
        (filter) =>
          filter.operator === 'notEquals' &&
          this.serializeFilterValue(filter.value) === leftValue
      );

      if (matchingNotEquals) {
        return `This filter conflicts with an existing filter on "${columnHeader}".`;
      }
    }

    return null;
  }

  private validateNumberFilterCombination(
    filters: DataViewFilter[],
    columnHeader: string
  ): string | null {
    let lowerBound: { value: number; inclusive: boolean } | undefined;
    let upperBound: { value: number; inclusive: boolean } | undefined;
    const excludedValues = new Set<number>();
    const equalsValues: number[] = [];

    for (const filter of filters) {
      const value = this.toNumberFilterValue(filter.value);

      if (value === null) {
        continue;
      }

      if (filter.operator === 'equals') {
        equalsValues.push(value);
      }

      if (filter.operator === 'notEquals') {
        excludedValues.add(value);
      }

      if (filter.operator === 'greaterThan') {
        lowerBound = this.getStrongerLowerBound(lowerBound, {
          value,
          inclusive: false
        });
      }

      if (filter.operator === 'greaterThanOrEqual') {
        lowerBound = this.getStrongerLowerBound(lowerBound, {
          value,
          inclusive: true
        });
      }

      if (filter.operator === 'lessThan') {
        upperBound = this.getStrongerUpperBound(upperBound, {
          value,
          inclusive: false
        });
      }

      if (filter.operator === 'lessThanOrEqual') {
        upperBound = this.getStrongerUpperBound(upperBound, {
          value,
          inclusive: true
        });
      }
    }

    if (this.hasInvalidRange(lowerBound, upperBound)) {
      return `The filters on "${columnHeader}" create an invalid range.`;
    }

    for (const value of equalsValues) {
      if (excludedValues.has(value)) {
        return `This filter conflicts with an existing filter on "${columnHeader}".`;
      }

      if (
        (lowerBound &&
          (value < lowerBound.value ||
            (value === lowerBound.value && !lowerBound.inclusive))) ||
        (upperBound &&
          (value > upperBound.value ||
            (value === upperBound.value && !upperBound.inclusive)))
      ) {
        return `The filters on "${columnHeader}" create an invalid range.`;
      }
    }

    return null;
  }

  private validateDateFilterCombination(
    filters: DataViewFilter[],
    columnHeader: string
  ): string | null {
    let lowerBound: { value: number; inclusive: boolean } | undefined;
    let upperBound: { value: number; inclusive: boolean } | undefined;
    const equalsValues: number[] = [];

    for (const filter of filters) {
      const value = this.toDateFilterValue(filter.value);

      if (value === null) {
        continue;
      }

      if (filter.operator === 'equals') {
        equalsValues.push(value);
      }

      if (filter.operator === 'greaterThan') {
        lowerBound = this.getStrongerLowerBound(lowerBound, {
          value,
          inclusive: false
        });
      }

      if (filter.operator === 'lessThan') {
        upperBound = this.getStrongerUpperBound(upperBound, {
          value,
          inclusive: false
        });
      }
    }

    if (this.hasInvalidRange(lowerBound, upperBound)) {
      return `The filters on "${columnHeader}" create an invalid range.`;
    }

    for (const value of equalsValues) {
      if (
        (lowerBound && value <= lowerBound.value) ||
        (upperBound && value >= upperBound.value)
      ) {
        return `The filters on "${columnHeader}" create an invalid range.`;
      }
    }

    return null;
  }

  private validateStringFilterCombination(
    filters: DataViewFilter[],
    columnHeader: string
  ): string | null {
    const stringFilters = filters
      .map((filter) => ({
        operator: filter.operator,
        value: typeof filter.value === 'string' ? filter.value : null
      }))
      .filter((filter) => filter.value !== null);
    const equalsFilters = stringFilters.filter(
      (filter) => filter.operator === 'equals'
    );

    for (const equalsFilter of equalsFilters) {
      const equalsValue = equalsFilter.value!;

      for (const filter of stringFilters) {
        const value = filter.value!;

        if (filter.operator === 'startsWith' && !equalsValue.startsWith(value)) {
          return `This filter conflicts with an existing filter on "${columnHeader}".`;
        }

        if (filter.operator === 'endsWith' && !equalsValue.endsWith(value)) {
          return `This filter conflicts with an existing filter on "${columnHeader}".`;
        }

        if (filter.operator === 'contains' && !equalsValue.includes(value)) {
          return `This filter conflicts with an existing filter on "${columnHeader}".`;
        }
      }
    }

    const startsWithValues = stringFilters
      .filter((filter) => filter.operator === 'startsWith')
      .map((filter) => filter.value!);

    for (let index = 0; index < startsWithValues.length; index += 1) {
      for (const value of startsWithValues.slice(index + 1)) {
        const existingValue = startsWithValues[index];

        if (
          !existingValue.startsWith(value) &&
          !value.startsWith(existingValue)
        ) {
          return `The starts-with filters on "${columnHeader}" conflict.`;
        }
      }
    }

    const endsWithValues = stringFilters
      .filter((filter) => filter.operator === 'endsWith')
      .map((filter) => filter.value!);

    for (let index = 0; index < endsWithValues.length; index += 1) {
      for (const value of endsWithValues.slice(index + 1)) {
        const existingValue = endsWithValues[index];

        if (!existingValue.endsWith(value) && !value.endsWith(existingValue)) {
          return `The ends-with filters on "${columnHeader}" conflict.`;
        }
      }
    }

    return null;
  }

  private validateStringArrayFilterCombination(
    filters: DataViewFilter[],
    columnHeader: string
  ): string | null {
    const requiredValues = new Set<string>();
    const prohibitedValues = new Set<string>();
    const containsAnyValues: string[][] = [];

    for (const filter of filters) {
      const values = Array.isArray(filter.value) ? filter.value : [];

      if (filter.operator === 'containsAll') {
        values.forEach((value) => requiredValues.add(value));
      }

      if (filter.operator === 'containsNone') {
        values.forEach((value) => prohibitedValues.add(value));
      }

      if (filter.operator === 'containsAny') {
        containsAnyValues.push(values);
      }
    }

    const requiredConflict = Array.from(requiredValues).some((value) =>
      prohibitedValues.has(value)
    );

    if (requiredConflict) {
      return `This filter conflicts with an existing filter on "${columnHeader}".`;
    }

    const anyConflict = containsAnyValues.some((values) =>
      values.every((value) => prohibitedValues.has(value))
    );

    if (anyConflict) {
      return `This filter conflicts with an existing filter on "${columnHeader}".`;
    }

    return null;
  }

  private toNumberFilterValue(value: DataViewFilterValue): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private toDateFilterValue(value: DataViewFilterValue): number | null {
    const timestamp =
      value instanceof Date ? value.getTime() : Date.parse(String(value));

    return Number.isFinite(timestamp) ? timestamp : null;
  }

  private toDateKey(value: DataViewFilterValue): string {
    const date = value instanceof Date ? value : new Date(String(value));

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toISOString().slice(0, 10);
  }

  private getStrongerLowerBound(
    current: { value: number; inclusive: boolean } | undefined,
    next: { value: number; inclusive: boolean }
  ): { value: number; inclusive: boolean } {
    if (!current || next.value > current.value) {
      return next;
    }

    if (next.value === current.value && !next.inclusive) {
      return next;
    }

    return current;
  }

  private getStrongerUpperBound(
    current: { value: number; inclusive: boolean } | undefined,
    next: { value: number; inclusive: boolean }
  ): { value: number; inclusive: boolean } {
    if (!current || next.value < current.value) {
      return next;
    }

    if (next.value === current.value && !next.inclusive) {
      return next;
    }

    return current;
  }

  private hasInvalidRange(
    lowerBound: { value: number; inclusive: boolean } | undefined,
    upperBound: { value: number; inclusive: boolean } | undefined
  ): boolean {
    if (!lowerBound || !upperBound) {
      return false;
    }

    if (lowerBound.value > upperBound.value) {
      return true;
    }

    return (
      lowerBound.value === upperBound.value &&
      (!lowerBound.inclusive || !upperBound.inclusive)
    );
  }

  private normalizeFilterValue(
    value: DataViewFilterValue | undefined
  ): DataViewFilterValue {
    if (Array.isArray(value)) {
      return [...value].sort();
    }

    return value ?? null;
  }

  private serializeFilterValue(value: DataViewFilterValue): string {
    if (Array.isArray(value)) {
      return JSON.stringify([...value].sort());
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    return JSON.stringify(value);
  }

  protected formatFilterValue(value: DataViewFilterValue): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }

    return String(value ?? '');
  }

  private coerceFilterValue(
    value: DataViewFilterValue,
    valueType: DataViewFilterValueType | undefined
  ): DataViewFilterValue {
    if (valueType === 'number' && typeof value === 'string') {
      return value === '' ? null : Number(value);
    }

    if (valueType === 'boolean' && typeof value === 'string') {
      return value === 'true';
    }

    return value;
  }

  private resetFilterDraft(): void {
    this.filterDraft = {};
  }

  private resetEditFilterDraft(): void {
    this.editingFilterId = undefined;
    this.editFilterDraft = {};
  }

  private getEmptyDraftValue(columnKey: string): DataViewFilterValue | undefined {
    const column = this.columns.find((item) => item.key === columnKey);

    return column?.filter?.dropdownType === 'multi' ? [] : undefined;
  }

  private getOperatorOptions(
    config: DataViewFilterColumnConfig
  ): DataViewFilterOperatorOption[] {
    return this.getCompatibleOperators(config).map((operator) => ({
      value: operator,
      label: FILTER_OPERATOR_LABELS[operator]
    }));
  }

  private getCompatibleOperators(
    config: DataViewFilterColumnConfig
  ): DataViewFilterOperator[] {
    return config.operators ?? this.getDefaultCompatibleOperators(config);
  }

  private getDefaultCompatibleOperators(
    config: DataViewFilterColumnConfig
  ): DataViewFilterOperator[] {
    if (config.controlType === 'select' && config.dropdownType !== 'multi') {
      return SINGLE_SELECT_FILTER_OPERATORS;
    }

    return FILTER_OPERATORS_BY_VALUE_TYPE[config.valueType];
  }

  private validateConfiguration(): string | null {
    const duplicateKey = this.findDuplicateColumnKey();

    if (duplicateKey) {
      return `DataView configuration error: duplicate column key "${duplicateKey}".`;
    }

    for (const column of this.columns) {
      const filter = column.filter;

      if (filter) {
        const filterError = this.validateFilterConfiguration(column, filter);

        if (filterError) {
          return filterError;
        }
      }

      if (
        this.processingMode === 'server' &&
        (column.sortable || column.searchable || column.filter) &&
        !column.serverField?.trim()
      ) {
        return `DataView configuration error: column "${column.key}" participates in server processing but has no serverField.`;
      }
    }

    return null;
  }

  private findDuplicateColumnKey(): string | null {
    const seenKeys = new Set<string>();

    for (const column of this.columns) {
      if (seenKeys.has(column.key)) {
        return column.key;
      }

      seenKeys.add(column.key);
    }

    return null;
  }

  private validateFilterConfiguration(
    column: DataViewColumn<T>,
    filter: DataViewFilterColumnConfig
  ): string | null {
    if (!filter.valueType) {
      return `DataView configuration error: filter column "${column.key}" is missing valueType.`;
    }

    if (filter.dropdownType === 'multi' && filter.valueType !== 'stringArray') {
      return `DataView configuration error: multi-select filter column "${column.key}" must use stringArray valueType.`;
    }

    if (filter.controlType === 'select' && (!filter.options || filter.options.length === 0)) {
      return `DataView configuration error: select filter column "${column.key}" must provide options.`;
    }

    const compatibleOperators = this.getDefaultCompatibleOperators(filter);
    const invalidOperator = filter.operators?.find(
      (operator) => !compatibleOperators.includes(operator)
    );

    if (invalidOperator) {
      return `DataView configuration error: operator "${invalidOperator}" is not compatible with column "${column.key}".`;
    }

    return null;
  }

  private pruneFiltersForCurrentColumns(): void {
    const validColumnKeys = new Set(this.columns.map((column) => column.key));

    this.activeFilters = this.activeFilters.filter((filter) =>
      validColumnKeys.has(filter.columnKey)
    );

    if (
      this.filterDraft.columnKey &&
      !validColumnKeys.has(this.filterDraft.columnKey)
    ) {
      this.resetFilterDraft();
    }

    if (
      this.editFilterDraft.columnKey &&
      !validColumnKeys.has(this.editFilterDraft.columnKey)
    ) {
      this.resetEditFilterDraft();
    }
  }

  private createFilterId(): string {
    const filterId = `filter-${this.nextFilterId}`;
    this.nextFilterId += 1;

    return filterId;
  }

  private getColumnByKey(columnKey: string): DataViewColumn<T> | undefined {
    return this.columns.find((column) => column.key === columnKey);
  }

  private buildProcessingState(): DataViewProcessingState {
    const state: DataViewProcessingState = {
      searchTerm: this.searchTerm,
      sort: this.activeSortColumn
        ? {
            columnKey: this.activeSortColumn,
            direction: this.activeSortDirection
          }
        : undefined,
      filters: [...this.activeFilters],
      filterLogic: this.filterLogic
    };

    if (this.isPaginationEnabled) {
      state.pagination = {
        pageIndex: this.pageIndex,
        pageSize: this.pageSize
      };
    }

    return state;
  }

  private processClientSide(
    items: T[],
    _state: DataViewProcessingState
  ): T[] {
    // TODO Phase 2:
    // Apply unified search, sorting, pagination, and filtering using column.value(...).
    // Existing Phase 1 behavior intentionally continues through filteredItems/sortItems.
    return items;
  }

  private processServerSide(_state: DataViewProcessingState): void {
    // TODO Phase 2:
    // Translate column keys through column.serverField and emit/request server-side processing.
    // This component intentionally does not trigger server requests in Phase 1.
  }
}

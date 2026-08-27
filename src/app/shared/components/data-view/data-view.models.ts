import { TemplateRef } from '@angular/core';

export type DataViewMode = 'grid' | 'table';
export type DataViewProcessingMode = 'client' | 'server';
export type DataViewSortDirection = 'asc' | 'desc';

export type DataViewValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | null
  | undefined;

export type DataViewFilterValueType =
  | 'string'
  | 'number'
  | 'date'
  | 'boolean'
  | 'stringArray';

export type DataViewFilterValue =
  | string
  | number
  | boolean
  | Date
  | string[]
  | null;

export type DataViewFilterControlType = 'input' | 'select';
export type DataViewDropdownType = 'single' | 'multi';

export interface DataViewFilterOption {
  label: string;
  value: string | number | boolean;
}

export type DataViewFilterOperator =
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'containsAny'
  | 'containsAll'
  | 'containsNone';

export interface DataViewFilterOperatorOption {
  value: DataViewFilterOperator;
  label: string;
}

export interface DataViewFilterColumnConfig {
  valueType: DataViewFilterValueType;
  controlType?: DataViewFilterControlType;
  dropdownType?: DataViewDropdownType;
  options?: DataViewFilterOption[];
  operators?: DataViewFilterOperator[];
}

export type DataViewFilterLogic = 'and' | 'or';

export interface DataViewFilter {
  id: string;
  columnKey: string;
  operator: DataViewFilterOperator;
  value: DataViewFilterValue;
}

export interface DataViewFilterDraft {
  columnKey?: string;
  operator?: DataViewFilterOperator;
  value?: DataViewFilterValue;
  error?: string;
}

export interface DataViewSortState {
  columnKey: string;
  direction: DataViewSortDirection;
}

export interface DataViewPaginationConfig {
  enabled?: boolean;
  defaultPageSize?: number;
  fastStep?: number;
}

export interface DataViewPaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface DataViewProcessingState {
  searchTerm: string;
  sort?: DataViewSortState;
  filters: DataViewFilter[];
  filterLogic: DataViewFilterLogic;
  pagination?: DataViewPaginationState;
}

export interface DataViewColumn<T> {
  key: string;
  header: string;
  value: (item: T) => DataViewValue;
  sortable?: boolean;
  searchable?: boolean;
  filter?: DataViewFilterColumnConfig;
  serverField?: string;
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

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import {
  DataViewCardConfig,
  DataViewColumn,
  DataViewPaginationConfig
} from './data-view.models';
import {
  DataViewComponent
} from './data-view.component';

interface TestItem {
  name: string;
  status: string;
  score: number;
  enabled: boolean;
  updatedAt: string;
  tags: string[];
}

@Component({
  standalone: true,
  imports: [DataViewComponent],
  template: `
    <aiw-data-view
      [items]="items"
      [columns]="columns"
      [cardConfig]="cardConfig"
      [searchFields]="searchFields"
      [initialViewMode]="initialViewMode"
      [initialSortColumn]="initialSortColumn"
      [initialSortDirection]="initialSortDirection"
      [processingMode]="processingMode"
      [pagination]="pagination"
    />
  `
})
class DataViewHostComponent {
  items: TestItem[] = [
    {
      name: 'Alpha',
      status: 'Active',
      score: 2,
      enabled: true,
      updatedAt: '2026-08-20',
      tags: ['admin', 'sales']
    },
    {
      name: 'Beta',
      status: 'Draft',
      score: 1,
      enabled: false,
      updatedAt: '2026-08-21',
      tags: ['field']
    },
    {
      name: 'Gamma',
      status: 'Archived',
      score: 3,
      enabled: true,
      updatedAt: '2026-08-22',
      tags: ['admin']
    }
  ];
  columns: DataViewColumn<TestItem>[] = [
    {
      key: 'name',
      header: 'Name',
      value: (item) => item.name,
      sortable: true,
      searchable: true,
      serverField: 'name',
      filter: {
        valueType: 'string',
        controlType: 'input'
      }
    },
    {
      key: 'status',
      header: 'Status',
      value: (item) => item.status,
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
      key: 'score',
      header: 'Score',
      value: (item) => item.score,
      sortable: true,
      serverField: 'score',
      filter: {
        valueType: 'number',
        controlType: 'input'
      }
    },
    {
      key: 'enabled',
      header: 'Enabled',
      value: (item) => item.enabled,
      serverField: 'enabled',
      filter: {
        valueType: 'boolean',
        controlType: 'input'
      }
    },
    {
      key: 'updated',
      header: 'Updated',
      value: (item) => new Date(item.updatedAt),
      serverField: 'updatedAt',
      filter: {
        valueType: 'date',
        controlType: 'input'
      }
    },
    {
      key: 'tags',
      header: 'Tags',
      value: (item) => item.tags,
      serverField: 'tags',
      filter: {
        valueType: 'stringArray',
        controlType: 'select',
        dropdownType: 'multi',
        options: [
          { label: 'Admin', value: 'admin' },
          { label: 'Field', value: 'field' },
          { label: 'Sales', value: 'sales' }
        ]
      }
    }
  ];
  cardConfig: DataViewCardConfig<TestItem> = {
    title: (item) => item.name,
    description: (item) => item.status
  };
  searchFields = [(item: TestItem) => item.name];
  initialViewMode: 'grid' | 'table' = 'grid';
  initialSortColumn?: string;
  initialSortDirection: 'asc' | 'desc' = 'asc';
  processingMode: 'client' | 'server' = 'client';
  pagination?: DataViewPaginationConfig;
}

describe('DataViewComponent Phase 1 filtering', () => {
  let fixture: ComponentFixture<DataViewHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataViewHostComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(DataViewHostComponent);
    fixture.detectChanges();
  });

  it('renders in grid mode', () => {
    expect(queryAll('.data-view__card').length).toBe(3);
  });

  it('does not paginate when pagination is not enabled', () => {
    expect(queryAll('.data-view__card').length).toBe(3);
    expect(query('.data-view__pagination')).toBeNull();
  });

  it('renders in table mode', () => {
    fixture.componentInstance.initialViewMode = 'table';
    fixture.detectChanges();

    expect(query('.data-view__table')).not.toBeNull();
  });

  it('preserves existing search behavior', async () => {
    setInputValue('.data-view__search input', 'Beta');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(queryAll('.data-view__card').length).toBe(1);
    expect(text()).toContain('Beta');
    expect(text()).not.toContain('Alpha');
  });

  it('sorts table data using column keys', () => {
    fixture.componentInstance.initialViewMode = 'table';
    fixture.componentInstance.initialSortColumn = 'score';
    fixture.componentInstance.initialSortDirection = 'asc';
    fixture.detectChanges();

    const firstRowText = queryAll('tbody tr')[0].nativeElement.textContent;
    expect(firstRowText).toContain('Beta');
  });

  it('paginates records when enabled', () => {
    fixture.componentInstance.pagination = {
      enabled: true,
      defaultPageSize: 2,
      fastStep: 2
    };
    fixture.detectChanges();

    expect(queryAll('.data-view__card').length).toBe(2);
    expect(text()).toContain('Alpha');
    expect(text()).toContain('Beta');
    expect(text()).not.toContain('Gamma');
    expect(text()).toContain('Showing 1-2 out of 3');

    clickPaginationButton('Next page');

    expect(queryAll('.data-view__card').length).toBe(1);
    expect(text()).toContain('Gamma');
    expect(text()).toContain('Showing 3-3 out of 3');

    clickPaginationButton('Previous page');

    expect(queryAll('.data-view__card').length).toBe(2);
    expect(text()).toContain('Alpha');
  });

  it('uses fast pagination steps and clamps at the result bounds', () => {
    fixture.componentInstance.items = createItems(7);
    fixture.componentInstance.pagination = {
      enabled: true,
      defaultPageSize: 1,
      fastStep: 3
    };
    fixture.detectChanges();

    clickPaginationButton('Move forward 3 pages');

    expect(text()).toContain('Item 4');
    expect(text()).toContain('Showing 4-4 out of 7');

    clickPaginationButton('Move forward 3 pages');
    clickPaginationButton('Move forward 3 pages');

    expect(text()).toContain('Item 7');
    expect(text()).toContain('Showing 7-7 out of 7');

    clickPaginationButton('Move backward 3 pages');

    expect(text()).toContain('Item 4');
  });

  it('goes to a requested page and clamps invalid page requests', () => {
    fixture.componentInstance.items = createItems(5);
    fixture.componentInstance.pagination = {
      enabled: true,
      defaultPageSize: 2,
      fastStep: 2
    };
    fixture.detectChanges();

    setInputValue('.data-view__pagination-page-input', '3');
    fixture.detectChanges();

    expect(text()).toContain('Item 5');
    expect(text()).toContain('Showing 5-5 out of 5');

    setInputValue('.data-view__pagination-page-input', '99');
    fixture.detectChanges();

    expect(text()).toContain('Item 5');
    expect((query('.data-view__pagination-page-input').nativeElement as HTMLInputElement).value)
      .toBe('3');
  });

  it('uses the configured default page size without rendering a rows control', () => {
    fixture.componentInstance.items = createItems(5);
    fixture.componentInstance.pagination = {
      enabled: true,
      defaultPageSize: 3,
      fastStep: 2
    };
    fixture.detectChanges();

    expect(queryAll('.data-view__card').length).toBe(3);
    expect(text()).toContain('Item 1');
    expect(text()).toContain('Showing 1-3 out of 5');
    expect(query('.data-view__pagination-page-size-input')).toBeNull();
  });

  it('resets pagination when searching from a later page', async () => {
    fixture.componentInstance.items = createItems(12);
    fixture.componentInstance.pagination = {
      enabled: true,
      defaultPageSize: 5,
      fastStep: 2
    };
    fixture.detectChanges();
    clickPaginationButton('Next page');

    expect(text()).toContain('Item 6');

    setInputValue('.data-view__search input', 'Item 1');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(text()).toContain('Item 1');
    expect(text()).toContain('Showing 1-4 out of 4');
  });

  it('opens the filter modal without a zero count badge', () => {
    expect(query('.data-view__filter-count')).toBeNull();

    click('.data-view__filter-button');

    expect(query('.data-view__modal--filters')).not.toBeNull();
  });

  it('adds a filter, increments the count, and keeps it after reopen', async () => {
    await addNameContainsFilter('Alpha');

    expect(query('.data-view__filter-count')?.nativeElement.textContent.trim()).toBe('1');

    click('.data-view__modal-close');
    click('.data-view__filter-button');

    expect(text()).toContain('Name');
    expect(text()).toContain('Contains');
    expect(text()).toContain('Alpha');
  });

  it('filters displayed rows with string expressions', async () => {
    await addNameContainsFilter('alp');

    expect(queryAll('.data-view__card').length).toBe(1);
    expect(text()).toContain('Alpha');
    expect(text()).not.toContain('Beta');
    expect(text()).not.toContain('Gamma');
  });

  it('filters displayed rows with numeric expressions', async () => {
    await addInputFilter('score', 'greaterThan', '1');

    expect(queryAll('.data-view__card').length).toBe(2);
    expect(text()).toContain('Alpha');
    expect(text()).not.toContain('Beta');
    expect(text()).toContain('Gamma');
  });

  it('filters displayed rows with single select values', async () => {
    await addSelectFilter('status', 'equals', 'Draft');

    expect(queryAll('.data-view__card').length).toBe(1);
    expect(text()).not.toContain('Alpha');
    expect(text()).toContain('Beta');
    expect(text()).not.toContain('Gamma');
  });

  it('filters displayed rows with multi-select values', async () => {
    await addMultiSelectFilter('tags', 'containsAll', ['Admin', 'Sales']);

    expect(queryAll('.data-view__card').length).toBe(1);
    expect(text()).toContain('Alpha');
    expect(text()).not.toContain('Beta');
    expect(text()).not.toContain('Gamma');
  });

  it('uses OR filter logic when matching displayed rows', async () => {
    openFilters();
    setFilterLogic('or');
    closeFilters();

    await addInputFilter('name', 'equals', 'Alpha');
    await addInputFilter('name', 'equals', 'Beta');

    expect(queryAll('.data-view__card').length).toBe(2);
    expect(text()).toContain('Alpha');
    expect(text()).toContain('Beta');
    expect(text()).not.toContain('Gamma');
  });

  it('enters active filter edit mode and hides the draft row', async () => {
    await addNameContainsFilter('Alpha');
    click('.data-view__filter-edit');

    const activeSelects = queryAll('.data-view__filter-row--active select');

    expect(query('.data-view__filter-row--draft')).toBeNull();
    expect(query('.data-view__filter-row--active').nativeElement.textContent)
      .toContain('Name');
    expect(activeSelects.length).toBe(1);
    expect((activeSelects[0].nativeElement as HTMLSelectElement).disabled).toBeFalse();
    expect(query('.data-view__filter-row--active input')).not.toBeNull();
    expect(query('.data-view__filter-save')).not.toBeNull();
  });

  it('clears draft validation when entering active filter edit mode', async () => {
    await addNameContainsFilter('Alpha');
    click('.data-view__filter-add');

    expect(text()).toContain('Select a column before adding a filter.');

    click('.data-view__filter-edit');

    expect(text()).not.toContain('Select a column before adding a filter.');
  });

  it('saves a valid active filter edit and restores the draft row', async () => {
    await addNameContainsFilter('Alpha');
    click('.data-view__filter-edit');
    setInputValue('.data-view__filter-row--active input', 'Beta');
    fixture.detectChanges();
    await fixture.whenStable();
    click('.data-view__filter-save');

    expect(query('.data-view__filter-save')).toBeNull();
    expect(query('.data-view__filter-row--draft')).not.toBeNull();
    expect(query('.data-view__filter-row--active').nativeElement.textContent)
      .toContain('Beta');
  });

  it('keeps an invalid active filter edit in edit mode until it saves cleanly', async () => {
    await addInputFilter('name', 'equals', 'Alpha');
    await addInputFilter('name', 'contains', 'ph');

    queryAll('.data-view__filter-edit')[1].nativeElement.click();
    fixture.detectChanges();
    setInputValue('.data-view__filter-row--active input', 'zzz');
    fixture.detectChanges();
    await fixture.whenStable();
    click('.data-view__filter-save');

    expect(text()).toContain('This filter conflicts with an existing filter on "Name".');
    expect(query('.data-view__filter-save')).not.toBeNull();
    expect(query('.data-view__filter-row--draft')).toBeNull();

    setInputValue('.data-view__filter-row--active input', 'ph');
    fixture.detectChanges();
    await fixture.whenStable();
    click('.data-view__filter-save');

    expect(text()).not.toContain('This filter conflicts with an existing filter on "Name".');
    expect(query('.data-view__filter-save')).toBeNull();
    expect(query('.data-view__filter-row--draft')).not.toBeNull();
  });

  it('resets the draft row after a filter is added', async () => {
    await addNameContainsFilter('Alpha');

    const draftColumn = queryAll('.data-view__filter-row--draft select')[0]
      .nativeElement as HTMLSelectElement;
    expect(draftColumn.value).toBe('');
  });

  it('shows row-level validation for duplicate filters', () => {
    return addNameContainsFilter('Alpha')
      .then(() => addNameContainsFilter('Alpha'))
      .then(() => {
        expect(text()).toContain('This filter has already been added.');
      });
  });

  it('rejects different equals values on the same column under AND', async () => {
    await addInputFilter('name', 'equals', 'Alpha');
    await addInputFilter('name', 'equals', 'Beta');

    expect(text()).toContain('This filter conflicts with an existing filter on "Name".');
    expect(activeFilterCount()).toBe('1');
  });

  it('allows different equals values on the same column under OR', async () => {
    openFilters();
    setFilterLogic('or');
    closeFilters();

    await addInputFilter('name', 'equals', 'Alpha');
    await addInputFilter('name', 'equals', 'Beta');

    expect(text()).not.toContain('This filter conflicts with an existing filter on "Name".');
    expect(activeFilterCount()).toBe('2');
  });

  it('rejects equals and matching not equals filters', async () => {
    await addInputFilter('name', 'equals', 'Alpha');
    await addInputFilter('name', 'notEquals', 'Alpha');

    expect(text()).toContain('This filter conflicts with an existing filter on "Name".');
    expect(activeFilterCount()).toBe('1');
  });

  it('rejects impossible numeric ranges', async () => {
    await addInputFilter('score', 'greaterThan', '4');
    await addInputFilter('score', 'lessThan', '3');

    expect(text()).toContain('The filters on "Score" create an invalid range.');
    expect(activeFilterCount()).toBe('1');
  });

  it('allows numeric ranges that resolve to one inclusive value', async () => {
    await addInputFilter('score', 'greaterThanOrEqual', '4');
    await addInputFilter('score', 'lessThanOrEqual', '4');

    expect(text()).not.toContain('The filters on "Score" create an invalid range.');
    expect(activeFilterCount()).toBe('2');
  });

  it('detects numeric range conflicts regardless of insertion order', async () => {
    await addInputFilter('score', 'lessThan', '5');
    await addInputFilter('score', 'greaterThan', '10');

    expect(text()).toContain('The filters on "Score" create an invalid range.');
    expect(activeFilterCount()).toBe('1');
  });

  it('rejects equals values outside numeric ranges', async () => {
    await addInputFilter('score', 'equals', '5');
    await addInputFilter('score', 'greaterThan', '6');

    expect(text()).toContain('The filters on "Score" create an invalid range.');
    expect(activeFilterCount()).toBe('1');
  });

  it('rejects impossible date ranges', async () => {
    await addInputFilter('updated', 'greaterThan', '2026-08-20');
    await addInputFilter('updated', 'lessThan', '2026-08-10');

    expect(text()).toContain('The filters on "Updated" create an invalid range.');
    expect(activeFilterCount()).toBe('1');
  });

  it('rejects date equals values outside date ranges', async () => {
    await addInputFilter('updated', 'equals', '2026-08-15');
    await addInputFilter('updated', 'greaterThan', '2026-08-20');

    expect(text()).toContain('The filters on "Updated" create an invalid range.');
    expect(activeFilterCount()).toBe('1');
  });

  it('rejects conflicting starts-with filters', async () => {
    await addInputFilter('name', 'startsWith', 'ABC');
    await addInputFilter('name', 'startsWith', 'XYZ');

    expect(text()).toContain('The starts-with filters on "Name" conflict.');
    expect(activeFilterCount()).toBe('1');
  });

  it('allows compatible nested starts-with filters', async () => {
    await addInputFilter('name', 'startsWith', 'ABC');
    await addInputFilter('name', 'startsWith', 'ABCDE');

    expect(text()).not.toContain('The starts-with filters on "Name" conflict.');
    expect(activeFilterCount()).toBe('2');
  });

  it('rejects conflicting ends-with filters', async () => {
    await addInputFilter('name', 'endsWith', 'ABC');
    await addInputFilter('name', 'endsWith', 'XYZ');

    expect(text()).toContain('The ends-with filters on "Name" conflict.');
    expect(activeFilterCount()).toBe('1');
  });

  it('does not automatically reject starts-with plus ends-with filters', async () => {
    await addInputFilter('name', 'startsWith', 'ABC');
    await addInputFilter('name', 'endsWith', 'XYZ');

    expect(text()).not.toContain('conflict');
    expect(activeFilterCount()).toBe('2');
  });

  it('rejects equals string values that violate existing string expressions', async () => {
    await addInputFilter('name', 'startsWith', 'admin');
    await addInputFilter('name', 'equals', 'configuration');

    expect(text()).toContain('This filter conflicts with an existing filter on "Name".');
    expect(activeFilterCount()).toBe('1');
  });

  it('allows equals string values that satisfy existing string expressions', async () => {
    await addInputFilter('name', 'startsWith', 'conf');
    await addInputFilter('name', 'endsWith', 'tion');
    await addInputFilter('name', 'contains', 'fig');
    await addInputFilter('name', 'equals', 'configuration');

    expect(text()).not.toContain('This filter conflicts with an existing filter on "Name".');
    expect(activeFilterCount()).toBe('4');
  });

  it('rejects contradictory boolean equality filters', async () => {
    await addInputFilter('enabled', 'equals', 'true');
    await addInputFilter('enabled', 'equals', 'false');

    expect(text()).toContain('This filter conflicts with an existing filter on "Enabled".');
    expect(activeFilterCount()).toBe('1');
  });

  it('rejects contains-all values that intersect contains-none values', async () => {
    await addMultiSelectFilter('tags', 'containsAll', ['Admin', 'Field']);
    await addMultiSelectFilter('tags', 'containsNone', ['Field']);

    expect(text()).toContain('This filter conflicts with an existing filter on "Tags".');
    expect(activeFilterCount()).toBe('1');
  });

  it('rejects contains-any values fully prohibited by contains-none', async () => {
    await addMultiSelectFilter('tags', 'containsAny', ['Admin']);
    await addMultiSelectFilter('tags', 'containsNone', ['Admin']);

    expect(text()).toContain('This filter conflicts with an existing filter on "Tags".');
    expect(activeFilterCount()).toBe('1');
  });

  it('allows contains-any when at least one value is not prohibited', async () => {
    await addMultiSelectFilter('tags', 'containsAny', ['Admin', 'Field']);
    await addMultiSelectFilter('tags', 'containsNone', ['Admin']);

    expect(text()).not.toContain('This filter conflicts with an existing filter on "Tags".');
    expect(activeFilterCount()).toBe('2');
  });

  it('does not conflict filters across different columns', async () => {
    await addInputFilter('name', 'equals', 'Alpha');
    await addSelectFilter('status', 'equals', 'Draft');

    expect(text()).not.toContain('This filter conflicts with an existing filter');
    expect(activeFilterCount()).toBe('2');
  });

  it('removes filters and clears all filters', async () => {
    await addNameContainsFilter('Alpha');
    click('.data-view__filter-row--active .data-view__filter-action');

    expect(query('.data-view__filter-count')).toBeNull();

    await addNameContainsFilter('Alpha');
    click('.data-view__filter-footer-button--secondary');

    expect(query('.data-view__filter-count')).toBeNull();
  });

  it('changes operators by selected value type and supports stringArray multi-select config', () => {
    click('.data-view__filter-button');
    selectOption(queryAll('.data-view__filter-row--draft select')[0].nativeElement, 'score');
    fixture.detectChanges();

    expect(text()).toContain('Greater than');

    selectOption(queryAll('.data-view__filter-row--draft select')[0].nativeElement, 'tags');
    fixture.detectChanges();

    expect(text()).toContain('Contains any');
    expect(query('.data-view__filter-row--draft select[multiple]')).not.toBeNull();
  });

  it('limits single select filters to equality operators', () => {
    click('.data-view__filter-button');
    selectOption(queryAll('.data-view__filter-row--draft select')[0].nativeElement, 'status');
    fixture.detectChanges();

    const operatorSelect = queryAll('.data-view__filter-row--draft select')[1]
      .nativeElement as HTMLSelectElement;
    const operatorLabels = Array.from(operatorSelect.options).map((option) =>
      option.textContent?.trim()
    );

    expect(operatorLabels).toEqual([
      'Expression',
      'Equals',
      'Does not equal'
    ]);
  });

  it('adds a single select filter as a primitive value', async () => {
    click('.data-view__filter-button');
    selectOption(queryAll('.data-view__filter-row--draft select')[0].nativeElement, 'status');
    fixture.detectChanges();
    await fixture.whenStable();
    selectOption(queryAll('.data-view__filter-row--draft select')[1].nativeElement, 'equals');
    fixture.detectChanges();
    await fixture.whenStable();
    selectOptionByText(queryAll('.data-view__filter-row--draft select')[2].nativeElement, 'Draft');
    fixture.detectChanges();
    await fixture.whenStable();
    click('.data-view__filter-add');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(text()).toContain('Status');
    expect(text()).toContain('Equals');
    expect(text()).toContain('Draft');
    expect(text()).not.toContain('The filter value is not compatible with this column.');
  });

  it('does not render single select filters with the multiple attribute', () => {
    click('.data-view__filter-button');
    selectOption(queryAll('.data-view__filter-row--draft select')[0].nativeElement, 'status');
    fixture.detectChanges();

    const valueSelect = queryAll('.data-view__filter-row--draft select')[2]
      .nativeElement as HTMLSelectElement;
    expect(valueSelect.multiple).toBeFalse();
  });

  it('retains AND OR filter logic changes', () => {
    click('.data-view__filter-button');
    queryAll('.data-view__filter-logic button')[1].nativeElement.click();
    fixture.detectChanges();
    click('.data-view__modal-close');
    click('.data-view__filter-button');

    expect(queryAll('.data-view__filter-logic button')[1].nativeElement.classList)
      .toContain('data-view__filter-logic-option--active');
  });

  it('shows a configuration error for invalid DataView configuration', () => {
    spyOn(console, 'error');
    fixture.componentInstance.columns = [
      fixture.componentInstance.columns[0],
      {
        ...fixture.componentInstance.columns[0],
        header: 'Duplicate'
      }
    ];
    fixture.detectChanges();

    expect(text()).toContain('duplicate column key "name"');
    expect(console.error).toHaveBeenCalled();
  });

  async function addNameContainsFilter(value: string): Promise<void> {
    await addInputFilter('name', 'contains', value);
  }

  async function addInputFilter(
    columnKey: string,
    operator: string,
    value: string
  ): Promise<void> {
    openFilters();
    selectOption(queryAll('.data-view__filter-row--draft select')[0].nativeElement, columnKey);
    fixture.detectChanges();
    await fixture.whenStable();
    selectOption(queryAll('.data-view__filter-row--draft select')[1].nativeElement, operator);
    await fixture.whenStable();
    setInputValue('.data-view__filter-row--draft input', value);
    fixture.detectChanges();
    await fixture.whenStable();
    click('.data-view__filter-add');
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function addSelectFilter(
    columnKey: string,
    operator: string,
    valueLabel: string
  ): Promise<void> {
    openFilters();
    selectOption(queryAll('.data-view__filter-row--draft select')[0].nativeElement, columnKey);
    fixture.detectChanges();
    await fixture.whenStable();
    selectOption(queryAll('.data-view__filter-row--draft select')[1].nativeElement, operator);
    fixture.detectChanges();
    await fixture.whenStable();
    selectOptionByText(queryAll('.data-view__filter-row--draft select')[2].nativeElement, valueLabel);
    fixture.detectChanges();
    await fixture.whenStable();
    click('.data-view__filter-add');
    fixture.detectChanges();
    await fixture.whenStable();
  }

  async function addMultiSelectFilter(
    columnKey: string,
    operator: string,
    valueLabels: string[]
  ): Promise<void> {
    openFilters();
    selectOption(queryAll('.data-view__filter-row--draft select')[0].nativeElement, columnKey);
    fixture.detectChanges();
    await fixture.whenStable();
    selectOption(queryAll('.data-view__filter-row--draft select')[1].nativeElement, operator);
    fixture.detectChanges();
    await fixture.whenStable();
    selectOptionsByText(queryAll('.data-view__filter-row--draft select')[2].nativeElement, valueLabels);
    fixture.detectChanges();
    await fixture.whenStable();
    click('.data-view__filter-add');
    fixture.detectChanges();
    await fixture.whenStable();
  }

  function openFilters(): void {
    if (!query('.data-view__modal--filters')) {
      click('.data-view__filter-button');
    }
  }

  function closeFilters(): void {
    click('.data-view__modal-close');
  }

  function setFilterLogic(logic: 'and' | 'or'): void {
    const logicButtonIndex = logic === 'and' ? 0 : 1;
    queryAll('.data-view__filter-logic button')[logicButtonIndex].nativeElement.click();
    fixture.detectChanges();
  }

  function activeFilterCount(): string | undefined {
    return query('.data-view__filter-count')?.nativeElement.textContent.trim();
  }

  function query(selector: string) {
    return fixture.debugElement.query(By.css(selector));
  }

  function queryAll(selector: string) {
    return fixture.debugElement.queryAll(By.css(selector));
  }

  function click(selector: string): void {
    query(selector).nativeElement.click();
    fixture.detectChanges();
  }

  function clickPaginationButton(label: string): void {
    const button = queryAll('.data-view__pagination-button').find(
      (item) => (item.nativeElement as HTMLButtonElement).getAttribute('aria-label') === label
    );

    if (!button) {
      throw new Error(`Unable to find pagination button "${label}".`);
    }

    button.nativeElement.click();
    fixture.detectChanges();
  }

  function setInputValue(selector: string, value: string): void {
    const input = query(selector).nativeElement as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  function selectOption(select: HTMLSelectElement, value: string): void {
    select.value = value;
    select.dispatchEvent(new Event('change'));
    select.dispatchEvent(new Event('input'));
  }

  function selectOptionByText(select: HTMLSelectElement, label: string): void {
    const option = Array.from(select.options).find(
      (item) => item.textContent?.trim() === label
    );

    if (!option) {
      throw new Error(`Unable to find select option "${label}".`);
    }

    select.value = option.value;
    select.dispatchEvent(new Event('change'));
    select.dispatchEvent(new Event('input'));
  }

  function selectOptionsByText(
    select: HTMLSelectElement,
    labels: string[]
  ): void {
    const remainingLabels = new Set(labels);

    Array.from(select.options).forEach((option) => {
      option.selected = remainingLabels.delete(option.textContent?.trim() ?? '');
    });

    if (remainingLabels.size > 0) {
      throw new Error(
        `Unable to find select options "${Array.from(remainingLabels).join(', ')}".`
      );
    }

    select.dispatchEvent(new Event('change'));
    select.dispatchEvent(new Event('input'));
  }

  function text(): string {
    return fixture.nativeElement.textContent;
  }

  function createItems(count: number): TestItem[] {
    return Array.from({ length: count }, (_, index) => {
      const itemNumber = index + 1;

      return {
        name: `Item ${itemNumber}`,
        status: itemNumber % 2 === 0 ? 'Draft' : 'Active',
        score: itemNumber,
        enabled: itemNumber % 2 === 1,
        updatedAt: `2026-08-${String(itemNumber).padStart(2, '0')}`,
        tags: itemNumber % 2 === 0 ? ['field'] : ['admin']
      };
    });
  }
});

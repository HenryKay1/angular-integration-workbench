# Data View Component

`DataViewComponent<T>` is the shared records-browser primitive used by the `/records` page. It provides a reusable presentation shell that can render the same dataset in either `grid` or `table` mode while keeping feature-specific rendering details outside the component.

## Current Responsibilities

- render a shared search input
- support `grid` and `table` display modes
- render sortable table columns
- expose Phase 1 filter configuration and filter modal state
- render loading, empty, and no-results states
- emit item activation and optionally navigate through `itemLink`
- host a template-driven detail surface

## Inputs

- `items`: source items to render
- `columns`: table column definitions
- `cardConfig`: grid-card definition
- `searchFields`: field selectors used for built-in client-side search
- `availableViewModes`: allowed modes, defaults to `['grid', 'table']`
- `initialViewMode`: initial selected mode
- `processingMode`: unified future processing mode, either `client` or `server`
- `initialSortColumn`: optional default table sort column key
- `initialSortDirection`: default sort direction
- `isLoading`: loading state flag
- `itemLink`: optional router link resolver for activated items
- `detailTemplate`: optional per-item template rendered as:
  - inline expansion in table mode
  - modal content in grid mode

## Supporting Types

Public contracts live in `data-view.models.ts`.

- `DataViewColumn<T>`: table header/value configuration with optional sorting metadata
- `DataViewCardConfig<T>`: grid card content contract
- `DataViewDetailContext<T>`: template context for detail content
- `DataViewFilterColumnConfig`: per-column filter metadata
- `DataViewFilter`: committed active filter state
- `DataViewFilterDraft`: currently edited draft filter
- `DataViewProcessingState`: future unified search/sort/filter state contract

## Column Contract

Columns use a stable `key` for component state and a display-only `header` for UI text.

```ts
{
  key: 'status',
  header: 'Status',
  value: record => record.status,
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
}
```

`value(item)` is the single client-side value accessor for display, sorting, and future client filtering. `serverField` is the single optional server mapping for future server-side processing.

## Behavior Notes

- Search is client-side and runs against `searchFields`
- Sorting is client-side and only applies to columns marked `sortable`
- Sort identity uses `column.key`, not `column.header`
- Table row expansion is intentionally compact, using a leading expander column
- Grid detail content uses a modal so cards stay visually clean
- The component stays generic by treating detail content as a template slot rather than hardcoded actions
- Phase 1 filters can be created, removed, counted, and reopened, but they do not filter `items` yet

## Phase 1 Filtering

The filter modal maintains two separate states:

- `activeFilters`: committed filters with generated local IDs
- `filterDraft`: the one currently edited draft row

Adding a valid draft appends a committed filter and resets the draft. Closing the modal preserves active filters and the draft state. Committed filters render as read-only summary rows until edited. In edit mode, the filter column is locked, expression/value are editable, the draft row is hidden, and Save validates before updating `activeFilters`. Users can remove individual filters or clear all filters.

The modal supports:

- AND/OR logic selection
- type-aware operator options, with single-select filters limited to `Equals` and `Does not equal`
- input and select controls
- single-select and native multi-select controls
- row-level draft validation for missing fields, incompatible values, incompatible operators, and exact duplicates
- AND-only combination validation for conflicting equality, number/date ranges, clear string contradictions, boolean equality, and string-array include/exclude rules

Configuration validation catches developer errors such as duplicate column keys, invalid select setup, incompatible multi-select types, incompatible operators, and missing `serverField` in server mode for participating columns.

## Phase 2 Seams

`DataViewProcessingState` normalizes current search, sort, filter, and filter-logic state. The component also contains TODO processing seams for future client/server execution.

Phase 1 intentionally does not:

- apply filters to `items`
- emit server processing requests
- translate filters to API DTOs
- replace the existing `searchFields` search path

## Records Usage

`RecordListPageComponent` currently uses this component to:

- display mock-backed records from `RecordService`
- search by title, owner, category, and status
- sort by `Updated` descending by default
- configure Phase 1 filter metadata for title, status, owner, category, and updated date
- navigate to `/records/:id`
- show a quick record preview template with metadata and payload JSON

## Phase 4 Handoff

This component is ready to host richer feature-specific content inside `detailTemplate`. For Phase 4, that means the records feature can swap the current simple preview template for more structured detail content such as:

- summary cards
- timeline/history previews
- JSON viewer or navigator subcomponents

The shared component should continue to own only layout and interaction mechanics, while feature components define the actual content placed inside the template slot.

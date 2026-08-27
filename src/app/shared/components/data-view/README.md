# Data View Component

`DataViewComponent<T>` is the shared records-browser primitive used by the `/records` page. It provides a reusable presentation shell that can render the same dataset in either `grid` or `table` mode while keeping feature-specific rendering details outside the component.

## Current Responsibilities

- render a shared search input
- support `grid` and `table` display modes
- render sortable table columns
- expose Phase 1 filter configuration and filter modal state
- emit processing state for server-backed pages
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
- `processingMode`: processing mode, either `client` or `server`
- `initialSortField`: optional default table sort field name
- `initialSortDirection`: default sort direction
- `pagination`: optional pagination configuration
- `totalItems`: total item count for server-backed pagination
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
- `DataViewProcessingState`: unified search/sort/filter/pagination state contract
- `DataViewResult<T>`: API result shape for server-backed DataView pages

## Column Contract

Columns use a DTO-backed `fieldName` for component state and a display-only `header` for UI text. `fieldName` is typed as a string property from the row item type.

```ts
{
  fieldName: 'status',
  header: 'Status',
  value: record => record.status,
  sortable: true,
  searchable: true,
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

`fieldName` is the processing identity for sort/filter/server requests. `value(item)` is the client-side value accessor for display, sorting, and filtering, which still allows UI formatting while keeping the processing state aligned with DTO property names.

## Behavior Notes

- Search is client-side and runs against `searchFields`
- Sorting is client-side and only applies to columns marked `sortable`
- Sort identity uses `column.fieldName`, not `column.header`
- Table row expansion is intentionally compact, using a leading expander column
- Grid detail content uses a modal so cards stay visually clean
- The component stays generic by treating detail content as a template slot rather than hardcoded actions
- Filters can be created, removed, counted, edited, reopened, and applied to client-side rows

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

Configuration validation catches developer errors such as duplicate field names, invalid select setup, incompatible multi-select types, and incompatible operators.

## Phase 2 Seams

`DataViewProcessingState` normalizes current search, sort, filter, filter-logic, and pagination state using DTO field names. In `server` mode, committed search, sort, filter, filter-logic, and pagination changes emit `processingChanged` so the feature component can call an API and pass the returned page back through `items`.

The component intentionally does not:

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

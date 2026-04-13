# Data View Component

`DataViewComponent<T>` is the shared records-browser primitive used by the `/records` page. It provides a reusable presentation shell that can render the same dataset in either `grid` or `table` mode while keeping feature-specific rendering details outside the component.

## Current Responsibilities

- render a shared search input
- support `grid` and `table` display modes
- render sortable table columns
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
- `initialSortColumn`: optional default table sort column
- `initialSortDirection`: default sort direction
- `isLoading`: loading state flag
- `itemLink`: optional router link resolver for activated items
- `detailTemplate`: optional per-item template rendered as:
  - inline expansion in table mode
  - modal content in grid mode

## Supporting Types

- `DataViewColumn<T>`: table header/value configuration with optional sorting metadata
- `DataViewCardConfig<T>`: grid card content contract
- `DataViewDetailContext<T>`: template context for detail content

## Behavior Notes

- Search is client-side and runs against `searchFields`
- Sorting is client-side and only applies to columns marked `sortable`
- Table row expansion is intentionally compact, using a leading expander column
- Grid detail content uses a modal so cards stay visually clean
- The component stays generic by treating detail content as a template slot rather than hardcoded actions

## Records Usage

`RecordListPageComponent` currently uses this component to:

- display mock-backed records from `RecordService`
- search by title, owner, category, and status
- sort by `Updated` descending by default
- navigate to `/records/:id`
- show a quick record preview template with metadata and payload JSON

## Phase 4 Handoff

This component is ready to host richer feature-specific content inside `detailTemplate`. For Phase 4, that means the records feature can swap the current simple preview template for more structured detail content such as:

- summary cards
- timeline/history previews
- JSON viewer or navigator subcomponents

The shared component should continue to own only layout and interaction mechanics, while feature components define the actual content placed inside the template slot.

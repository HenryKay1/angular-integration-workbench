# Dropdown Field

`DropdownFieldComponent` is a reusable `ControlValueAccessor` for configuration-driven dropdown fields in `FormShellComponent`. It supports standard option selection, optional client-side search, and optional custom "other" values.

## Responsibilities

- Render a form-friendly dropdown trigger and overlay menu
- Support static option lists from field config
- Optionally filter options with a client-side search input
- Optionally accept an "other" free-text value
- Emit structured selection metadata instead of only a primitive value
- Close the menu when a user clicks outside the component
- Integrate with Angular disabled and touched states

## Config

Dropdown fields are configured through `DropdownFieldConfig`:

```ts
{
  key: 'environment',
  label: 'Environment',
  type: 'dropdown',
  required: true,
  searchable: true,
  allowOther: true,
  placeholder: 'Select an environment',
  options: [
    { label: 'Development', value: 'dev' },
    { label: 'QA', value: 'qa' },
    { label: 'Production', value: 'prod' }
  ]
}
```

## Form Value

The component emits `DropdownSelection | null`.

```ts
export interface DropdownSelection {
  selectedKey?: string | number;
  selectedLabel?: string;
  isOther?: boolean;
  otherValue?: string;
}
```

For a configured option, the emitted value looks like:

```ts
{
  selectedKey: 'qa',
  selectedLabel: 'QA',
  isOther: false,
  otherValue: undefined
}
```

For a custom value, the emitted value looks like:

```ts
{
  selectedKey: undefined,
  selectedLabel: 'Other',
  isOther: true,
  otherValue: 'UAT'
}
```

## Search Behavior

When `searchable` is enabled:

- The overlay renders a search input above the option list.
- Filtering is client-side.
- Search matches against option labels.
- The selected value is not changed until an option is clicked.
- The search term is cleared after an option is selected.

## Other Values

When `allowOther` is enabled:

- The overlay renders an "other" input and `Use` button.
- Empty or whitespace-only custom values are blocked.
- Applying a custom value closes the dropdown and emits an `isOther` selection.

## Required Validation

`FormShellComponent` uses a custom dropdown required validator.

A dropdown value is valid when:

- A configured option has a `selectedKey`, or
- An `isOther` value has non-empty `otherValue`

## Save Flow

The dropdown only updates the Angular form control. It does not save data directly. Feature-specific API logic should read the emitted form payload during parent form submission.

## Notes

- `selectedLabel` is stored with `selectedKey` so submitted payloads remain readable.
- `selectedKey` can be a string or number.
- The component intentionally does not fetch remote options; options are supplied by form config.

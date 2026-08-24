# Form Shell Component

`FormShellComponent` renders configuration-driven Angular forms for feature pages. It owns form layout, control creation, validation wiring, runtime field state, and submission events while leaving feature-specific data loading and persistence in the parent component.

## Responsibilities

- Build a reactive form from `FormConfig`
- Render supported field types consistently
- Apply sync and async validators from field config
- Emit a typed form payload on submit
- Emit cancellation separately from submission
- Support sections, collapsible sections, field spacing, field width, and column layout
- Support runtime field rules such as hiding, disabling, clearing, or changing helper text
- Expose a public reset method for parent-driven reset flows

## Basic Usage

```html
<aiw-form-shell
  [config]="formConfig"
  [initialValue]="initialValue"
  submitLabel="Create role"
  (submitForm)="submitRole($event)"
  (cancelForm)="cancel()"
/>
```

The parent component owns API calls and page behavior:

```ts
protected formConfig: FormConfig = {
  fields: [
    {
      key: 'name',
      label: 'Role name',
      type: 'text',
      placeholder: 'Role Name',
      validators: [
        {
          validator: 'required',
          message: 'Role name is required.'
        }
      ]
    }
  ]
};

protected initialValue: FormSubmissionValue = {
  name: ''
};

protected submitRole(value: FormSubmissionValue): void {
  // Feature-specific save logic belongs here.
}
```

## Inputs

- `config`: required `FormConfig` describing layout, fields, validators, and state rules
- `initialValue`: optional starting values keyed by field `key`
- `submitLabel`: optional submit button text

## Outputs

- `submitForm`: emits `FormSubmissionValue` when the form is valid and submitted
- `cancelForm`: emits when the user activates the form cancel action

## Supported Fields

Field config is a discriminated union keyed by `type`.

- `text`
- `textarea`
- `number`
- `checkbox`
- `date`
- `dropdown`
- `image-crop`
- `image-header`
- `file-upload`

Each field uses a stable `key`. The emitted submission payload uses those keys as object properties.

## Validation

Sync validators are resolved through `ValidatorRegistry`.

Common validator names include:

- `required`
- `min`
- `max`
- `minLength`
- `maxLength`
- `email`
- `pattern`

Example:

```ts
{
  key: 'name',
  label: 'Role name',
  type: 'text',
  validators: [
    {
      validator: 'required',
      message: 'Role name is required.'
    },
    {
      validator: 'maxLength',
      value: 120,
      message: 'Role name cannot exceed 120 characters.'
    }
  ]
}
```

## Async Validation

Async validators are feature-owned callbacks. This keeps the shared form shell independent from backend URL structure.

```ts
{
  key: 'name',
  label: 'Role name',
  type: 'text',
  asyncValidators: [
    {
      validator: 'roleNameIsUnique',
      message: 'Role name must be unique.',
      debounceMs: 350,
      validate: (value, context) =>
        this.roleService.roleNameIsUnique(
          String(value ?? ''),
          Number(context.values['roleId']) || null
        )
    }
  ]
}
```

The callback returns:

```ts
{
  isValid: boolean;
  message?: string | null;
}
```

If the async validation call fails, the field is not marked invalid by that validator. Save-time API errors should still be handled by the parent feature.

## Runtime State Rules

`stateRules` let a form react to field values without moving logic into templates.

```ts
stateRules: [
  {
    dependsOn: ['hasAllPermissions'],
    execute: ({ values, fields }) => {
      if (values['hasAllPermissions'] === true) {
        fields.disable('permissions');
        fields.clear('permissions');
        fields.update('permissions', {
          helperText: 'All permissions are granted for this role.'
        });
        return;
      }

      fields.enable('permissions');
      fields.update('permissions', {
        helperText: ''
      });
    }
  }
]
```

Available runtime field operations:

- `hide`
- `show`
- `isHidden`
- `disable`
- `enable`
- `isDisabled`
- `setReadonly`
- `isReadonly`
- `clear`
- `setValue`
- `reset`
- `setOptions`
- `update`

## Reset API

Parent components can reset the form through the public component method:

```ts
@ViewChild(FormShellComponent)
private readonly formShell?: FormShellComponent;
```

```ts
this.formShell?.reset({
  name: '',
  isActive: true
});
```

If no value is supplied, `reset()` uses the current `initialValue`.

Reset rebuilds the form, reapplies runtime rules, closes submit confirmation state, and marks controls pristine and untouched. A common pattern is to clear create forms after a successful add while leaving edit forms unchanged.

## Layout

`FormConfig` supports:

- `formWidth`
- `formAlign`
- `fieldsPerLine`
- `fieldMinWidth`
- `fieldSpacing`
- `sections`
- `requireSubmitConfirmation`
- `submitConfirmationTitle`
- `submitConfirmationMessage`

Fields can use `colSpan`, `align`, `section`, `hidden`, `disabled`, and `helperText` for layout and state.

## Design Notes

- The form shell does not fetch options or save data.
- Feature components should translate submitted values into feature-specific request models.
- Async validation callbacks should live in the feature layer, usually through that feature's service.
- Reusable field components handle control rendering details; `FormShellComponent` coordinates them.

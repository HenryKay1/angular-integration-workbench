# File Upload Field

`FileUploadFieldComponent` is a `ControlValueAccessor` for standard file attachments in the reusable form shell. It complements `ImageHeaderFieldComponent`: image headers own visual header presentation, while file uploads own attachment metadata and file selection.

## Responsibilities

- Add one or more files
- Replace the selected file in single-file mode
- Remove selected files
- Track browser `File` objects and local preview URLs for image files
- Optionally allow assigned filename editing
- Emit form-friendly upload metadata

## Form Value

The component emits:

- `UploadedFileItem | null` in single-file mode
- `UploadedFileItem[] | null` in multi-file mode

Each `UploadedFileItem` includes:

- `id`
- `file`
- `originalName`
- `assignedName`
- `extension`
- `mimeType`
- `sizeBytes`
- `previewUrl`
- `sourceUrl`
- `status`

## Config

Example config:

```ts
{
  key: 'supportingDoc',
  label: 'Supporting file',
  type: 'file-upload',
  required: true,
  accept: '.png,.jpg,.jpeg,.pdf,.doc,.docx,.xls,.xlsx',
  allowAssignedFilename: true
}
```

## Save Flow

The component only updates the Angular form control. It does not upload or persist files directly. Feature-specific API save logic should read the submitted form payload and decide how files are sent to the backend.

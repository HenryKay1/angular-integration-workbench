# Image Header Field

`ImageHeaderFieldComponent` is a form-control component for configuring a visual image header inside the reusable form shell. It supports single-image and multi-image workflows, shared header layout settings, per-image display names, and lightweight crop controls.

The component implements `ControlValueAccessor`, so it updates the Angular form value only when the modal draft is saved. API persistence remains owned by the parent form submit flow.

## Responsibilities

- Add, replace, and delete image header items
- Support single-image and multi-image draft editing
- Show a thumbnail rail for selecting the active image in multi-image mode
- Apply shared header layout settings across all images
- Store per-image crop settings for zoom and offsets
- Emit either one `ImageHeaderValue`, an array of `ImageHeaderValue`, or `null`
- Revoke local blob preview URLs when draft or saved images are removed

## Form Value

The component emits:

- `ImageHeaderValue | null` when multi-image mode is off
- `ImageHeaderValue[] | null` when multi-image mode is on

Each `ImageHeaderValue` extends `UploadedFileItem` and includes:

- `file`: selected browser `File`
- `originalName`: original uploaded filename
- `assignedName`: optional display name shown under the saved image
- `extension`, `mimeType`, `sizeBytes`
- `previewUrl`: local object URL for browser preview
- `position`: `left`, `center`, or `right`
- `shape`: `circle`, `rectangle`, `square`, or `triangle`
- `size`: backward-compatible `sm`, `md`, or `lg`
- `frameSizePx`: shared rendered frame size
- `crop`: `{ zoom, offsetX, offsetY }`
- `displayMode`: `scroll` or `slideshow`
- `itemsPerPage`: slideshow page size
- `slideshowIntervalSeconds`: slideshow rotation interval

## Shared Header Settings

These settings are applied to every image in the header when the modal is saved:

- Position
- Shape
- Frame size
- Display mode
- Items per page
- Slideshow interval

The component stores these shared settings on each emitted image item for simple serialization. At render time, the first visible item is treated as the source for group-level display settings.

## Per-Image Settings

These settings belong to the selected image:

- Display name
- File replacement
- Crop zoom
- Crop horizontal offset
- Crop vertical offset

The thumbnail rail selects which image is active for editing. Clicking a thumbnail should select the image only; it should not remove or reset the image.

## Crop Behavior

Crop is visual and non-destructive. The original selected file is not modified.

- `zoom`: clamps between `0.5` and `3`
- `offsetX`: clamps between `-50` and `50`
- `offsetY`: clamps between `-50` and `50`

The rendered image transform is:

```css
transform: translate(offsetX, offsetY) scale(zoom);
```

The reset control restores the active image crop to:

```ts
{ zoom: 1, offsetX: 0, offsetY: 0 }
```

## Modal Sections

The editor modal is organized into three sections:

- **Image**: multi toggle, display name, replace/add/delete, and file metadata
- **Layout**: position, shape, frame size, display mode, per page, and interval
- **Crop**: zoom, horizontal offset, vertical offset, and reset

`Save image header` commits the draft into the form control. `Cancel` and `Close` discard draft-only changes and restore the saved form value.

## Single vs Multiple

Single mode emits only the active image. Multiple mode emits the full image list.

When switching from multiple to single mode, the component asks for confirmation if more than one image is currently in the draft. If confirmed, it keeps the selected image and removes the others from the draft.

## Form Shell Integration

`FormShellComponent` renders the first visible `image-header` field above the rest of the form content. This keeps image header presentation visually separate from standard inline fields.

Example config:

```ts
{
  key: 'heroImage',
  label: 'Image header',
  type: 'image-header',
  accept: 'image/*',
  shape: 'circle',
  size: 'md',
  frameSizePx: 80,
  defaultPosition: 'center',
  multiple: true,
  showLabels: true
}
```

## Save Flow

The component is submit-button friendly:

1. User edits image settings in the modal.
2. User clicks `Save image header`.
3. The component writes the draft to the Angular form control.
4. The parent form emits the full payload on submit.
5. Feature-specific save/API logic handles persistence outside this component.

## Notes

- `size` remains as a compatibility fallback for older configs.
- `frameSizePx` is preferred for new configs.
- Image resizing/compression is intentionally not handled here.
- Existing local SVG templates are used for action icons to match the component style.

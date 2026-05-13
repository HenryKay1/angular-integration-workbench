import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { UploadedFileItem } from '../form-shell/form-config.model';

@Component({
  selector: 'aiw-file-upload-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadFieldComponent),
      multi: true
    }
  ],
  template: `
    <div class="file-upload" [class.file-upload--disabled]="disabled">
      <div class="file-upload__toolbar">
        <label class="file-upload__pick-button">
          <input
            type="file"
            class="file-upload__native-input"
            [attr.accept]="accept || null"
            [attr.multiple]="multiple ? '' : null"
            [disabled]="disabled || reachedMaxFiles"
            (change)="handleFileSelection($event)"
          />
          <span>{{ reachedMaxFiles ? 'Max files reached' : pickButtonLabel }}</span>
        </label>

        <p class="file-upload__meta" *ngIf="items.length > 0">
          {{ items.length }} file(s) ready
        </p>
      </div>

      <p *ngIf="items.length === 0" class="file-upload__empty">
        No files selected yet.
      </p>

      <div class="file-upload__list" *ngIf="items.length > 0">
        <article
          *ngFor="let item of items; trackBy: trackItemById"
          class="file-upload__card"
        >
          <div class="file-upload__badge">{{ item.extension || 'FILE' }}</div>

          <div class="file-upload__details">
            <label class="file-upload__field" *ngIf="allowAssignedFilename">
              <span>Assigned filename</span>
              <input
                type="text"
                [disabled]="disabled"
                [ngModel]="item.assignedName || item.originalName"
                (ngModelChange)="updateAssignedName(item.id, $event)"
              />
            </label>

            <div class="file-upload__copy">
              <strong [title]="item.originalName">{{ item.originalName }}</strong>
              <span>{{ item.mimeType || 'Unknown type' }} . {{ formatFileSize(item.sizeBytes) }}</span>
            </div>
          </div>

          <div class="file-upload__actions">
            <button
              type="button"
              class="file-upload__action"
              [disabled]="disabled"
              (click)="previewItem(item)"
            >
              Preview
            </button>

            <button
              type="button"
              class="file-upload__action file-upload__action--ghost"
              [disabled]="disabled"
              (click)="removeItem(item.id)"
            >
              Remove
            </button>
          </div>
        </article>
      </div>
    </div>

    <div
      *ngIf="activePreview"
      class="file-upload__modal-backdrop"
      (click)="closePreview()"
    >
      <section class="file-upload__modal" (click)="$event.stopPropagation()">
        <header class="file-upload__modal-header">
          <div>
            <h3 [title]="activePreview.originalName">{{ activePreview.originalName }}</h3>
            <p>{{ activePreview.mimeType || 'Unknown type' }}</p>
          </div>
          <button
            type="button"
            class="file-upload__action file-upload__action--ghost"
            (click)="closePreview()"
          >
            Close
          </button>
        </header>

        <div class="file-upload__modal-body">
          <img
            *ngIf="isImage(activePreview)"
            [src]="activePreview.previewUrl"
            [alt]="activePreview.originalName"
          />

          <object
            *ngIf="isPdf(activePreview)"
            [data]="activePreview.previewUrl"
            type="application/pdf"
          ></object>

          <pre *ngIf="isText(activePreview)">{{ activePreviewText }}</pre>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .file-upload {
      display: grid;
      gap: 0.9rem;
      min-width: 0;
    }

    .file-upload--disabled {
      opacity: 0.72;
    }

    .file-upload__toolbar {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .file-upload__pick-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.8rem 1rem;
      border: 1px solid #0f766e;
      border-radius: 0.8rem;
      background: #f0fdfa;
      color: #134e4a;
      cursor: pointer;
      font: inherit;
      font-weight: 700;
      overflow: hidden;
    }

    .file-upload__native-input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }

    .file-upload__meta,
    .file-upload__empty {
      margin: 0;
      color: #52606d;
      font-size: 0.92rem;
    }

    .file-upload__list {
      display: grid;
      gap: 0.85rem;
    }

    .file-upload__card {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      gap: 0.9rem;
      align-items: start;
      padding: 0.95rem;
      border: 1px solid #d9e2ec;
      border-radius: 0.9rem;
      background: #f8fafc;
    }

    .file-upload__badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 3.5rem;
      padding: 0.55rem 0.65rem;
      border-radius: 0.7rem;
      background: #102a43;
      color: #f0f4f8;
      font-size: 0.8rem;
      font-weight: 800;
      letter-spacing: 0.06em;
    }

    .file-upload__details,
    .file-upload__field,
    .file-upload__copy {
      display: grid;
      gap: 0.35rem;
      min-width: 0;
    }

    .file-upload__field {
      color: #243b53;
      font-weight: 600;
    }

    .file-upload__field input {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1px solid #bcccdc;
      border-radius: 0.7rem;
      background: #ffffff;
      color: #102a43;
      font: inherit;
    }

    .file-upload__copy strong,
    .file-upload__copy span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .file-upload__copy strong {
      color: #102a43;
    }

    .file-upload__copy span {
      color: #52606d;
      font-size: 0.9rem;
    }

    .file-upload__actions {
      display: flex;
      gap: 0.65rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .file-upload__action {
      border: 0;
      border-radius: 999px;
      padding: 0.6rem 0.9rem;
      background: #0f766e;
      color: #ffffff;
      cursor: pointer;
      font: inherit;
      font-weight: 700;
    }

    .file-upload__action--ghost {
      border: 1px solid #bcccdc;
      background: #ffffff;
      color: #102a43;
    }

    .file-upload__modal-backdrop {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      background: rgba(15, 23, 42, 0.45);
      z-index: 1000;
    }

    .file-upload__modal {
      width: min(100%, 60rem);
      max-height: min(90vh, 50rem);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 1rem;
      background: #ffffff;
      box-shadow: 0 32px 80px rgba(15, 23, 42, 0.24);
    }

    .file-upload__modal-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: start;
    }

    .file-upload__modal-header h3,
    .file-upload__modal-header p {
      margin: 0;
    }

    .file-upload__modal-header p {
      color: #52606d;
    }

    .file-upload__modal-body {
      min-height: 16rem;
      overflow: auto;
      border-radius: 0.85rem;
      background: #f8fafc;
    }

    .file-upload__modal-body img,
    .file-upload__modal-body object {
      width: 100%;
      min-height: 24rem;
      display: block;
      border: 0;
    }

    .file-upload__modal-body pre {
      margin: 0;
      padding: 1rem;
      white-space: pre-wrap;
      word-break: break-word;
      color: #102a43;
      font: inherit;
    }

    @media (max-width: 720px) {
      .file-upload__card {
        grid-template-columns: 1fr;
      }

      .file-upload__actions {
        justify-content: start;
      }
    }
  `]
})
export class FileUploadFieldComponent implements ControlValueAccessor, OnDestroy {
  @Input() multiple = false;
  @Input() maxFiles?: number;
  @Input() accept?: string;
  @Input() allowAssignedFilename = true;

  protected items: UploadedFileItem[] = [];
  protected disabled = false;
  protected activePreview: UploadedFileItem | null = null;
  protected activePreviewText = '';

  private onChange: (value: UploadedFileItem[] | UploadedFileItem | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected get pickButtonLabel(): string {
    return this.multiple ? 'Upload files' : 'Upload file';
  }

  protected get reachedMaxFiles(): boolean {
    return this.maxFiles !== undefined && this.items.length >= this.maxFiles;
  }

  writeValue(value: UploadedFileItem[] | UploadedFileItem | null): void {
    this.revokePreviewUrls();

    if (!value) {
      this.items = [];
      this.closePreview();
      return;
    }

    const nextItems = Array.isArray(value) ? value : [value];
    this.items = nextItems.map((item) => ({
      ...item,
      previewUrl: item.previewUrl || item.sourceUrl || (item.file ? URL.createObjectURL(item.file) : undefined)
    }));
  }

  registerOnChange(fn: (value: UploadedFileItem[] | UploadedFileItem | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnDestroy(): void {
    this.revokePreviewUrls();
  }

  protected handleFileSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFiles = Array.from(input.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    const availableSlots = this.maxFiles === undefined
      ? selectedFiles.length
      : Math.max(this.maxFiles - this.items.length, 0);
    const filesToAdd = selectedFiles.slice(0, this.multiple ? availableSlots : 1);

    const newItems = filesToAdd.map((file) => this.createItem(file));
    this.items = this.multiple ? [...this.items, ...newItems] : newItems;
    input.value = '';
    this.emitValue();
  }

  protected updateAssignedName(itemId: string, assignedName: string): void {
    this.items = this.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            assignedName
          }
        : item
    );

    if (this.activePreview?.id === itemId) {
      this.activePreview = this.items.find((item) => item.id === itemId) ?? null;
    }

    this.emitValue();
  }

  protected previewItem(item: UploadedFileItem): void {
    if (!item.previewUrl) {
      return;
    }

    if (this.isImage(item) || this.isPdf(item)) {
      this.activePreview = item;
      this.activePreviewText = '';
      return;
    }

    if (this.isText(item) && item.file) {
      this.activePreview = item;
      item.file.text().then((content) => {
        if (this.activePreview?.id === item.id) {
          this.activePreviewText = content;
        }
      });
      return;
    }

    window.open(item.previewUrl, '_blank', 'noopener');
  }

  protected closePreview(): void {
    this.activePreview = null;
    this.activePreviewText = '';
  }

  protected removeItem(itemId: string): void {
    const removedItem = this.items.find((item) => item.id === itemId);

    if (removedItem?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(removedItem.previewUrl);
    }

    this.items = this.items.filter((item) => item.id !== itemId);

    if (this.activePreview?.id === itemId) {
      this.closePreview();
    }

    this.emitValue();
  }

  protected trackItemById(_: number, item: UploadedFileItem): string {
    return item.id;
  }

  protected isImage(item: UploadedFileItem): boolean {
    return item.mimeType.startsWith('image/');
  }

  protected isPdf(item: UploadedFileItem): boolean {
    return item.mimeType === 'application/pdf' || item.extension === 'PDF';
  }

  protected isText(item: UploadedFileItem): boolean {
    return item.mimeType.startsWith('text/');
  }

  protected formatFileSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  private emitValue(): void {
    const value = this.multiple ? this.items : this.items[0] ?? null;
    this.onChange(value);
    this.onTouched();
  }

  private createItem(file: File): UploadedFileItem {
    return {
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      originalName: file.name,
      assignedName: file.name,
      extension: this.getExtension(file.name),
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      previewUrl: URL.createObjectURL(file),
      status: 'new'
    };
  }

  private getExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()!.toUpperCase() : 'FILE';
  }

  private revokePreviewUrls(): void {
    this.items.forEach((item) => {
      if (item.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  }
}

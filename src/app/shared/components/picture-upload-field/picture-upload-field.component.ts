import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  forwardRef
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { UploadedImageItem } from '../form-shell/form-config.model';

@Component({
  selector: 'aiw-picture-upload-field',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PictureUploadFieldComponent),
      multi: true
    }
  ],
  template: `
    <div class="picture-upload" [class.picture-upload--disabled]="disabled">
      <div class="picture-upload__toolbar">
        <label class="picture-upload__pick-button">
          <input
            type="file"
            class="picture-upload__native-input"
            [attr.accept]="accept || null"
            [attr.multiple]="multiple ? '' : null"
            [disabled]="disabled || reachedMaxFiles"
            (change)="handleFileSelection($event)"
          />
          <span>{{ reachedMaxFiles ? 'Max files reached' : pickButtonLabel }}</span>
        </label>

        <p class="picture-upload__meta" *ngIf="items.length > 0">
          {{ items.length }} file(s) selected
        </p>
      </div>

      <p *ngIf="items.length === 0" class="picture-upload__empty">
        No images selected yet.
      </p>

      <div
        *ngIf="items.length > 0"
        class="picture-upload__preview-grid"
        [class.picture-upload__preview-grid--single]="!multiple"
      >
        <article
          *ngFor="let item of items; trackBy: trackItemById"
          class="picture-upload__preview-card"
        >
          <div
            class="picture-upload__preview-frame"
            [class.picture-upload__preview-frame--circle]="previewShape === 'circle'"
            [style.aspect-ratio]="previewShape === 'rect' ? (aspectRatio || '4 / 3') : null"
          >
            <img
              *ngIf="item.previewUrl"
              [src]="item.previewUrl"
              [alt]="item.file.name"
            />
          </div>

          <div class="picture-upload__details">
            <div class="picture-upload__file-copy">
              <strong [title]="item.file.name">{{ item.file.name }}</strong>
              <span>{{ formatFileSize(item.file.size) }}</span>
            </div>

            <button
              type="button"
              class="picture-upload__remove-button"
              [disabled]="disabled"
              (click)="removeItem(item.id)"
            >
              Remove
            </button>
          </div>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .picture-upload {
      display: grid;
      gap: 0.9rem;
      min-width: 0;
    }

    .picture-upload--disabled {
      opacity: 0.72;
    }

    .picture-upload__toolbar {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .picture-upload__pick-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.8rem 1rem;
      border: 1px solid #bcccdc;
      border-radius: 0.7rem;
      background: #ffffff;
      color: #102a43;
      cursor: pointer;
      font: inherit;
      font-weight: 600;
      overflow: hidden;
    }

    .picture-upload__native-input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }

    .picture-upload__meta,
    .picture-upload__empty {
      margin: 0;
      color: #52606d;
      font-size: 0.92rem;
    }

    .picture-upload__preview-grid {
      display: grid;
      gap: 0.85rem;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }

    .picture-upload__preview-grid--single {
      grid-template-columns: minmax(0, 1fr);
    }

    .picture-upload__preview-card {
      display: grid;
      gap: 0.75rem;
      padding: 0.85rem;
      border: 1px solid #d9e2ec;
      border-radius: 0.85rem;
      background: #f8fafc;
    }

    .picture-upload__preview-frame {
      display: grid;
      place-items: center;
      width: 100%;
      min-height: 10rem;
      overflow: hidden;
      border-radius: 0.9rem;
      background: linear-gradient(180deg, #f0f4f8, #d9e2ec);
    }

    .picture-upload__preview-frame--circle {
      width: min(12rem, 100%);
      aspect-ratio: 1;
      border-radius: 999px;
      margin-inline: auto;
    }

    .picture-upload__preview-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .picture-upload__details {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: start;
    }

    .picture-upload__file-copy {
      display: grid;
      gap: 0.2rem;
      min-width: 0;
    }

    .picture-upload__file-copy strong,
    .picture-upload__file-copy span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .picture-upload__file-copy strong {
      color: #102a43;
    }

    .picture-upload__file-copy span {
      color: #52606d;
      font-size: 0.88rem;
    }

    .picture-upload__remove-button {
      border: 1px solid #bcccdc;
      border-radius: 999px;
      padding: 0.55rem 0.85rem;
      background: #ffffff;
      color: #102a43;
      cursor: pointer;
      font: inherit;
      font-weight: 600;
      flex: 0 0 auto;
    }
  `]
})
export class PictureUploadFieldComponent implements ControlValueAccessor, OnDestroy {
  @Input() multiple = false;
  @Input() previewShape: 'circle' | 'rect' = 'rect';
  @Input() aspectRatio?: string;
  @Input() maxFiles?: number;
  @Input() accept?: string;

  protected items: UploadedImageItem[] = [];
  protected disabled = false;

  private onChange: (value: UploadedImageItem[] | UploadedImageItem | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected get pickButtonLabel(): string {
    return this.multiple ? 'Choose images' : 'Choose image';
  }

  protected get reachedMaxFiles(): boolean {
    return this.maxFiles !== undefined && this.items.length >= this.maxFiles;
  }

  writeValue(value: UploadedImageItem[] | UploadedImageItem | null): void {
    this.revokePreviewUrls();

    if (!value) {
      this.items = [];
      return;
    }

    const nextItems = Array.isArray(value) ? value : [value];
    this.items = nextItems.map((item) => ({
      ...item,
      previewUrl: item.previewUrl || URL.createObjectURL(item.file)
    }));
  }

  registerOnChange(fn: (value: UploadedImageItem[] | UploadedImageItem | null) => void): void {
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

    const newItems = filesToAdd.map((file) => ({
      id: this.createItemId(file),
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'new' as const
    }));

    this.items = this.multiple ? [...this.items, ...newItems] : newItems;
    input.value = '';
    this.emitValue();
  }

  protected removeItem(itemId: string): void {
    const removedItem = this.items.find((item) => item.id === itemId);

    if (removedItem?.previewUrl) {
      URL.revokeObjectURL(removedItem.previewUrl);
    }

    this.items = this.items.filter((item) => item.id !== itemId);
    this.emitValue();
  }

  protected trackItemById(_: number, item: UploadedImageItem): string {
    return item.id;
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

  private createItemId(file: File): string {
    return `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private revokePreviewUrls(): void {
    this.items.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  }
}

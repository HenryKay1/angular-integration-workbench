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
  templateUrl: './file-upload-field.component.html',
  styleUrl: './file-upload-field.component.css'
})
export class FileUploadFieldComponent implements ControlValueAccessor, OnDestroy {
  @Input() label?: string;
  @Input() multiple = false;
  @Input() maxFiles?: number;
  @Input() accept?: string;
  @Input() allowAssignedFilename = true;

  protected items: UploadedFileItem[] = [];
  protected disabled = false;

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

  protected downloadItem(item: UploadedFileItem): void {
    if (!item.previewUrl) {
      return;
    }

    const link = document.createElement('a');
    link.href = item.previewUrl;
    link.download = item.originalName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  protected removeItem(itemId: string): void {
    const removedItem = this.items.find((item) => item.id === itemId);

    if (removedItem?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(removedItem.previewUrl);
    }

    this.items = this.items.filter((item) => item.id !== itemId);

    this.emitValue();
  }

  protected trackItemById(_: number, item: UploadedFileItem): string {
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

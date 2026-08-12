import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  ImageCropSettings,
  ImageCropShape,
  ImageCropValue
} from '../form-shell/form-config.model';

@Component({
  selector: 'aiw-image-crop-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageCropFieldComponent),
      multi: true
    }
  ],
  templateUrl: './image-crop-field.component.html',
  styleUrl: './image-crop-field.component.css'
})
export class ImageCropFieldComponent implements ControlValueAccessor, OnDestroy {
  @Input() accept?: string;
  @Input() shape: ImageCropShape = 'circle';
  @Input() frameSizePx = 96;
  @Input() minFrameSizePx = 72;
  @Input() maxFrameSizePx = 360;
  @Input() rectangleAspectRatio = '4 / 3';
  @Input() showFrame = true;

  protected readonly shapeOptions: Array<{ value: ImageCropShape; label: string }> = [
    { value: 'circle', label: 'Circle' },
    { value: 'square', label: 'Square' },
    { value: 'rectangle', label: 'Rectangle' },
    { value: 'triangle', label: 'Triangle' }
  ];
  protected value: ImageCropValue | null = null;
  protected crop: ImageCropSettings = this.defaultCrop();
  protected disabled = false;
  protected isEditorOpen = false;

  private onChange: (value: ImageCropValue | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected get resolvedMinFrameSizePx(): number {
    return this.normalizeFrameSize(this.minFrameSizePx, 48, 480);
  }

  protected get resolvedMaxFrameSizePx(): number {
    return Math.max(
      this.normalizeFrameSize(this.maxFrameSizePx, 48, 480),
      this.resolvedMinFrameSizePx
    );
  }

  protected get imageTransform(): string {
    return `translate(${this.crop.offsetX}%, ${this.crop.offsetY}%) scale(${this.crop.zoom})`;
  }

  protected get surfaceActionLabel(): string {
    return this.value ? 'Edit image' : 'Choose image';
  }

  writeValue(value: ImageCropValue | null): void {
    this.revokePreviewUrl(this.value);

    if (!value) {
      this.value = null;
      this.crop = this.defaultCrop();
      this.shape = this.normalizeShape(this.shape);
      this.frameSizePx = this.normalizeFrameSize(this.frameSizePx);
      this.showFrame = !!this.showFrame;
      return;
    }

    const normalizedValue = this.normalizeValue(value);
    this.value = normalizedValue;
    this.shape = normalizedValue.shape;
    this.frameSizePx = normalizedValue.frameSizePx;
    this.showFrame = normalizedValue.showFrame;
    this.crop = normalizedValue.crop;
  }

  registerOnChange(fn: (value: ImageCropValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;

    if (isDisabled) {
      this.isEditorOpen = false;
    }
  }

  ngOnDestroy(): void {
    this.revokePreviewUrl(this.value);
  }

  protected openEditor(): void {
    if (this.disabled) {
      return;
    }

    this.isEditorOpen = true;
  }

  protected closeEditor(): void {
    this.isEditorOpen = false;
    this.onTouched();
  }

  protected handleFileSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.revokePreviewUrl(this.value);
    this.value = this.createValueFromFile(file);
    input.value = '';
    this.emitValue();
  }

  protected removeImage(): void {
    this.revokePreviewUrl(this.value);
    this.value = null;
    this.crop = this.defaultCrop();
    this.emitValue();
  }

  protected updateShape(value: ImageCropShape | string): void {
    this.shape = this.normalizeShape(value);
    this.emitValue();
  }

  protected updateShowFrame(value: boolean): void {
    this.showFrame = !!value;
    this.emitValue();
  }

  protected updateFrameSize(value: string | number): void {
    this.frameSizePx = this.normalizeFrameSize(value);
    this.emitValue();
  }

  protected updateCrop(key: keyof ImageCropSettings, value: string | number): void {
    this.crop = this.normalizeCrop({
      ...this.crop,
      [key]: Number(value)
    });
    this.emitValue();
  }

  protected resetCrop(): void {
    this.crop = this.defaultCrop();
    this.emitValue();
  }

  private emitValue(): void {
    if (!this.value) {
      this.onChange(null);
      this.onTouched();
      return;
    }

    this.value = {
      ...this.value,
      shape: this.shape,
      frameSizePx: this.frameSizePx,
      showFrame: this.showFrame,
      crop: this.crop,
      rectangleAspectRatio: this.rectangleAspectRatio
    };
    this.onChange(this.value);
    this.onTouched();
  }

  private createValueFromFile(file: File): ImageCropValue {
    return {
      id: this.createItemId(file),
      file,
      originalName: file.name,
      extension: this.getExtension(file.name),
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      previewUrl: URL.createObjectURL(file),
      sourceUrl: undefined,
      status: 'new',
      shape: this.shape,
      frameSizePx: this.frameSizePx,
      showFrame: this.showFrame,
      crop: this.crop,
      rectangleAspectRatio: this.rectangleAspectRatio
    };
  }

  private normalizeValue(value: ImageCropValue): ImageCropValue {
    const crop = this.normalizeCrop(value.crop);

    return {
      ...value,
      previewUrl: value.previewUrl || value.sourceUrl || (value.file ? URL.createObjectURL(value.file) : undefined),
      shape: this.normalizeShape(value.shape ?? this.shape),
      frameSizePx: this.normalizeFrameSize(value.frameSizePx ?? this.frameSizePx),
      showFrame: value.showFrame ?? this.showFrame,
      crop,
      rectangleAspectRatio: value.rectangleAspectRatio ?? this.rectangleAspectRatio
    };
  }

  private normalizeShape(shape: ImageCropShape | string): ImageCropShape {
    if (shape === 'square' || shape === 'rectangle' || shape === 'triangle') {
      return shape;
    }

    return 'circle';
  }

  private normalizeFrameSize(value: string | number, min = this.resolvedMinFrameSizePx, max = this.resolvedMaxFrameSizePx): number {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return 96;
    }

    return Math.min(Math.max(Math.round(parsedValue), min), max);
  }

  private defaultCrop(): ImageCropSettings {
    return {
      zoom: 1,
      offsetX: 0,
      offsetY: 0
    };
  }

  private normalizeCrop(crop: Partial<ImageCropSettings> | undefined): ImageCropSettings {
    const zoom = Number(crop?.zoom);
    const offsetX = Number(crop?.offsetX);
    const offsetY = Number(crop?.offsetY);

    return {
      zoom: Number.isFinite(zoom) ? Math.min(Math.max(Number(zoom.toFixed(2)), 0.5), 3) : 1,
      offsetX: Number.isFinite(offsetX) ? Math.min(Math.max(Math.round(offsetX), -50), 50) : 0,
      offsetY: Number.isFinite(offsetY) ? Math.min(Math.max(Math.round(offsetY), -50), 50) : 0
    };
  }

  private getExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()!.toUpperCase() : 'IMG';
  }

  private createItemId(file: File): string {
    return `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private revokePreviewUrl(value: ImageCropValue | null): void {
    if (value?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(value.previewUrl);
    }
  }
}

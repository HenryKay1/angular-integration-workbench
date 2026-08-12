import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  ImageCropSettings,
  ImageHeaderDisplayMode,
  ImageHeaderItemsPerPage,
  ImageHeaderPosition,
  ImageHeaderShape,
  ImageHeaderSize,
  ImageHeaderValue
} from '../form-shell/form-config.model';

@Component({
  selector: 'aiw-image-header-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ImageHeaderFieldComponent),
      multi: true
    }
  ],
  templateUrl: './image-header-field.component.html',
  styleUrl: './image-header-field.component.css'
})
export class ImageHeaderFieldComponent implements ControlValueAccessor, OnDestroy, AfterViewInit {
  @Input() accept?: string;
  @Input() defaultPosition: ImageHeaderPosition = 'center';
  @Input() profileType = false;
  @Input() size: ImageHeaderSize = 'md';
  @Input() frameSizePx?: number;
  @Input() multiple = false;
  @Input() maxFiles?: number;
  @Input() showLabels = true;
  @Input() shape: ImageHeaderShape = 'rectangle';
  @Input() displayMode?: ImageHeaderDisplayMode;
  @Input() itemsPerPage: ImageHeaderItemsPerPage = 4;
  @Input() slideshowIntervalSeconds = 5;

  protected readonly uploadIconImageSrc = 'assets/images/icons/image-header-multi-upload.svg';
  protected readonly placeholderImageSrc = 'assets/images/placeholders/images.png';

  protected items: ImageHeaderValue[] = [];
  protected editorItems: ImageHeaderValue[] = [];
  protected disabled = false;
  protected isEditorOpen = false;
  protected isHeaderScrollable = false;
  protected activeIndex: number | null = null;
  protected allowMultiple = false;
  protected pendingAssignedName = '';
  protected editorPosition: ImageHeaderPosition = 'center';
  protected editorShape: ImageHeaderShape = 'rectangle';
  protected editorSize: ImageHeaderSize = 'md';
  protected editorFrameSizePx = 80;
  protected editorDisplayMode: ImageHeaderDisplayMode = 'slideshow';
  protected editorItemsPerPage: ImageHeaderItemsPerPage = 4;
  protected editorSlideshowIntervalSeconds = 5;
  protected displayPageIndex = 0;

  private onChange: (value: ImageHeaderValue[] | ImageHeaderValue | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;
  private resizeObserver?: ResizeObserver;
  private slideshowTimerId?: number;

  @ViewChild('stripScroll') private stripScrollRef?: ElementRef<HTMLDivElement>;

  protected get canAddMore(): boolean {
    return this.maxFiles === undefined || this.editorItems.length < this.maxFiles;
  }

  protected get visibleItems(): ImageHeaderValue[] {
    return this.items.filter((item) => !item.hidden);
  }

  protected get activeEditorItem(): ImageHeaderValue | null {
    return this.activeIndex !== null ? this.editorItems[this.activeIndex] ?? null : null;
  }

  protected get replaceButtonLabel(): string {
    if (this.activeEditorItem) {
      return this.allowMultiple ? 'Replace' : 'Replace image';
    }

    return this.allowMultiple ? 'Replace' : 'Choose image';
  }

  protected get groupPosition(): ImageHeaderPosition {
    return this.visibleItems[0]?.position ?? this.defaultPosition;
  }

  protected get groupShape(): ImageHeaderShape {
    return this.visibleItems[0]?.shape ?? this.resolveDefaultShape();
  }

  protected get groupSize(): ImageHeaderSize {
    return this.visibleItems[0]?.size ?? this.size;
  }

  protected get groupFrameSizePx(): number {
    return this.normalizeFrameSize(this.visibleItems[0]?.frameSizePx ?? this.frameSizePx ?? this.sizeToFrameSize(this.groupSize));
  }

  protected get editorPreviewFrameSizePx(): number {
    return this.normalizeFrameSize(this.editorFrameSizePx * 1.85, 88, 220);
  }

  protected get groupDisplayMode(): ImageHeaderDisplayMode {
    return this.visibleItems[0]?.displayMode ?? this.resolveDefaultDisplayMode();
  }

  protected get groupItemsPerPage(): ImageHeaderItemsPerPage {
    return this.visibleItems[0]?.itemsPerPage ?? this.normalizeItemsPerPage(this.itemsPerPage);
  }

  protected get groupSlideshowIntervalSeconds(): number {
    return this.visibleItems[0]?.slideshowIntervalSeconds
      ?? this.normalizeSlideshowInterval(this.slideshowIntervalSeconds);
  }

  protected get displayPages(): ImageHeaderValue[][] {
    const pageSize = this.groupItemsPerPage;
    const pages: ImageHeaderValue[][] = [];

    for (let index = 0; index < this.visibleItems.length; index += pageSize) {
      pages.push(this.visibleItems.slice(index, index + pageSize));
    }

    return pages;
  }

  protected get activeDisplayItems(): ImageHeaderValue[] {
    return this.displayPages[this.displayPageIndex] ?? this.displayPages[0] ?? [];
  }

  protected get hasMultipleDisplayPages(): boolean {
    return this.displayPages.length > 1;
  }

  ngAfterViewInit(): void {
    this.updateScrollability();
    this.restartSlideshowTimer();

    if (this.stripScrollRef?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => this.updateScrollability());
      this.resizeObserver.observe(this.stripScrollRef.nativeElement);
    }
  }

  writeValue(value: ImageHeaderValue[] | ImageHeaderValue | null): void {
    const incomingItems = !value ? [] : Array.isArray(value) ? value : [value];
    const normalizedItems = incomingItems.map((item) => this.normalizeValue(item));

    this.revokeRemovedPreviewUrls(this.items, normalizedItems);
    this.items = normalizedItems;
    this.allowMultiple = Array.isArray(value) && value.length > 0;
    this.syncEditorSettingsFromItems(this.items);
    this.editorItems = this.items.map((item) => this.cloneValue(item));
    this.activeIndex = this.editorItems.length > 0 ? 0 : null;
    this.pendingAssignedName = '';
    this.clampDisplayPageIndex();
    queueMicrotask(() => this.updateScrollability());
    this.restartSlideshowTimer();
  }

  registerOnChange(fn: (value: ImageHeaderValue[] | ImageHeaderValue | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.stopSlideshowTimer();
    this.items.forEach((item) => this.revokePreviewUrl(item));
    this.revokeRemovedPreviewUrls(this.editorItems, []);
  }

  protected trackItemById(_: number, item: ImageHeaderValue): string {
    return item.id;
  }

  protected findItemIndex(itemId: string): number {
    return this.items.findIndex((item) => item.id === itemId);
  }

  protected resolvedLabel(item: ImageHeaderValue): string | null {
    const assignedName = item.assignedName?.trim();
    return assignedName || null;
  }

  protected openAddEditor(): void {
    this.isEditorOpen = true;
    this.editorItems = this.items.map((item) => this.cloneValue(item));
    this.activeIndex = null;
    this.pendingAssignedName = '';
    this.syncEditorSettingsFromItems(this.editorItems);
  }

  protected openEditor(index: number): void {
    this.isEditorOpen = true;
    this.editorItems = this.items.map((item) => this.cloneValue(item));
    this.activeIndex = index;
    this.pendingAssignedName = this.editorItems[index]?.assignedName ?? '';
    this.syncEditorSettingsFromItems(this.editorItems);
  }

  protected selectEditorItem(index: number): void {
    this.activeIndex = index;
    this.pendingAssignedName = this.editorItems[index]?.assignedName ?? '';
  }

  protected closeEditor(): void {
    this.revokeRemovedPreviewUrls(this.editorItems, this.items);
    this.isEditorOpen = false;
    this.editorItems = this.items.map((item) => this.cloneValue(item));
    this.activeIndex = this.editorItems.length > 0 ? 0 : null;
    this.pendingAssignedName = '';
    this.clampDisplayPageIndex();
    queueMicrotask(() => this.updateScrollability());
    this.syncEditorSettingsFromItems(this.items);
    this.restartSlideshowTimer();
  }

  protected updateMode(value: boolean): void {
    const nextAllowMultiple = !!value;

    if (nextAllowMultiple) {
      this.allowMultiple = true;
      return;
    }

    if (this.editorItems.length > 1) {
      const selectedCount = this.editorItems.length;
      const confirmed = window.confirm(
        `Switching to single image will keep the selected image and remove ${selectedCount - 1} image(s) from this draft. Continue?`
      );

      if (!confirmed) {
        this.allowMultiple = true;
        return;
      }

      const selectedIndex = this.activeIndex ?? 0;
      const selectedItem = this.editorItems[selectedIndex] ?? this.editorItems[0];
      const trimmedItems = selectedItem ? [selectedItem] : [];
      this.revokeDraftPreviewUrlsForRemoved(this.editorItems, trimmedItems);
      this.editorItems = trimmedItems;
      this.activeIndex = this.editorItems.length > 0 ? 0 : null;
      this.pendingAssignedName = this.activeEditorItem?.assignedName ?? '';
    }

    this.allowMultiple = false;
  }

  protected handleReplaceSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFiles = Array.from(input.files ?? []);

    if (selectedFiles.length === 0) {
      return;
    }

    if (this.allowMultiple && this.activeIndex === null) {
      input.value = '';
      return;
    }

    const nextItem = this.createValueFromFile(selectedFiles[0], '');

    if (!this.allowMultiple) {
      this.revokeDraftPreviewUrlsForRemoved(this.editorItems, [nextItem]);
      this.editorItems = [nextItem];
      this.activeIndex = 0;
      this.pendingAssignedName = '';
      input.value = '';
      return;
    }

    const previousItem = this.activeEditorItem;
    this.editorItems = this.editorItems.map((item, index) => (index === this.activeIndex ? nextItem : item));
    this.revokeDraftPreviewUrlIfUnsaved(previousItem);
    this.pendingAssignedName = '';
    input.value = '';
  }

  protected handleAddSelection(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selectedFiles = Array.from(input.files ?? []);

    if (selectedFiles.length === 0 || !this.allowMultiple || !this.canAddMore) {
      input.value = '';
      return;
    }

    const availableSlots = this.maxFiles === undefined
      ? selectedFiles.length
      : Math.max(this.maxFiles - this.editorItems.length, 0);
    const filesToAdd = selectedFiles.slice(0, availableSlots);
    const newItems = filesToAdd.map((file) => this.createValueFromFile(file, ''));

    this.editorItems = [...this.editorItems, ...newItems];
    this.activeIndex = this.editorItems.length - 1;
    this.pendingAssignedName = '';
    this.applyImplicitMultiImageDisplayMode();
    input.value = '';
  }

  protected updateDraftPosition(value: ImageHeaderPosition | string): void {
    this.editorPosition = this.normalizePosition(value);
  }

  protected updateDraftShape(value: ImageHeaderShape | string): void {
    this.editorShape = this.normalizeShape(value);
  }

  protected updateDraftSize(value: ImageHeaderSize): void {
    this.editorSize = value;
    this.editorFrameSizePx = this.sizeToFrameSize(value);
  }

  protected updateDraftFrameSize(value: string | number): void {
    this.editorFrameSizePx = this.normalizeFrameSize(value);
  }

  protected updateDraftDisplayMode(value: ImageHeaderDisplayMode | string): void {
    this.editorDisplayMode = this.normalizeDisplayMode(value);
  }

  protected updateDraftItemsPerPage(value: ImageHeaderItemsPerPage | string | number): void {
    this.editorItemsPerPage = this.normalizeItemsPerPage(value);
  }

  protected updateDraftSlideshowInterval(value: string | number): void {
    this.editorSlideshowIntervalSeconds = this.normalizeSlideshowInterval(value);
  }

  protected updateActiveCrop(key: keyof ImageCropSettings, value: string | number): void {
    if (this.activeIndex === null) {
      return;
    }

    const activeIndex = this.activeIndex;
    const currentCrop = this.normalizeCrop(this.editorItems[activeIndex]?.crop);
    const nextCrop = this.normalizeCrop({
      ...currentCrop,
      [key]: Number(value)
    });

    this.editorItems = this.editorItems.map((item, index) =>
      index === activeIndex
        ? {
            ...item,
            crop: nextCrop
          }
        : item
    );
  }

  protected resetActiveCrop(): void {
    if (this.activeIndex === null) {
      return;
    }

    this.editorItems = this.editorItems.map((item, index) =>
      index === this.activeIndex
        ? {
            ...item,
            crop: this.defaultCrop()
          }
        : item
    );
  }

  protected getImageTransform(item: ImageHeaderValue): string {
    const crop = this.normalizeCrop(item.crop);
    return `translate(${crop.offsetX}%, ${crop.offsetY}%) scale(${crop.zoom})`;
  }

  protected formatZoom(value: number): string {
    return `${this.normalizeCrop({ zoom: value, offsetX: 0, offsetY: 0 }).zoom.toFixed(2)}x`;
  }

  private showNextPage(): void {
    if (!this.hasMultipleDisplayPages) {
      return;
    }

    this.displayPageIndex = (this.displayPageIndex + 1) % this.displayPages.length;
  }

  protected updateAssignedName(value: string): void {
    this.pendingAssignedName = value;

    if (this.activeIndex !== null) {
      this.updateItemAssignedName(this.activeIndex, value);
    }
  }

  protected updateItemAssignedName(index: number, value: string): void {
    this.editorItems = this.editorItems.map((item, itemIndex) =>
      itemIndex === index
        ? {
            ...item,
            assignedName: value
          }
        : item
    );

    if (this.activeIndex === index) {
      this.pendingAssignedName = value;
    }
  }

  protected deleteImage(): void {
    if (this.activeIndex === null) {
      return;
    }

    const removed = this.editorItems[this.activeIndex];
    this.revokeDraftPreviewUrlIfUnsaved(removed);
    this.editorItems = this.editorItems.filter((_, index) => index !== this.activeIndex);
    this.activeIndex = this.editorItems.length > 0 ? Math.min(this.activeIndex, this.editorItems.length - 1) : null;
    this.pendingAssignedName = this.activeEditorItem?.assignedName ?? '';
  }


  protected saveEditor(): void {
    const nextItems = this.editorItems.map((item) => ({
      ...item,
      position: this.editorPosition,
      shape: this.editorShape,
      profileType: this.editorShape === 'circle',
      size: this.editorSize,
      frameSizePx: this.editorFrameSizePx,
      crop: this.normalizeCrop(item.crop),
      displayMode: this.editorDisplayMode,
      itemsPerPage: this.editorItemsPerPage,
      slideshowIntervalSeconds: this.editorSlideshowIntervalSeconds
    }));

    this.revokeRemovedPreviewUrls(this.items, nextItems);
    this.items = this.allowMultiple ? nextItems : nextItems.slice(0, 1);
    this.emitValue();
    this.isEditorOpen = false;
    this.editorItems = this.items.map((item) => this.cloneValue(item));
    this.activeIndex = this.editorItems.length > 0 ? 0 : null;
    this.pendingAssignedName = '';
    this.clampDisplayPageIndex();
    queueMicrotask(() => this.updateScrollability());
    this.restartSlideshowTimer();
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
    const emittedValue = this.allowMultiple ? this.items : this.items[0] ?? null;
    this.onChange(emittedValue);
    this.onTouched();
  }

  private syncEditorSettingsFromItems(sourceItems: ImageHeaderValue[]): void {
    this.editorPosition = sourceItems[0]?.position ?? this.defaultPosition;
    this.editorShape = this.normalizeShape(sourceItems[0]?.shape ?? this.resolveDefaultShape());
    this.editorSize = sourceItems[0]?.size ?? this.size;
    this.editorFrameSizePx = this.normalizeFrameSize(
      sourceItems[0]?.frameSizePx ?? this.frameSizePx ?? this.sizeToFrameSize(this.editorSize)
    );
    this.editorDisplayMode = sourceItems[0]?.displayMode ?? this.resolveDefaultDisplayMode(sourceItems);
    this.editorItemsPerPage = this.normalizeItemsPerPage(sourceItems[0]?.itemsPerPage ?? this.itemsPerPage);
    this.editorSlideshowIntervalSeconds = this.normalizeSlideshowInterval(
      sourceItems[0]?.slideshowIntervalSeconds ?? this.slideshowIntervalSeconds
    );
  }

  private resolveDefaultShape(): ImageHeaderShape {
    if (this.shape) {
      return this.shape;
    }

    return this.profileType ? 'circle' : 'rectangle';
  }

  private resolveDefaultDisplayMode(sourceItems: ImageHeaderValue[] = this.visibleItems): ImageHeaderDisplayMode {
    if (this.displayMode) {
      return this.normalizeDisplayMode(this.displayMode);
    }

    return 'slideshow';
  }

  private createValueFromFile(file: File, assignedName: string): ImageHeaderValue {
    return {
      id: this.createItemId(file),
      file,
      originalName: file.name,
      assignedName,
      extension: this.getExtension(file.name),
      mimeType: file.type || 'application/octet-stream',
      sizeBytes: file.size,
      previewUrl: URL.createObjectURL(file),
      sourceUrl: undefined,
      status: 'new',
      position: this.editorPosition,
      profileType: this.editorShape === 'circle',
      size: this.editorSize,
      frameSizePx: this.editorFrameSizePx,
      shape: this.editorShape,
      crop: this.defaultCrop(),
      displayMode: this.editorDisplayMode,
      itemsPerPage: this.editorItemsPerPage,
      slideshowIntervalSeconds: this.editorSlideshowIntervalSeconds,
      hidden: false
    };
  }

  private normalizeValue(value: ImageHeaderValue): ImageHeaderValue {
    const normalizedShape = this.normalizeShape(value.shape ?? (value.profileType ? 'circle' : this.resolveDefaultShape()));

    return {
      ...value,
      previewUrl: value.previewUrl || value.sourceUrl || (value.file ? URL.createObjectURL(value.file) : undefined),
      position: this.normalizePosition(value.position ?? this.defaultPosition),
      profileType: normalizedShape === 'circle',
      size: value.size ?? this.size,
      frameSizePx: this.normalizeFrameSize(value.frameSizePx ?? this.frameSizePx ?? this.sizeToFrameSize(value.size ?? this.size)),
      shape: normalizedShape,
      crop: this.normalizeCrop(value.crop),
      displayMode: value.displayMode ? this.normalizeDisplayMode(value.displayMode) : undefined,
      itemsPerPage: this.normalizeItemsPerPage(value.itemsPerPage ?? this.itemsPerPage),
      slideshowIntervalSeconds: this.normalizeSlideshowInterval(
        value.slideshowIntervalSeconds ?? this.slideshowIntervalSeconds
      ),
      hidden: value.hidden ?? false,
      assignedName: value.assignedName ?? ''
    };
  }

  private cloneValue(value: ImageHeaderValue): ImageHeaderValue {
    return {
      ...value,
      crop: value.crop ? { ...value.crop } : this.defaultCrop()
    };
  }

  private normalizePosition(position: ImageHeaderPosition | string): ImageHeaderPosition {
    if (position === 'left' || position === 'right') {
      return position;
    }

    return 'center';
  }

  private normalizeShape(shape: ImageHeaderShape | string): ImageHeaderShape {
    if (shape === 'circle' || shape === 'square' || shape === 'triangle') {
      return shape;
    }

    return 'rectangle';
  }

  private normalizeDisplayMode(displayMode: ImageHeaderDisplayMode | string): ImageHeaderDisplayMode {
    return displayMode === 'slideshow' ? 'slideshow' : 'scroll';
  }

  private normalizeFrameSize(value: string | number, min = 48, max = 128): number {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return this.sizeToFrameSize(this.size);
    }

    return Math.min(Math.max(Math.round(parsedValue), min), max);
  }

  private sizeToFrameSize(size: ImageHeaderSize): number {
    if (size === 'sm') {
      return 64;
    }

    if (size === 'lg') {
      return 96;
    }

    return 80;
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

  private normalizeItemsPerPage(value: ImageHeaderItemsPerPage | string | number): ImageHeaderItemsPerPage {
    const parsedValue = Number(value);

    if (parsedValue === 1 || parsedValue === 2 || parsedValue === 3 || parsedValue === 4 || parsedValue === 5) {
      return parsedValue;
    }

    return 4;
  }

  private normalizeSlideshowInterval(value: string | number): number {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
      return 5;
    }

    return Math.min(Math.max(Math.round(parsedValue), 1), 60);
  }

  private applyImplicitMultiImageDisplayMode(): void {
    const hasExplicitDisplayMode = !!this.displayMode || this.editorItems.some((item) => !!item.displayMode);

    if (!hasExplicitDisplayMode && this.editorItems.length > 1) {
      this.editorDisplayMode = 'slideshow';
    }
  }

  private getExtension(fileName: string): string {
    const parts = fileName.split('.');
    return parts.length > 1 ? parts.pop()!.toUpperCase() : 'IMG';
  }

  private createItemId(file: File): string {
    return `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
  }

  private revokeRemovedPreviewUrls(previousItems: ImageHeaderValue[], nextItems: ImageHeaderValue[]): void {
    const nextPreviewUrls = new Set(nextItems.map((item) => item.previewUrl).filter(Boolean));

    previousItems.forEach((item) => {
      if (item.previewUrl?.startsWith('blob:') && !nextPreviewUrls.has(item.previewUrl)) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  }

  private revokePreviewUrl(item: ImageHeaderValue | null): void {
    if (item?.previewUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(item.previewUrl);
    }
  }

  private revokeDraftPreviewUrlIfUnsaved(item: ImageHeaderValue | null): void {
    if (!item?.previewUrl) {
      return;
    }

    const isSavedPreview = this.items.some((savedItem) => savedItem.previewUrl === item.previewUrl);

    if (!isSavedPreview) {
      this.revokePreviewUrl(item);
    }
  }

  private revokeDraftPreviewUrlsForRemoved(previousItems: ImageHeaderValue[], nextItems: ImageHeaderValue[]): void {
    const nextPreviewUrls = new Set(nextItems.map((item) => item.previewUrl).filter(Boolean));

    previousItems.forEach((item) => {
      if (!nextPreviewUrls.has(item.previewUrl)) {
        this.revokeDraftPreviewUrlIfUnsaved(item);
      }
    });
  }

  private restartSlideshowTimer(): void {
    this.stopSlideshowTimer();

    if (this.groupDisplayMode !== 'slideshow' || !this.hasMultipleDisplayPages) {
      return;
    }

    this.slideshowTimerId = window.setInterval(
      () => this.showNextPage(),
      this.groupSlideshowIntervalSeconds * 1000
    );
  }

  private stopSlideshowTimer(): void {
    if (this.slideshowTimerId === undefined) {
      return;
    }

    window.clearInterval(this.slideshowTimerId);
    this.slideshowTimerId = undefined;
  }

  private clampDisplayPageIndex(): void {
    const pageCount = this.displayPages.length;

    if (pageCount === 0) {
      this.displayPageIndex = 0;
      return;
    }

    this.displayPageIndex = Math.min(this.displayPageIndex, pageCount - 1);
  }

  private updateScrollability(): void {
    const element = this.stripScrollRef?.nativeElement;

    if (!element) {
      this.isHeaderScrollable = false;
      return;
    }

    this.isHeaderScrollable = element.scrollWidth > element.clientWidth + 4;
  }
}

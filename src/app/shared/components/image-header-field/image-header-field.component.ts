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
  template: `
    <div class="image-header" [class.image-header--disabled]="disabled">
      <div
        class="image-header__surface"
        [class.image-header__surface--left]="groupPosition === 'left'"
        [class.image-header__surface--center]="groupPosition === 'center'"
        [class.image-header__surface--right]="groupPosition === 'right'"
      >
        <div class="image-header__actions">
          <button
            type="button"
            class="image-header__action-button"
            [disabled]="disabled"
            title="Add image"
            aria-label="Add image"
            (click)="openAddEditor()"
          >
            <ng-container *ngTemplateOutlet="uploadIcon"></ng-container>
          </button>
        </div>

        <div class="image-header__content">
          <div class="image-header__strip-shell" *ngIf="visibleItems.length > 0; else emptySurface">
            <ng-container *ngIf="groupDisplayMode === 'slideshow'; else scrollRail">
              <div class="image-header__slideshow">
                <div class="image-header__slide-viewport">
                  <div class="image-header__strip image-header__strip--page" [attr.data-page]="displayPageIndex">
                    <article
                      *ngFor="let item of activeDisplayItems; let index = index; trackBy: trackItemById"
                      class="image-header__tile"
                    >
                      <ng-container *ngTemplateOutlet="imageTile; context: { item: item }"></ng-container>
                    </article>
                  </div>
                </div>
              </div>
            </ng-container>

            <ng-template #scrollRail>
              <div #stripScroll class="image-header__strip-scroll">
                <div class="image-header__strip">
                  <article
                    *ngFor="let item of visibleItems; let index = index; trackBy: trackItemById"
                    class="image-header__tile"
                  >
                    <ng-container *ngTemplateOutlet="imageTile; context: { item: item }"></ng-container>
                  </article>
                </div>
              </div>
            </ng-template>
          </div>

          <ng-template #emptySurface>
            <div class="image-header__strip-shell">
              <article class="image-header__tile image-header__tile--default">
                <div class="image-header__canvas image-header__canvas--default">
                  <img
                    class="image-header__placeholder-image"
                    [src]="placeholderImageSrc"
                    alt="Image placeholder"
                  />
                </div>
              </article>
            </div>
          </ng-template>
        </div>
      </div>
    </div>

    <ng-template #imageTile let-item="item">
      <div class="image-header__canvas-shell">
        <div
          class="image-header__canvas"
          [class.image-header__canvas--circle]="groupShape === 'circle'"
          [class.image-header__canvas--square]="groupShape === 'square'"
          [class.image-header__canvas--triangle]="groupShape === 'triangle'"
          [style.--image-header-frame-size]="groupFrameSizePx + 'px'"
        >
          <img
            class="image-header__image"
            [src]="item.previewUrl"
            [alt]="item.originalName || 'Selected image'"
            [style.transform]="getImageTransform(item)"
          />

          <div class="image-header__overlay-panel">
            <button
              type="button"
              class="image-header__icon-button"
              [disabled]="disabled"
              title="Manage Image"
              aria-label="Open image actions"
              (click)="openEditor(findItemIndex(item.id))"
            >
              <ng-container *ngTemplateOutlet="editIcon"></ng-container>
            </button>
          </div>
        </div>
      </div>

      <p
        *ngIf="showLabels && resolvedLabel(item) as label"
        class="image-header__caption"
        [title]="label"
      >
        {{ label }}
      </p>
    </ng-template>

    <div
      *ngIf="isEditorOpen"
      class="image-header__modal-backdrop"
      (click)="closeEditor()"
    >
      <section class="image-header__modal" (click)="$event.stopPropagation()">
        <header class="image-header__modal-header">
          <h3>{{ activeIndex === null ? 'Add image header' : 'Update image header' }}</h3>
          <button
            type="button"
            class="image-header__action image-header__action--ghost"
            (click)="closeEditor()"
          >
            Close
          </button>
        </header>

        <div class="image-header__modal-body">
          <div class="image-header__modal-preview">
            <div class="image-header__preview-frame">
              <div
                class="image-header__canvas"
                [class.image-header__canvas--empty-preview]="!activeEditorItem"
                [class.image-header__canvas--circle]="activeEditorItem && editorShape === 'circle'"
                [class.image-header__canvas--square]="activeEditorItem && editorShape === 'square'"
                [class.image-header__canvas--triangle]="activeEditorItem && editorShape === 'triangle'"
                [style.--image-header-frame-size]="activeEditorItem ? editorPreviewFrameSizePx + 'px' : null"
              >
                <ng-container *ngIf="activeEditorItem as activeItem; else editorEmptyState">
                  <img
                    class="image-header__image"
                    [src]="activeItem.previewUrl"
                    [alt]="activeItem.originalName || 'Selected image'"
                    [style.transform]="getImageTransform(activeItem)"
                  />
                </ng-container>

                <ng-template #editorEmptyState>
                  <img
                    class="image-header__placeholder-image"
                    [src]="placeholderImageSrc"
                    alt="Image Preview"
                  />
                </ng-template>
              </div>
            </div>

            <div class="image-header__thumb-rail" *ngIf="editorItems.length > 0">
              <button
                *ngFor="let item of editorItems; let index = index; trackBy: trackItemById"
                type="button"
                class="image-header__thumb"
                [class.image-header__thumb--active]="activeIndex === index"
                (click)="selectEditorItem(index)"
              >
                <img [src]="item.previewUrl" [alt]="item.originalName || 'Image'" />
              </button>

            </div>
          </div>

          <div class="image-header__editor-form">
            <section class="image-header__editor-section">
              <header class="image-header__section-header">
                <h4>Image</h4>
              </header>

              <div class="image-header__field">
                <div class="image-header__upload-row">
                  <label class="image-header__mode-toggle">
                    <input
                      type="checkbox"
                      [disabled]="disabled"
                      [ngModel]="allowMultiple"
                      (ngModelChange)="updateMode($event)"
                    />
                    <span>Multi</span>
                  </label>

                  <input
                    type="text"
                    class="image-header__assigned-input"
                    [disabled]="disabled || !activeEditorItem"
                    [ngModel]="activeEditorItem?.assignedName || pendingAssignedName"
                    (ngModelChange)="updateAssignedName($event)"
                    placeholder="Display Name"
                  />

                  <label
                    class="image-header__upload-button"
                    [class.image-header__upload-button--disabled]="disabled || (allowMultiple && activeIndex === null)"
                  >
                    <input
                      type="file"
                      class="image-header__native-input"
                      [attr.accept]="accept || 'image/*'"
                      [disabled]="disabled || (allowMultiple && activeIndex === null)"
                      (change)="handleReplaceSelection($event)"
                    />
                    <span>{{ replaceButtonLabel }}</span>
                    <ng-container *ngTemplateOutlet="replaceIcon"></ng-container>
                  </label>

                  <label
                    *ngIf="allowMultiple"
                    class="image-header__upload-button"
                    [class.image-header__upload-button--disabled]="disabled || !canAddMore"
                  >
                    <input
                      type="file"
                      class="image-header__native-input"
                      [attr.accept]="accept || 'image/*'"
                      multiple
                      [disabled]="disabled || !canAddMore"
                      (change)="handleAddSelection($event)"
                    />
                    <span>Add</span>
                    <ng-container *ngTemplateOutlet="addIcon"></ng-container>
                  </label>

                  <button
                    *ngIf="activeIndex !== null"
                    type="button"
                    class="image-header__upload-button image-header__upload-button--danger"
                    [disabled]="disabled"
                    (click)="deleteImage()"
                  >
                    <span>Delete</span>
                    <ng-container *ngTemplateOutlet="deleteIcon"></ng-container>
                  </button>
                </div>
              </div>

              <div class="image-header__editor-meta">
                <article class="image-header__meta-card">
                  <strong>fileName</strong>
                  <span [title]="activeEditorItem?.originalName || 'No image selected'">{{ activeEditorItem?.originalName || 'No image selected' }}</span>
                </article>
                <article class="image-header__meta-card">
                  <strong>Extension</strong>
                  <span>{{ activeEditorItem?.extension || 'IMG' }}</span>
                </article>
                <article class="image-header__meta-card">
                  <strong>Size</strong>
                  <span>{{ activeEditorItem?.sizeBytes ? formatFileSize(activeEditorItem!.sizeBytes) : '0 B' }}</span>
                </article>
              </div>
            </section>

            <section class="image-header__editor-section">
              <header class="image-header__section-header">
                <h4>Layout</h4>
              </header>

              <div class="image-header__settings-row">
                <label class="image-header__field">
                  <span class="image-header__field-label">
                    Position
                    <ng-container
                      *ngTemplateOutlet="infoIcon; context: { title: 'Controls where the saved image header appears in the form surface.' }"
                    ></ng-container>
                  </span>
                  <select
                    [disabled]="disabled"
                    [ngModel]="editorPosition"
                    (ngModelChange)="updateDraftPosition($event)"
                  >
                    <option value="left">Left</option>
                    <option value="center">Middle</option>
                    <option value="right">Right</option>
                  </select>
                </label>

                <label class="image-header__field">
                  <span class="image-header__field-label">
                    Shape
                    <ng-container
                      *ngTemplateOutlet="infoIcon; context: { title: 'Applies the selected mask shape to the saved image header.' }"
                    ></ng-container>
                  </span>
                  <select
                    [disabled]="disabled"
                    [ngModel]="editorShape"
                    (ngModelChange)="updateDraftShape($event)"
                  >
                    <option value="circle">Circle</option>
                    <option value="rectangle">Rectangle</option>
                    <option value="square">Square</option>
                    <option value="triangle">Triangle</option>
                  </select>
                </label>

                <label class="image-header__field">
                  <span class="image-header__field-label">
                    Frame size
                    <ng-container
                      *ngTemplateOutlet="infoIcon; context: { title: 'Sets the rendered header frame size and applies it to every image in this header.' }"
                    ></ng-container>
                  </span>
                  <div class="image-header__slider-field">
                    <input
                      type="range"
                      min="48"
                      max="128"
                      step="4"
                      [disabled]="disabled"
                      [ngModel]="editorFrameSizePx"
                      (ngModelChange)="updateDraftFrameSize($event)"
                    />
                    <span>{{ editorFrameSizePx }}px</span>
                  </div>
                </label>
              </div>

              <div class="image-header__settings-row">
                <label class="image-header__field">
                  <span class="image-header__field-label">
                    Display
                    <ng-container
                      *ngTemplateOutlet="infoIcon; context: { title: 'Keeps the saved image header scrollable, or pages it as a slideshow.' }"
                    ></ng-container>
                  </span>
                  <select
                    [disabled]="disabled"
                    [ngModel]="editorDisplayMode"
                    (ngModelChange)="updateDraftDisplayMode($event)"
                  >
                    <option value="scroll">Scrollable</option>
                    <option value="slideshow">Slideshow</option>
                  </select>
                </label>

                <label class="image-header__field">
                  <span class="image-header__field-label">
                    Per page
                    <ng-container
                      *ngTemplateOutlet="infoIcon; context: { title: 'Sets how many images appear in each slideshow page.' }"
                    ></ng-container>
                  </span>
                  <select
                    [disabled]="disabled || editorDisplayMode !== 'slideshow'"
                    [ngModel]="editorItemsPerPage"
                    (ngModelChange)="updateDraftItemsPerPage($event)"
                  >
                    <option [ngValue]="1">1</option>
                    <option [ngValue]="2">2</option>
                    <option [ngValue]="3">3</option>
                    <option [ngValue]="4">4</option>
                    <option [ngValue]="5">5</option>
                  </select>
                </label>

                <label class="image-header__field">
                  <span class="image-header__field-label">
                    Interval
                    <ng-container
                      *ngTemplateOutlet="infoIcon; context: { title: 'Sets how many seconds each slideshow page remains visible.' }"
                    ></ng-container>
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    step="1"
                    [disabled]="disabled || editorDisplayMode !== 'slideshow'"
                    [ngModel]="editorSlideshowIntervalSeconds"
                    (ngModelChange)="updateDraftSlideshowInterval($event)"
                  />
                </label>
              </div>
            </section>

            <section class="image-header__editor-section" *ngIf="activeEditorItem as cropItem">
              <header class="image-header__section-header">
                <h4>Crop</h4>
                <button
                  type="button"
                  class="image-header__reset-button"
                  [disabled]="disabled"
                  title="Reset crop"
                  aria-label="Reset crop"
                  (click)="resetActiveCrop()"
                >
                  <span>Reset</span>
                  <ng-container *ngTemplateOutlet="resetIcon"></ng-container>
                </button>
              </header>

              <div class="image-header__settings-row">
                <label class="image-header__field">
                  <span class="image-header__field-label">
                    Zoom
                    <ng-container
                      *ngTemplateOutlet="infoIcon; context: { title: 'Adjusts only the selected image inside the shared frame.' }"
                    ></ng-container>
                  </span>
                  <div class="image-header__slider-field">
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.05"
                      [disabled]="disabled"
                      [ngModel]="cropItem.crop?.zoom ?? 1"
                      (ngModelChange)="updateActiveCrop('zoom', $event)"
                    />
                    <span>{{ formatZoom(cropItem.crop?.zoom ?? 1) }}</span>
                  </div>
                </label>

                <label class="image-header__field">
                  <span class="image-header__field-label">Horizontal</span>
                  <div class="image-header__slider-field">
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      [disabled]="disabled"
                      [ngModel]="cropItem.crop?.offsetX ?? 0"
                      (ngModelChange)="updateActiveCrop('offsetX', $event)"
                    />
                    <span>{{ cropItem.crop?.offsetX ?? 0 }}%</span>
                  </div>
                </label>

                <label class="image-header__field">
                  <span class="image-header__field-label">Vertical</span>
                  <div class="image-header__slider-field">
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="1"
                      [disabled]="disabled"
                      [ngModel]="cropItem.crop?.offsetY ?? 0"
                      (ngModelChange)="updateActiveCrop('offsetY', $event)"
                    />
                    <span>{{ cropItem.crop?.offsetY ?? 0 }}%</span>
                  </div>
                </label>
              </div>
            </section>
          </div>
        </div>

        <footer class="image-header__modal-actions">
          <button
            type="button"
            class="image-header__action image-header__action--ghost"
            (click)="closeEditor()"
          >
            Cancel
          </button>
          <button
            type="button"
            class="image-header__action"
            [disabled]="editorItems.length === 0"
            (click)="saveEditor()"
          >
            Save image header
          </button>
        </footer>
      </section>
    </div>

    <ng-template #editIcon>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="m4 20 4.5-1 9.25-9.25a1.75 1.75 0 0 0 0-2.5l-1-1a1.75 1.75 0 0 0-2.5 0L5 15.5 4 20Z" />
        <path d="M13.5 7.5 16.5 10.5" />
      </svg>
    </ng-template>

    <ng-template #uploadIcon>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 16V8" />
        <path d="M8.5 11.5 12 8l3.5 3.5" />
        <path d="M5 15.5v2A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5v-2" />
      </svg>
    </ng-template>

    <ng-template #replaceIcon>
      <svg class="image-header__button-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h10a5 5 0 0 1 0 10H9" />
        <path d="m7 13-3 4 3 4" />
        <path d="M20 5v6" />
        <path d="M17 8h6" />
      </svg>
    </ng-template>

    <ng-template #addIcon>
      <svg class="image-header__button-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
    </ng-template>

    <ng-template #deleteIcon>
      <svg class="image-header__button-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7h16" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M6 7l1 13h10l1-13" />
        <path d="M9 7V4h6v3" />
      </svg>
    </ng-template>

    <ng-template #resetIcon>
      <svg class="image-header__button-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 3v6h6" />
        <path d="M3 12a9 9 0 1 0 3-6.7L3 9" />
      </svg>
    </ng-template>

    <ng-template #infoIcon let-title="title">
      <span class="image-header__tooltip-icon" [title]="title" aria-label="Field information">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 17v-5" />
          <path d="M12 8h.01" />
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
        </svg>
      </span>
    </ng-template>
  `,
  styles: [`
    .image-header {
      min-width: 0;
    }

    .image-header--disabled {
      opacity: 0.72;
    }

    .image-header__surface {
      display: grid;
      gap: 0;
      min-width: 0;
      overflow: visible;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: #ffffff;
      box-shadow: none;
    }

    .image-header__actions {
      display: flex;
      justify-content: flex-end;
      min-width: 0;
      padding: 0.30rem 1.25rem 0.30rem;
    }

    .image-header__content {
      min-width: 0;
      padding: 0.9rem 1.25rem 1.25rem;
      border-top: 1px solid #d9e2ec;
    }

    .image-header__strip-shell {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
      width: 100%;
      min-width: 0;
      align-items: center;
    }

    .image-header__action-button {
      display: grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      padding: 0.28rem;
      border: 1px solid #bcccdc;
      border-radius: 999px;
      color: #6b7280;
      background:
        radial-gradient(circle at top left, rgba(15, 118, 110, 0.08), transparent 45%),
        linear-gradient(180deg, rgba(248, 250, 252, 0.9), rgba(217, 226, 236, 0.9));
      cursor: pointer;
      box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08);
    }

    .image-header__action-button:disabled {
      opacity: 0.58;
      cursor: not-allowed;
    }

    .image-header__action-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }

    .image-header__action-button svg {
      width: 1.1rem;
      height: 1.1rem;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .image-header__surface--left .image-header__strip-shell {
      justify-items: start;
    }

    .image-header__surface--center .image-header__strip-shell {
      justify-items: center;
    }

    .image-header__surface--right .image-header__strip-shell {
      justify-items: end;
    }

    .image-header__strip-scroll {
      justify-self: start;
      width: fit-content;
      min-width: 0;
      max-width: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 0.35rem;
      scrollbar-gutter: stable;
      scrollbar-width: auto;
      scrollbar-color: #9fb3c8 #e9eef2;
    }

    .image-header__strip-scroll::-webkit-scrollbar {
      height: 10px;
    }

    .image-header__strip-scroll::-webkit-scrollbar-track {
      background: #e9eef2;
      border-radius: 999px;
    }

    .image-header__strip-scroll::-webkit-scrollbar-thumb {
      background: #9fb3c8;
      border-radius: 999px;
    }

    .image-header__strip {
      display: flex;
      gap: 1rem;
      width: max-content;
      min-width: 0;
      align-items: flex-start;
    }

    .image-header__slideshow {
      display: grid;
      justify-self: start;
      width: fit-content;
      max-width: 100%;
      min-width: 0;
      align-items: center;
    }

    .image-header__slide-viewport {
      width: fit-content;
      max-width: 100%;
      min-width: 0;
      overflow: hidden;
    }

    .image-header__strip--page {
      justify-content: center;
      width: 100%;
      min-width: 0;
    }

    .image-header__surface--center .image-header__strip-scroll,
    .image-header__surface--center .image-header__slideshow {
      justify-self: center;
    }

    .image-header__surface--right .image-header__strip-scroll,
    .image-header__surface--right .image-header__slideshow {
      justify-self: end;
    }

    .image-header__tile {
      display: grid;
      gap: 0.55rem;
      flex: 0 0 auto;
      align-content: start;
      justify-items: center;
      border: 0;
      background: transparent;
      padding: 0;
    }

    .image-header__tile--sticky {
      position: sticky;
      right: 0;
      align-self: start;
      z-index: 1;
      flex: 0 0 auto;
      display: grid;
      justify-items: center;
      padding-left: 0.25rem;
      background: linear-gradient(90deg, rgba(248, 250, 252, 0), rgba(248, 250, 252, 0.92) 24%);
    }

    .image-header__tile--placeholder {
      cursor: pointer;
    }

    .image-header__tile--default {
      justify-self: start;
    }

    .image-header__canvas-shell {
      display: grid;
      border-radius: 1rem;
      overflow: hidden;
    }

    .image-header__canvas {
      position: relative;
      display: grid;
      place-items: center;
      width: calc(var(--image-header-frame-size, 5rem) * 1.35);
      height: var(--image-header-frame-size, 5rem);
      overflow: hidden;
      border: 1px solid #bcccdc;
      border-radius: 1rem;
      background: #ffffff;
      box-shadow:
        inset 0 0 0 2px rgba(248, 250, 252, 0.95),
        0 8px 18px rgba(15, 23, 42, 0.06);
      isolation: isolate;
      padding: 0.1rem;
      box-sizing: border-box;
    }

    .image-header__canvas--placeholder {
      border: 1px solid rgba(185, 203, 215, 0.9);
      background:
        radial-gradient(circle at top left, rgba(15, 118, 110, 0.08), transparent 45%),
        linear-gradient(180deg, rgba(248, 250, 252, 0.9), rgba(217, 226, 236, 0.9));
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08);
    }

    .image-header__canvas--default {
      width: 5rem;
      height: 5rem;
      border: 1px solid #bcccdc;
      border-radius: 999px;
      background:
        radial-gradient(circle at top left, rgba(15, 118, 110, 0.08), transparent 45%),
        linear-gradient(180deg, rgba(248, 250, 252, 0.9), rgba(217, 226, 236, 0.9));
      box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);
    }

    .image-header__canvas--default .image-header__placeholder-image {
      width: 92%;
      height: 92%;
      padding: 0;
      border-radius: 999px;
      object-fit: contain;
    }

    .image-header__canvas--default,
    .image-header__canvas--placeholder {
      padding: 0;
    }

    .image-header__canvas--empty-preview {
      width: 50%;
      max-width: 14rem;
      min-width: 8rem;
      height: auto;
      aspect-ratio: 1;
      border-radius: 1rem;
      background: transparent;
      box-shadow: none;
    }

    .image-header__canvas--circle {
      aspect-ratio: 1;
      width: var(--image-header-frame-size, 5rem);
      height: auto;
      border-radius: 999px;
    }

    .image-header__canvas-shell:has(.image-header__canvas--circle) {
      border-radius: 999px;
    }

    .image-header__canvas--square {
      aspect-ratio: 1;
      width: var(--image-header-frame-size, 5rem);
      height: auto;
      border-radius: 0.9rem;
    }

    .image-header__canvas--triangle {
      width: var(--image-header-frame-size, 5rem);
      height: var(--image-header-frame-size, 5rem);
      clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
      border-radius: 0;
    }

    .image-header__image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      border-radius: inherit;
      transform-origin: center;
    }

    .image-header__canvas--circle .image-header__image,
    .image-header__canvas--square .image-header__image {
      object-fit: cover;
    }

    .image-header__placeholder-image {
      width: calc(100% - 0.8rem);
      height: calc(100% - 0.8rem);
      object-fit: contain;
      display: block;
      padding: 0.15rem;
      box-sizing: border-box;
    }

    .image-header__overlay-action {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      opacity: 0;
      background: rgba(15, 23, 42, 0.22);
      color: #ffffff;
      transition: opacity 120ms ease;
      pointer-events: none;
    }

    .image-header__tile--placeholder .image-header__overlay-action::before {
      content: '';
      position: absolute;
      width: 2rem;
      height: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.38);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      box-shadow: 0 6px 18px rgba(15, 23, 42, 0.18);
      backdrop-filter: blur(6px);
    }

    .image-header__tile--placeholder:hover .image-header__overlay-action,
    .image-header__tile--placeholder:focus-within .image-header__overlay-action,
    .image-header__canvas:hover .image-header__overlay-action,
    .image-header__canvas:focus-within .image-header__overlay-action {
      opacity: 1;
    }

    .image-header__overlay-action svg {
      position: relative;
      z-index: 1;
      width: 1.35rem;
      height: 1.35rem;
      stroke: currentColor;
      stroke-width: 1.9;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .image-header__overlay-panel {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      opacity: 0;
      background: linear-gradient(180deg, rgba(15, 23, 42, 0.16), rgba(15, 23, 42, 0.5));
      transition: opacity 140ms ease;
      z-index: 1;
    }

    .image-header__canvas-shell:hover .image-header__overlay-panel,
    .image-header__canvas-shell:focus-within .image-header__overlay-panel {
      opacity: 1;
    }

    .image-header__icon-button {
      display: grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.38);
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      color: #ffffff;
      cursor: pointer;
      backdrop-filter: blur(6px);
      transition:
        transform 120ms ease,
        background-color 120ms ease,
        border-color 120ms ease;
    }

    .image-header__icon-button:hover,
    .image-header__icon-button:focus-visible {
      transform: translateY(-1px);
      background: rgba(255, 255, 255, 0.24);
      border-color: rgba(255, 255, 255, 0.58);
      outline: none;
    }

    .image-header__icon-button svg {
      width: 1rem;
      height: 1rem;
      stroke: currentColor;
      stroke-width: 1.8;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .image-header__caption {
      width: 100%;
      max-width: 5.25rem;
      margin: 0;
      overflow: hidden;
      color: #7b8794;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-weight: 500;
      font-size: 0.76rem;
    }

    .image-header__modal-backdrop {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      background: rgba(15, 23, 42, 0.45);
      z-index: 1000;
    }

    .image-header__modal {
      width: min(100%, 72rem);
      max-height: min(90vh, 58rem);
      display: grid;
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 1rem;
      background: #ffffff;
      box-shadow: 0 32px 80px rgba(15, 23, 42, 0.24);
    }

    .image-header__modal-header,
    .image-header__modal-actions {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .image-header__modal-header h3 {
      margin: 0;
      color: #102a43;
    }

    .image-header__modal-body {
      display: grid;
      gap: 1rem;
      grid-template-columns: minmax(220px, 280px) minmax(0, 1fr);
      overflow: auto;
      align-items: start;
    }

    .image-header__modal-preview {
      display: grid;
      gap: 1rem;
      grid-template-rows: minmax(12rem, auto) minmax(0, 8.5rem);
      align-items: stretch;
      padding: 1rem;
      border: 1px solid #d9e2ec;
      border-radius: 1rem;
      background: #f8fafc;
      min-height: 0;
      align-content: start;
    }

    .image-header__preview-frame {
      display: grid;
      place-items: center;
      min-height: 12rem;
      max-height: 24rem;
      overflow: auto;
      padding: 0.5rem;
      border-radius: 0.9rem;
      background: rgba(255, 255, 255, 0.68);
      min-width: 0;
    }

    .image-header__thumb-rail {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(3.6rem, 1fr));
      gap: 0.6rem;
      align-content: start;
      max-height: 8.5rem;
      overflow-y: auto;
      overflow-x: hidden;
      padding-right: 0.2rem;
    }

    .image-header__thumb {
      width: 100%;
      height: 3.6rem;
      padding: 0;
      border: 1px solid #d9e2ec;
      border-radius: 0.8rem;
      background: #ffffff;
      overflow: hidden;
      cursor: pointer;
    }

    .image-header__thumb--active {
      border-color: #0f766e;
      box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.12);
    }

    .image-header__thumb img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .image-header__editor-form {
      display: grid;
      gap: 1rem;
      align-content: start;
    }

    .image-header__editor-section {
      display: grid;
      gap: 0.85rem;
      min-width: 0;
      padding-bottom: 1rem;
      border-bottom: 1px solid #d9e2ec;
    }

    .image-header__editor-section:last-child {
      padding-bottom: 0;
      border-bottom: 0;
    }

    .image-header__section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      min-width: 0;
    }

    .image-header__section-header h4 {
      margin: 0;
      color: #102a43;
      font-size: 0.95rem;
    }

    .image-header__reset-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      width: fit-content;
      padding: 0.6rem 0.85rem;
      border: 1px solid #bcccdc;
      border-radius: 999px;
      background: #ffffff;
      color: #52606d;
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
    }

    .image-header__reset-button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .image-header__field {
      display: grid;
      gap: 0.4rem;
      color: #243b53;
      font-weight: 600;
    }

    .image-header__field-label {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      min-width: 0;
    }

    .image-header__settings-row {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.75rem;
      align-items: end;
    }

    .image-header__field select,
    .image-header__field input[type='number'],
    .image-header__assigned-input {
      width: 100%;
      padding: 0.75rem 0.9rem;
      border: 1px solid #bcccdc;
      border-radius: 0.7rem;
      background: #ffffff;
      color: #102a43;
      font: inherit;
      box-sizing: border-box;
    }

    .image-header__slider-field {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 3.8rem;
      gap: 0.65rem;
      align-items: center;
      min-height: 2.9rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid #bcccdc;
      border-radius: 0.7rem;
      background: #ffffff;
      box-sizing: border-box;
    }

    .image-header__slider-field input[type='range'] {
      width: 100%;
      min-width: 0;
      accent-color: #0f766e;
    }

    .image-header__slider-field span {
      color: #52606d;
      font-size: 0.85rem;
      text-align: right;
      white-space: nowrap;
    }

    .image-header__upload-row {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: auto minmax(0, 1fr) repeat(3, auto);
      align-items: center;
    }

    .image-header__mode-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.7rem 0.85rem;
      border: 1px solid #bcccdc;
      border-radius: 0.8rem;
      background: #ffffff;
      white-space: nowrap;
    }

    .image-header__mode-toggle input {
      margin: 0;
    }

    .image-header__upload-button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.45rem;
      width: fit-content;
      padding: 0.8rem 1rem;
      border: 1px solid #0f766e;
      border-radius: 0.8rem;
      background: #f0fdfa;
      color: #134e4a;
      cursor: pointer;
      font: inherit;
      font-weight: 700;
      overflow: hidden;
      white-space: nowrap;
    }

    .image-header__upload-button:disabled,
    .image-header__upload-button--disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .image-header__upload-button--danger {
      border-color: #f1b4b4;
      background: #fff5f5;
      color: #b42318;
    }

    .image-header__button-icon {
      width: 1rem;
      height: 1rem;
      flex: 0 0 auto;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .image-header__tooltip-icon {
      display: inline-grid;
      width: 1rem;
      height: 1rem;
      place-items: center;
      color: #52606d;
      cursor: help;
    }

    .image-header__tooltip-icon svg {
      width: 1rem;
      height: 1rem;
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .image-header__editor-meta {
      display: grid;
      gap: 0.85rem;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    }

    .image-header__meta-card {
      display: grid;
      gap: 0.25rem;
      min-width: 0;
      padding: 0.85rem 1rem;
      border: 1px solid #d9e2ec;
      border-radius: 0.85rem;
      background: #f8fafc;
    }

    .image-header__meta-card strong {
      color: #102a43;
    }

    .image-header__meta-card span {
      overflow: hidden;
      color: #52606d;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 0.92rem;
    }

    .image-header__action {
      border: 0;
      border-radius: 999px;
      padding: 0.7rem 1rem;
      background: #0f766e;
      color: #ffffff;
      cursor: pointer;
      font: inherit;
      font-weight: 700;
    }

    .image-header__action--ghost {
      border: 1px solid #bcccdc;
      background: #ffffff;
      color: #102a43;
    }

    .image-header__action--danger {
      border-color: #f1b4b4;
      color: #b42318;
    }

    .image-header__native-input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
    }

    .image-header__sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    @media (max-width: 900px) {
      .image-header__strip-shell {
        grid-template-columns: 1fr;
      }

      .image-header__modal-body {
        grid-template-columns: 1fr;
      }

      .image-header__modal {
        width: min(100%, 42rem);
        max-height: min(92vh, 58rem);
      }

      .image-header__thumb-rail {
        grid-template-columns: repeat(auto-fill, minmax(3.35rem, 1fr));
        max-height: 7.75rem;
      }

      .image-header__upload-row {
        grid-template-columns: 1fr;
      }

      .image-header__preview-frame {
        min-height: 10rem;
      }
    }

    @media (max-width: 640px) {
      .image-header__modal-backdrop {
        padding: 0.75rem;
        align-items: start;
      }

      .image-header__modal {
        width: 100%;
        max-height: calc(100vh - 1.5rem);
        padding: 1rem;
        gap: 0.85rem;
        border-radius: 0.9rem;
      }

      .image-header__modal-header,
      .image-header__modal-actions {
        align-items: stretch;
      }

      .image-header__modal-header h3 {
        font-size: 1.2rem;
      }

      .image-header__modal-preview {
        grid-template-rows: auto auto;
        padding: 0.85rem;
        min-height: 14rem;
        align-self: start;
      }

      .image-header__preview-frame {
        min-height: 9rem;
        max-height: 14rem;
        overflow: hidden;
      }

      .image-header__thumb-rail {
        grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
        max-height: 7rem;
        min-height: 0;
      }

      .image-header__modal-body {
        align-content: start;
      }

      .image-header__editor-form {
        min-width: 0;
      }

      .image-header__thumb {
        height: 3rem;
      }

      .image-header__editor-meta {
        grid-template-columns: 1fr;
      }

      .image-header__settings-row {
        grid-template-columns: 1fr;
      }

      .image-header__mode-toggle,
      .image-header__upload-button {
        width: 100%;
        justify-content: center;
      }

      .image-header__modal-actions {
        display: grid;
        grid-template-columns: 1fr;
      }

      .image-header__action {
        width: 100%;
        justify-content: center;
      }
    }
  `]
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

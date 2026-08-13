import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { DropdownFieldComponent } from '../dropdown-field/dropdown-field.component';
import { FileUploadFieldComponent } from '../file-upload-field/file-upload-field.component';
import { ImageCropFieldComponent } from '../image-crop-field/image-crop-field.component';
import { ImageHeaderFieldComponent } from '../image-header-field/image-header-field.component';
import {
  DropdownSelection,
  FormConfig,
  FormFieldConfig,
  ImageCropValue,
  ImageHeaderFieldConfig,
  FormSectionConfig,
  FormSubmissionValue,
  ImageHeaderValue,
  UploadedFileItem
} from './form-config.model';

interface ResolvedFormSection extends FormSectionConfig {
  fields: FormFieldConfig[];
}

@Component({
  selector: 'aiw-form-shell',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownFieldComponent,
    ImageCropFieldComponent,
    ImageHeaderFieldComponent,
    FileUploadFieldComponent
  ],
  templateUrl: './form-shell.component.html',
  styleUrl: './form-shell.component.css'
})
export class FormShellComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input({ required: true }) config!: FormConfig;
  @Input() initialValue: FormSubmissionValue = {};
  @Input() submitLabel = 'Submit';

  @ViewChildren('formGrid') private readonly formGrids!: QueryList<ElementRef<HTMLElement>>;

  @Output() submitForm = new EventEmitter<FormSubmissionValue>();
  @Output() cancelForm = new EventEmitter<void>();

  private readonly formBuilder = new FormBuilder();
  private readonly gridResizeObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver((entries) => {
          entries.forEach((entry) => this.updateGridColumnCount(entry.target as HTMLElement));
        })
      : null;
  private gridChangesSubscription?: Subscription;

  protected form: FormGroup = this.formBuilder.group({});
  protected collapsedSections: Record<string, boolean> = {};
  protected isConfirmationOpen = false;

  protected get resolvedFieldsPerLine(): number {
    return this.getPositiveNumber(this.config.fieldsPerLine, 1);
  }

  protected get resolvedFieldSpacing(): string {
    return this.config.fieldSpacing ?? '1rem';
  }

  protected get resolvedFieldMinWidth(): string {
    return this.config.fieldMinWidth ?? '18rem';
  }

  protected get resolvedFormWidth(): string {
    return this.config.formWidth ?? '100%';
  }

  protected get resolvedFormMarginLeft(): string {
    if (this.config.formAlign === 'right') {
      return 'auto';
    }

    return this.config.formAlign === 'center' || !this.config.formAlign ? 'auto' : '0';
  }

  protected get resolvedFormMarginRight(): string {
    if (this.config.formAlign === 'left') {
      return 'auto';
    }

    return this.config.formAlign === 'center' || !this.config.formAlign ? 'auto' : '0';
  }

  protected get visibleFields(): FormFieldConfig[] {
    return (this.config.fields ?? []).filter(
      (field) => !field.hidden && field.type !== 'image-header'
    );
  }

  protected get visibleUnsectionedFields(): FormFieldConfig[] {
    return this.visibleFields.filter((field) => !field.section);
  }

  protected get visibleSections(): ResolvedFormSection[] {
    return this.resolveSectionsFromFields().filter((section) => section.fields.length > 0);
  }

  protected get hasSections(): boolean {
    return this.visibleSections.length > 0;
  }

  protected get hasUnsectionedFields(): boolean {
    return this.visibleUnsectionedFields.length > 0;
  }

  protected get topImageHeaderField(): ImageHeaderFieldConfig | null {
    const fields = this.getAllFields();
    const imageHeaderField = fields.find(
      (field): field is ImageHeaderFieldConfig =>
        !field.hidden && field.type === 'image-header'
    );

    return imageHeaderField ?? null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] || changes['initialValue']) {
      this.rebuildForm();
      queueMicrotask(() => this.observeFormGrids());
    }
  }

  ngAfterViewInit(): void {
    this.observeFormGrids();
    this.gridChangesSubscription = this.formGrids.changes.subscribe(() => this.observeFormGrids());
  }

  ngOnDestroy(): void {
    this.gridResizeObserver?.disconnect();
    this.gridChangesSubscription?.unsubscribe();
  }

  protected getVisibleSectionFields(section: ResolvedFormSection): FormFieldConfig[] {
    return section.fields.filter((field) => !field.hidden && field.type !== 'image-header');
  }

  protected isSectionCollapsed(sectionKey: string): boolean {
    return this.collapsedSections[sectionKey] ?? false;
  }

  protected toggleSection(sectionKey: string): void {
    this.collapsedSections[sectionKey] = !this.isSectionCollapsed(sectionKey);
    requestAnimationFrame(() => this.observeFormGrids());
  }

  protected trackSectionByKey(_: number, section: ResolvedFormSection): string {
    return section.key;
  }

  protected trackFieldByKey(_: number, field: FormFieldConfig): string {
    return field.key;
  }

  protected getFieldColSpan(field: FormFieldConfig): number {
    return Math.min(field.colSpan ?? 1, this.resolvedFieldsPerLine);
  }

  protected getFieldValueTooltip(fieldKey: string): string | null {
    const value = this.form.get(fieldKey)?.value;

    if (value === null || value === undefined || value === '') {
      return null;
    }

    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }

  protected handleSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.config.requireSubmitConfirmation) {
      this.isConfirmationOpen = true;
      return;
    }

    this.emitSubmission();
  }

  protected closeConfirmation(): void {
    this.isConfirmationOpen = false;
  }

  protected confirmSubmit(): void {
    this.closeConfirmation();
    this.emitSubmission();
  }

  protected getErrorMessage(field: FormFieldConfig): string | null {
    const control = this.form.get(field.key);

    if (!control || !control.touched || !control.errors) {
      return null;
    }

    if (control.errors['required']) {
      if (field.type === 'dropdown') {
        return `Please choose a ${field.label.toLowerCase()}.`;
      }

      if (field.type === 'image-header') {
        return `Please add an image.`;
      }

      if (field.type === 'image-crop') {
        return `Please add an image.`;
      }

      if (field.type === 'file-upload') {
        return `Please add ${field.multiple ? 'at least one file' : 'a file'}.`;
      }

      return `${field.label} is required.`;
    }

    if (field.type === 'number' && control.errors['min']) {
      return `${field.label} must be at least ${field.min}.`;
    }

    if (field.type === 'number' && control.errors['max']) {
      return `${field.label} must be at most ${field.max}.`;
    }

    return 'Please review this field.';
  }

  private rebuildForm(): void {
    const controls = this.getAllFields().reduce<Record<string, FormControl>>(
      (accumulator, field) => {
        accumulator[field.key] = this.createControl(field);
        return accumulator;
      },
      {}
    );

    this.form = this.formBuilder.group(controls);
    this.collapsedSections = Object.fromEntries(
      this.resolveSectionsFromFields().map((section) => [
        section.key,
        !!section.collapsible && !!section.collapsedByDefault
      ])
    );
    this.isConfirmationOpen = false;
  }

  private createControl(field: FormFieldConfig): FormControl {
    const initialValue = this.initialValue[field.key] ?? this.getDefaultValue(field);
    const validators = [];

    if (field.required) {
      if (field.type === 'dropdown') {
        validators.push(this.createDropdownRequiredValidator());
      } else if (field.type === 'image-crop') {
        validators.push(this.createImageCropRequiredValidator());
      } else if (field.type === 'image-header') {
        validators.push(this.createImageHeaderRequiredValidator());
      } else if (field.type === 'file-upload') {
        validators.push(this.createFileUploadRequiredValidator());
      } else if (field.type !== 'checkbox') {
        validators.push(Validators.required);
      }
    }

    if (field.type === 'number') {
      if (field.min !== undefined) {
        validators.push(Validators.min(field.min));
      }

      if (field.max !== undefined) {
        validators.push(Validators.max(field.max));
      }
    }

    return this.formBuilder.control(
      { value: initialValue, disabled: !!field.disabled },
      validators
    );
  }

  private getDefaultValue(field: FormFieldConfig): unknown {
    if (field.type === 'checkbox') {
      return false;
    }

    if (
      field.type === 'dropdown' ||
      field.type === 'image-crop' ||
      field.type === 'image-header' ||
      field.type === 'file-upload'
    ) {
      return null;
    }

    return '';
  }

  private getAllFields(): FormFieldConfig[] {
    return this.config.fields ?? [];
  }

  private resolveSectionsFromFields(): ResolvedFormSection[] {
    const sections = new Map<string, ResolvedFormSection>();

    (this.config.sections ?? []).forEach((section) => {
      sections.set(section.key, {
        ...section,
        fields: []
      });
    });

    this.getAllFields().forEach((field) => {
      const fieldSection = this.resolveFieldSection(field);

      if (!fieldSection) {
        return;
      }

      const existingSection = sections.get(fieldSection.key);

      if (existingSection) {
        existingSection.fields.push(field);
        return;
      }

      sections.set(fieldSection.key, {
        ...fieldSection,
        fields: [field]
      });
    });

    return Array.from(sections.values());
  }

  private resolveFieldSection(field: FormFieldConfig): FormSectionConfig | null {
    if (!field.section) {
      return null;
    }

    const configuredSection = (this.config.sections ?? []).find(
      (section) => section.key === field.section
    );

    if (configuredSection) {
      return configuredSection;
    }

    return {
      key: field.section,
      title: this.createSectionTitle(field.section)
    };
  }

  private createSectionTitle(sectionKey: string): string {
    return sectionKey
      .trim()
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  private createDropdownRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as DropdownSelection | null;

      if (!value) {
        return { required: true };
      }

      if (value.isOther) {
        return value.otherValue?.trim() ? null : { required: true };
      }

      return value.selectedKey !== undefined && value.selectedKey !== null && value.selectedKey !== ''
        ? null
        : { required: true };
    };
  }

  private createImageHeaderRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as ImageHeaderValue[] | ImageHeaderValue | null;

      if (!value) {
        return { required: true };
      }

      if (Array.isArray(value)) {
        return value.length > 0 ? null : { required: true };
      }

      return value.file || value.sourceUrl || value.previewUrl ? null : { required: true };
    };
  }

  private createImageCropRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as ImageCropValue | null;

      if (!value) {
        return { required: true };
      }

      return value.file || value.sourceUrl || value.previewUrl ? null : { required: true };
    };
  }

  private createFileUploadRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as UploadedFileItem[] | UploadedFileItem | null;

      if (!value) {
        return { required: true };
      }

      if (Array.isArray(value)) {
        return value.length > 0 ? null : { required: true };
      }

      return value.file || value.sourceUrl || value.previewUrl ? null : { required: true };
    };
  }

  private emitSubmission(): void {
    this.submitForm.emit(this.form.getRawValue());
  }

  private observeFormGrids(): void {
    this.gridResizeObserver?.disconnect();

    this.formGrids?.forEach(({ nativeElement }) => {
      this.updateGridColumnCount(nativeElement);
      this.gridResizeObserver?.observe(nativeElement);
    });
  }

  private updateGridColumnCount(gridElement: HTMLElement): void {
    const styles = getComputedStyle(gridElement);
    const maxColumns = this.getPositiveNumber(Number(styles.getPropertyValue('--fields-per-line')), 1);
    const minFieldWidth = this.parseCssSizeToPixels(
      styles.getPropertyValue('--field-min-width'),
      gridElement,
      288
    );
    const columnGap = this.parseCssSizeToPixels(styles.columnGap, gridElement, 0);
    const availableWidth = gridElement.clientWidth;
    const activeColumns = Math.max(
      1,
      Math.min(maxColumns, Math.floor((availableWidth + columnGap) / (minFieldWidth + columnGap)))
    );

    gridElement.style.setProperty('--active-fields-per-line', String(activeColumns));

    gridElement.querySelectorAll<HTMLElement>('.form-shell__field').forEach((fieldElement) => {
      const requestedSpan = this.getPositiveNumber(
        Number(getComputedStyle(fieldElement).getPropertyValue('--field-span')),
        1
      );

      fieldElement.style.setProperty('--active-field-span', String(Math.min(requestedSpan, activeColumns)));
    });
  }

  private getPositiveNumber(value: number | undefined, fallback: number): number {
    if (value === undefined || !Number.isFinite(value) || value <= 0) {
      return fallback;
    }

    return Math.floor(value);
  }

  private parseCssSizeToPixels(value: string, contextElement: HTMLElement, fallback: number): number {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return fallback;
    }

    if (trimmedValue.endsWith('px')) {
      return Number.parseFloat(trimmedValue) || fallback;
    }

    if (trimmedValue.endsWith('rem')) {
      const rootFontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
      return (Number.parseFloat(trimmedValue) || 0) * rootFontSize || fallback;
    }

    if (trimmedValue.endsWith('em')) {
      const contextFontSize = Number.parseFloat(getComputedStyle(contextElement).fontSize);
      return (Number.parseFloat(trimmedValue) || 0) * contextFontSize || fallback;
    }

    return Number.parseFloat(trimmedValue) || fallback;
  }
}

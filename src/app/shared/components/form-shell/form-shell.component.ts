import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
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
export class FormShellComponent implements OnChanges {
  @Input({ required: true }) config!: FormConfig;
  @Input() initialValue: FormSubmissionValue = {};
  @Input() submitLabel = 'Submit';

  @Output() submitForm = new EventEmitter<FormSubmissionValue>();
  @Output() cancelForm = new EventEmitter<void>();

  private readonly formBuilder = new FormBuilder();

  protected form: FormGroup = this.formBuilder.group({});
  protected collapsedSections: Record<string, boolean> = {};
  protected isConfirmationOpen = false;

  protected get resolvedFieldsPerLine(): 1 | 2 | 3 {
    return this.config.fieldsPerLine ?? 1;
  }

  protected get resolvedFieldSpacing(): string {
    return this.config.fieldSpacing ?? '1rem';
  }

  protected get visibleFields(): FormFieldConfig[] {
    return (this.config.fields ?? []).filter(
      (field) => !field.hidden && field.type !== 'image-header'
    );
  }

  protected get visibleSections(): FormSectionConfig[] {
    return (this.config.sections ?? []).filter(
      (section) => this.getVisibleSectionFields(section).length > 0
    );
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
    }
  }

  protected getVisibleSectionFields(section: FormSectionConfig): FormFieldConfig[] {
    return section.fields.filter((field) => !field.hidden && field.type !== 'image-header');
  }

  protected isSectionCollapsed(sectionKey: string): boolean {
    return this.collapsedSections[sectionKey] ?? false;
  }

  protected toggleSection(sectionKey: string): void {
    this.collapsedSections[sectionKey] = !this.isSectionCollapsed(sectionKey);
  }

  protected trackSectionByKey(_: number, section: FormSectionConfig): string {
    return section.key;
  }

  protected trackFieldByKey(_: number, field: FormFieldConfig): string {
    return field.key;
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
      (this.config.sections ?? []).map((section) => [
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
    if (this.config.layout === 'sectioned') {
      return (this.config.sections ?? []).flatMap((section) => section.fields);
    }

    return this.config.fields ?? [];
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
}

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
import { PictureUploadFieldComponent } from '../picture-upload-field/picture-upload-field.component';
import {
  DropdownSelection,
  FormConfig,
  FormFieldConfig,
  FormSectionConfig,
  FormSubmissionValue,
  UploadedImageItem
} from './form-config.model';

@Component({
  selector: 'aiw-form-shell',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownFieldComponent,
    PictureUploadFieldComponent
  ],
  template: `
    <form
      class="form-shell"
      [formGroup]="form"
      (ngSubmit)="handleSubmit()"
      novalidate
    >
      <div class="form-shell__content">
        <ng-container *ngIf="config.layout === 'simple'; else sectionedLayout">
          <section class="form-shell__panel">
            <div
              class="form-shell__grid"
              [style.--fields-per-line]="resolvedFieldsPerLine"
              [style.--field-gap]="resolvedFieldSpacing"
            >
              <ng-container *ngFor="let field of visibleFields; trackBy: trackFieldByKey">
                <ng-container
                  *ngTemplateOutlet="fieldTemplate; context: { $implicit: field }"
                />
              </ng-container>
            </div>
          </section>
        </ng-container>

        <ng-template #sectionedLayout>
          <section
            *ngFor="let section of visibleSections; trackBy: trackSectionByKey"
            class="form-shell__panel"
          >
            <button
              *ngIf="section.collapsible"
              type="button"
              class="form-shell__section-toggle"
              (click)="toggleSection(section.key)"
            >
              <span>{{ section.title }}</span>
              <span>{{ isSectionCollapsed(section.key) ? '+' : '-' }}</span>
            </button>

            <div *ngIf="!section.collapsible" class="form-shell__section-header">
              <h3>{{ section.title }}</h3>
            </div>

            <div
              *ngIf="!isSectionCollapsed(section.key)"
              class="form-shell__grid"
              [style.--fields-per-line]="resolvedFieldsPerLine"
              [style.--field-gap]="resolvedFieldSpacing"
            >
              <ng-container *ngFor="let field of getVisibleSectionFields(section); trackBy: trackFieldByKey">
                <ng-container
                  *ngTemplateOutlet="fieldTemplate; context: { $implicit: field }"
                />
              </ng-container>
            </div>
          </section>
        </ng-template>
      </div>

      <ng-template #fieldTemplate let-field>
        <div
          class="form-shell__field"
          [style.grid-column]="'span ' + (field.colSpan ?? 1)"
        >
          <ng-container [ngSwitch]="field.type">
            <label *ngSwitchCase="'text'" class="form-shell__control">
              <span class="form-shell__label" [title]="field.label">{{ field.label }}</span>
              <input
                type="text"
                [formControlName]="field.key"
                [placeholder]="field.placeholder ?? ''"
                [title]="getFieldValueTooltip(field.key)"
              />
            </label>

            <label *ngSwitchCase="'textarea'" class="form-shell__control">
              <span class="form-shell__label" [title]="field.label">{{ field.label }}</span>
              <textarea
                [formControlName]="field.key"
                [rows]="field.rows ?? 4"
                [placeholder]="field.placeholder ?? ''"
                [title]="getFieldValueTooltip(field.key)"
              ></textarea>
            </label>

            <label *ngSwitchCase="'number'" class="form-shell__control">
              <span class="form-shell__label" [title]="field.label">{{ field.label }}</span>
              <input
                type="number"
                [formControlName]="field.key"
                [attr.min]="field.min ?? null"
                [attr.max]="field.max ?? null"
                [attr.step]="field.step ?? null"
                [placeholder]="field.placeholder ?? ''"
                [title]="getFieldValueTooltip(field.key)"
              />
            </label>

            <label *ngSwitchCase="'date'" class="form-shell__control">
              <span class="form-shell__label" [title]="field.label">{{ field.label }}</span>
              <input
                type="date"
                [formControlName]="field.key"
                [attr.min]="field.min ?? null"
                [attr.max]="field.max ?? null"
                [title]="getFieldValueTooltip(field.key)"
              />
            </label>

            <label *ngSwitchCase="'checkbox'" class="form-shell__checkbox">
              <input type="checkbox" [formControlName]="field.key" />
              <span class="form-shell__label" [title]="field.label">{{ field.label }}</span>
            </label>

            <label *ngSwitchCase="'dropdown'" class="form-shell__control">
              <span class="form-shell__label" [title]="field.label">{{ field.label }}</span>
              <aiw-dropdown-field
                [formControlName]="field.key"
                [options]="field.options"
                [searchable]="field.searchable ?? false"
                [allowOther]="field.allowOther ?? false"
                [placeholder]="field.placeholder ?? 'Select an option'"
              />
            </label>

            <div *ngSwitchCase="'picture-upload'" class="form-shell__control">
              <span class="form-shell__label" [title]="field.label">{{ field.label }}</span>
              <aiw-picture-upload-field
                [formControlName]="field.key"
                [multiple]="field.multiple ?? false"
                [previewShape]="field.previewShape ?? 'rect'"
                [aspectRatio]="field.aspectRatio"
                [maxFiles]="field.maxFiles"
                [accept]="field.accept"
              />
            </div>

            <div *ngSwitchDefault class="form-shell__unsupported">
              <strong class="form-shell__label" [title]="field.label">{{ field.label }}</strong>
              <p>
                {{ field.type }} will plug in during the custom-field phases.
              </p>
            </div>
          </ng-container>

          <p
            *ngIf="field.helperText"
            class="form-shell__helper"
            [title]="field.helperText"
          >
            {{ field.helperText }}
          </p>

          <p *ngIf="getErrorMessage(field) as errorMessage" class="form-shell__error">
            {{ errorMessage }}
          </p>
        </div>
      </ng-template>

      <footer class="form-shell__footer">
        <div class="form-shell__actions">
          <button type="button" class="form-shell__button form-shell__button--ghost" (click)="cancelForm.emit()">
            Cancel
          </button>
          <button type="submit" class="form-shell__button">
            {{ submitLabel }}
          </button>
        </div>
      </footer>
    </form>

    <div
      *ngIf="isConfirmationOpen"
      class="form-shell__modal-backdrop"
      (click)="closeConfirmation()"
    >
      <section class="form-shell__modal" (click)="$event.stopPropagation()">
        <h3>{{ config.submitConfirmationTitle || 'Confirm submission' }}</h3>
        <p>
          {{
            config.submitConfirmationMessage ||
            'Please confirm before we submit this form.'
          }}
        </p>
        <div class="form-shell__modal-actions">
          <button
            type="button"
            class="form-shell__button form-shell__button--ghost"
            (click)="closeConfirmation()"
          >
            Go back
          </button>
          <button type="button" class="form-shell__button" (click)="confirmSubmit()">
            Confirm
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .form-shell {
      display: grid;
      grid-template-rows: minmax(0, 1fr) auto;
      gap: 1rem;
      min-height: 100%;
      align-content: stretch;
    }

    .form-shell__content {
      display: grid;
      gap: 1rem;
      align-content: start;
      min-height: 0;
    }

    .form-shell__panel {
      display: grid;
      gap: 1rem;
      padding: 1.25rem;
      border: 1px solid #d9e2ec;
      border-radius: 0.85rem;
      background: #ffffff;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
      overflow: visible;
    }

    .form-shell__section-header h3 {
      margin: 0;
      color: #102a43;
    }

    .form-shell__section-toggle {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      width: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      color: #102a43;
      cursor: pointer;
      font: inherit;
      font-weight: 700;
    }

    .form-shell__grid {
      display: grid;
      gap: var(--field-gap, 1rem);
      grid-template-columns: repeat(var(--fields-per-line, 1), minmax(0, 1fr));
      align-items: start;
    }

    .form-shell__field {
      display: grid;
      gap: 0.45rem;
      min-width: 0;
      max-width: 100%;
    }

    .form-shell__control {
      display: grid;
      gap: 0.45rem;
      min-width: 0;
      color: #243b53;
      font-weight: 600;
    }

    .form-shell__label {
      display: block;
      min-width: 0;
      max-width: 100%;
      overflow: visible;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: help;
    }

    .form-shell__control input,
    .form-shell__control textarea {
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      padding: 0.8rem 0.9rem;
      border: 1px solid #bcccdc;
      border-radius: 0.7rem;
      background: #ffffff;
      color: #102a43;
      font: inherit;
      resize: vertical;
    }

    .form-shell__control input:focus,
    .form-shell__control textarea:focus {
      outline: 2px solid rgba(56, 178, 172, 0.2);
      border-color: #38b2ac;
    }

    .form-shell__checkbox {
      display: inline-flex;
      align-items: center;
      gap: 0.65rem;
      min-width: 0;
      color: #102a43;
      font-weight: 600;
    }

    .form-shell__checkbox input {
      width: 1rem;
      height: 1rem;
      flex: 0 0 auto;
    }

    .form-shell__helper,
    .form-shell__error,
    .form-shell__unsupported p {
      margin: 0;
    }

    .form-shell__helper {
      display: block;
      max-width: 100%;
      overflow: visible;
      color: #52606d;
      font-size: 0.9rem;
      text-overflow: ellipsis;
      white-space: nowrap;
      cursor: help;
    }

    .form-shell__error {
      color: #b42318;
      font-size: 0.9rem;
    }

    .form-shell__unsupported {
      display: grid;
      gap: 0.35rem;
      max-width: 100%;
      box-sizing: border-box;
      padding: 0.9rem 1rem;
      border: 1px dashed #bcccdc;
      border-radius: 0.75rem;
      background: #f8fafc;
      color: #486581;
    }

    .form-shell__footer {
      display: flex;
      justify-content: flex-end;
      margin-top: auto;
      padding-top: 0.25rem;
    }

    .form-shell__actions,
    .form-shell__modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .form-shell__actions {
      width: fit-content;
      margin-left: auto;
      padding: 0.25rem 0;
    }

    .form-shell__button {
      border: 0;
      border-radius: 999px;
      padding: 0.8rem 1.2rem;
      background: #0f766e;
      color: #ffffff;
      cursor: pointer;
      font: inherit;
      font-weight: 700;
    }

    .form-shell__button--ghost {
      border: 1px solid #bcccdc;
      background: #ffffff;
      color: #102a43;
    }

    .form-shell__modal-backdrop {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 1.5rem;
      background: rgba(15, 23, 42, 0.45);
      z-index: 1000;
    }

    .form-shell__modal {
      width: min(100%, 30rem);
      display: grid;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 1rem;
      background: #ffffff;
      box-shadow: 0 32px 80px rgba(15, 23, 42, 0.24);
    }

    .form-shell__modal h3,
    .form-shell__modal p {
      margin: 0;
    }

    @media (max-width: 720px) {
      .form-shell__grid {
        grid-template-columns: 1fr;
      }

      .form-shell__field {
        grid-column: span 1 !important;
      }

      .form-shell__footer,
      .form-shell__actions {
        width: 100%;
      }
    }
  `]
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
    return (this.config.fields ?? []).filter((field) => !field.hidden);
  }

  protected get visibleSections(): FormSectionConfig[] {
    return (this.config.sections ?? []).filter(
      (section) => this.getVisibleSectionFields(section).length > 0
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] || changes['initialValue']) {
      this.rebuildForm();
    }
  }

  protected getVisibleSectionFields(section: FormSectionConfig): FormFieldConfig[] {
    return section.fields.filter((field) => !field.hidden);
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

      if (field.type === 'picture-upload') {
        return `Please add ${field.multiple ? 'at least one image' : 'an image'}.`;
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
      } else if (field.type === 'picture-upload') {
        validators.push(this.createPictureUploadRequiredValidator());
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

    if (field.type === 'dropdown' || field.type === 'picture-upload') {
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

  private createPictureUploadRequiredValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value as UploadedImageItem[] | UploadedImageItem | null;

      if (!value) {
        return { required: true };
      }

      if (Array.isArray(value)) {
        return value.length > 0 ? null : { required: true };
      }

      return value.file ? null : { required: true };
    };
  }

  private emitSubmission(): void {
    this.submitForm.emit(this.form.getRawValue());
  }
}

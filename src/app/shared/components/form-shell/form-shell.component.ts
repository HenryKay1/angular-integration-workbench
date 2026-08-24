import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  inject,
  OnDestroy,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AsyncValidatorRegistry } from '../../validation/async-validator-registry.service';
import { ValidatorRegistry } from '../../validation/validator-registry.service';
import { DropdownFieldComponent } from '../dropdown-field/dropdown-field.component';
import { FileUploadFieldComponent } from '../file-upload-field/file-upload-field.component';
import { ImageCropFieldComponent } from '../image-crop-field/image-crop-field.component';
import { ImageHeaderFieldComponent } from '../image-header-field/image-header-field.component';
import {
  DropdownOption,
  DropdownSelection,
  DropdownValue,
  FormFieldRuntimeApi,
  FormRuleContext,
  FormConfig,
  FormFieldConfig,
  ImageHeaderFieldConfig,
  FormSectionConfig,
  FormSubmissionValue,
  RuntimeFieldState,
  RuntimeFieldUpdate,
  ValidationContext
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

  private readonly formBuilder = inject(FormBuilder);
  private readonly validatorRegistry = inject(ValidatorRegistry);
  private readonly asyncValidatorRegistry = inject(AsyncValidatorRegistry);
  private readonly gridResizeObserver =
    typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver((entries) => {
          entries.forEach((entry) => this.updateGridColumnCount(entry.target as HTMLElement));
        })
      : null;
  private gridChangesSubscription?: Subscription;
  private dependencySubscriptions: Subscription[] = [];
  private ruleSubscriptions: Subscription[] = [];
  private runtimeFieldStates: Record<string, RuntimeFieldState> = {};
  private initialValueSnapshot: FormSubmissionValue = {};
  private queuedRuleIndexes = new Set<number>();
  private readonly maxRuleIterations = 50;

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
    return this.getEffectiveFields().filter(
      (field) => !this.isFieldHidden(field.key) && field.type !== 'image-header'
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
    const fields = this.getEffectiveFields();
    const imageHeaderField = fields.find(
      (field): field is ImageHeaderFieldConfig =>
        !this.isFieldHidden(field.key) && field.type === 'image-header'
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
    this.clearDependencySubscriptions();
    this.clearRuleSubscriptions();
  }

  reset(value: FormSubmissionValue = this.initialValue): void {
    this.initialValue = value;
    this.rebuildForm();
    this.form.markAsPristine();
    this.form.markAsUntouched();
    queueMicrotask(() => this.observeFormGrids());
  }

  protected getVisibleSectionFields(section: ResolvedFormSection): FormFieldConfig[] {
    return section.fields.filter((field) => !this.isFieldHidden(field.key) && field.type !== 'image-header');
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

  protected isReadonlyField(fieldKey: string): boolean {
    return this.runtimeFieldStates[fieldKey]?.readonly ?? false;
  }

  protected handleReadonlyClick(event: MouseEvent, fieldKey: string): void {
    if (this.isReadonlyField(fieldKey)) {
      event.preventDefault();
    }
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

    const firstErrorKey = Object.keys(control.errors)[0];
    const validatorConfig = [
      ...(field.validators ?? []),
      ...(field.asyncValidators ?? [])
    ].find((config) => this.getValidatorErrorKey(config.validator) === firstErrorKey);

    return validatorConfig?.message ?? 'Please review this field.';
  }

  private rebuildForm(): void {
    this.clearDependencySubscriptions();
    this.clearRuleSubscriptions();
    this.queuedRuleIndexes.clear();

    const controls = this.getAllFields().reduce<Record<string, FormControl>>(
      (accumulator, field) => {
        accumulator[field.key] = this.createControl(field);
        return accumulator;
      },
      {}
    );

    this.form = this.formBuilder.group(controls);
    this.initialValueSnapshot = this.form.getRawValue();
    this.initializeRuntimeFieldStates();
    this.collapsedSections = Object.fromEntries(
      this.resolveSectionsFromFields().map((section) => [
        section.key,
        !!section.collapsible && !!section.collapsedByDefault
      ])
    );
    this.isConfirmationOpen = false;
    this.registerValidationDependencies();
    this.registerStateRuleDependencies();
    this.queueAllStateRules();
    this.flushStateRuleQueue();
  }

  private createControl(field: FormFieldConfig): FormControl {
    const initialValue = this.initialValue[field.key] ?? this.getDefaultValue(field);
    const validators = this.validatorRegistry.resolveAll(
      field,
      field.validators ?? [],
      () => this.createValidationContext()
    );
    const asyncValidators = this.asyncValidatorRegistry.resolveAll(
      field,
      field.asyncValidators ?? [],
      () => this.createValidationContext()
    );

    return this.formBuilder.control(
      { value: initialValue, disabled: !!field.disabled },
      {
        validators,
        asyncValidators
      }
    );
  }

  private getDefaultValue(field: FormFieldConfig): unknown {
    if (field.type === 'checkbox') {
      return false;
    }

    if (field.type === 'dropdown' && field.multiSelect) {
      return [];
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

  private getEffectiveFields(): FormFieldConfig[] {
    return this.getAllFields().map((field) => this.getEffectiveField(field));
  }

  private getEffectiveField(field: FormFieldConfig): FormFieldConfig {
    const state = this.runtimeFieldStates[field.key];

    if (!state) {
      return field;
    }

    return {
      ...field,
      ...state.overrides,
      key: field.key,
      type: field.type
    } as FormFieldConfig;
  }

  private getBaseField(fieldKey: string): FormFieldConfig {
    const field = this.getAllFields().find((item) => item.key === fieldKey);

    if (!field) {
      throw new Error(`Unknown form field "${fieldKey}".`);
    }

    return field;
  }

  private initializeRuntimeFieldStates(): void {
    this.runtimeFieldStates = Object.fromEntries(
      this.getAllFields().map((field) => [
        field.key,
        {
          hidden: !!field.hidden,
          readonly: false,
          overrides: {}
        } satisfies RuntimeFieldState
      ])
    );
  }

  private isFieldHidden(fieldKey: string): boolean {
    return this.runtimeFieldStates[fieldKey]?.hidden ?? false;
  }

  private createRuntimeFieldApi(): FormFieldRuntimeApi {
    return {
      hide: (fieldKey) => this.setFieldHidden(fieldKey, true),
      show: (fieldKey) => this.setFieldHidden(fieldKey, false),
      isHidden: (fieldKey) => this.isFieldHidden(fieldKey),
      disable: (fieldKey) => this.setControlDisabled(fieldKey, true),
      enable: (fieldKey) => this.setControlDisabled(fieldKey, false),
      isDisabled: (fieldKey) => this.getControl(fieldKey).disabled,
      setReadonly: (fieldKey, readonly) => this.setFieldReadonly(fieldKey, readonly),
      isReadonly: (fieldKey) => this.runtimeFieldStates[fieldKey]?.readonly ?? false,
      clear: (fieldKey) => this.setRuntimeValue(fieldKey, this.getDefaultValue(this.getBaseField(fieldKey))),
      setValue: (fieldKey, value) => this.setRuntimeValue(fieldKey, value),
      reset: (fieldKey) => this.setRuntimeValue(fieldKey, this.initialValueSnapshot[fieldKey]),
      setOptions: (fieldKey, options) => this.setRuntimeOptions(fieldKey, options),
      update: (fieldKey, properties) => this.updateRuntimeField(fieldKey, properties)
    };
  }

  private getControl(fieldKey: string): FormControl {
    const control = this.form.get(fieldKey);

    if (!control) {
      throw new Error(`Unknown form control "${fieldKey}".`);
    }

    return control as FormControl;
  }

  private setFieldHidden(fieldKey: string, hidden: boolean): void {
    const state = this.getRuntimeFieldState(fieldKey);

    if (state.hidden === hidden) {
      return;
    }

    this.runtimeFieldStates = {
      ...this.runtimeFieldStates,
      [fieldKey]: {
        ...state,
        hidden
      }
    };

    queueMicrotask(() => this.observeFormGrids());
  }

  private setControlDisabled(fieldKey: string, disabled: boolean): void {
    const control = this.getControl(fieldKey);

    if (control.disabled === disabled) {
      return;
    }

    if (disabled) {
      control.disable({ emitEvent: false });
    } else {
      control.enable({ emitEvent: false });
    }

    control.updateValueAndValidity({ emitEvent: false });
  }

  private setFieldReadonly(fieldKey: string, readonly: boolean): void {
    const state = this.getRuntimeFieldState(fieldKey);

    if (state.readonly === readonly) {
      return;
    }

    this.runtimeFieldStates = {
      ...this.runtimeFieldStates,
      [fieldKey]: {
        ...state,
        readonly
      }
    };
  }

  private setRuntimeValue(fieldKey: string, value: unknown): void {
    const control = this.getControl(fieldKey);

    if (this.areValuesEqual(control.value, value)) {
      return;
    }

    control.setValue(value, { emitEvent: false });
    control.updateValueAndValidity({ emitEvent: false });
    this.queueStateRulesForDependency(fieldKey);
  }

  private setRuntimeOptions(fieldKey: string, options: DropdownOption[]): void {
    const field = this.getBaseField(fieldKey);

    if (field.type !== 'dropdown') {
      throw new Error(`Runtime options can only be set for dropdown field "${fieldKey}".`);
    }

    this.updateRuntimeField(fieldKey, {
      options
    });
    this.reconcileDropdownValue(fieldKey, options);
  }

  private updateRuntimeField(fieldKey: string, properties: RuntimeFieldUpdate): void {
    const state = this.getRuntimeFieldState(fieldKey);
    const { key: _key, type: _type, ...allowedProperties } = properties;
    const nextOverrides = {
      ...state.overrides,
      ...allowedProperties
    };

    if (this.areValuesEqual(state.overrides, nextOverrides)) {
      return;
    }

    this.runtimeFieldStates = {
      ...this.runtimeFieldStates,
      [fieldKey]: {
        ...state,
        overrides: nextOverrides
      }
    };
  }

  private getRuntimeFieldState(fieldKey: string): RuntimeFieldState {
    this.getBaseField(fieldKey);

    const state = this.runtimeFieldStates[fieldKey];

    if (!state) {
      throw new Error(`Runtime state missing for field "${fieldKey}".`);
    }

    return state;
  }

  private reconcileDropdownValue(fieldKey: string, options: DropdownOption[]): void {
    const field = this.getBaseField(fieldKey);
    const control = this.getControl(fieldKey);
    const validValues = new Set(options.map((option) => option.value));
    const currentValue = control.value as DropdownValue;

    if (field.type !== 'dropdown') {
      return;
    }

    if (Array.isArray(currentValue)) {
      const nextValue = currentValue.filter(
        (selection) => selection.isOther || validValues.has(selection.selectedKey ?? '')
      );

      if (!this.areValuesEqual(currentValue, nextValue)) {
        this.setRuntimeValue(fieldKey, nextValue);
      }

      return;
    }

    if (
      currentValue &&
      !currentValue.isOther &&
      !validValues.has(currentValue.selectedKey ?? '')
    ) {
      this.setRuntimeValue(fieldKey, this.getDefaultValue(field));
    }
  }

  private areValuesEqual(first: unknown, second: unknown): boolean {
    return JSON.stringify(first) === JSON.stringify(second);
  }

  private resolveSectionsFromFields(): ResolvedFormSection[] {
    const sections = new Map<string, ResolvedFormSection>();

    (this.config.sections ?? []).forEach((section) => {
      sections.set(section.key, {
        ...section,
        fields: []
      });
    });

    this.getEffectiveFields().forEach((field) => {
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

  private emitSubmission(): void {
    this.submitForm.emit(this.form.getRawValue());
  }

  private createValidationContext(): ValidationContext {
    return {
      form: this.form,
      values: this.form.getRawValue()
    };
  }

  private registerValidationDependencies(): void {
    const registeredPairs = new Set<string>();

    this.getAllFields().forEach((field) => {
      const targetControl = this.form.get(field.key);

      if (!targetControl) {
        return;
      }

      const dependencies = [
        ...(field.validators ?? []),
        ...(field.asyncValidators ?? [])
      ].flatMap((config) => config.dependsOn ?? []);

      new Set(dependencies).forEach((dependencyKey) => {
        const pairKey = `${dependencyKey}->${field.key}`;

        if (registeredPairs.has(pairKey)) {
          return;
        }

        const dependencyControl = this.form.get(dependencyKey);

        if (!dependencyControl) {
          return;
        }

        registeredPairs.add(pairKey);
        this.dependencySubscriptions.push(
          dependencyControl.valueChanges.subscribe(() => {
            targetControl.updateValueAndValidity({
              emitEvent: false
            });
          })
        );
      });
    });
  }

  private clearDependencySubscriptions(): void {
    this.dependencySubscriptions.forEach((subscription) =>
      subscription.unsubscribe()
    );
    this.dependencySubscriptions = [];
  }

  private registerStateRuleDependencies(): void {
    const registeredPairs = new Set<string>();

    (this.config.stateRules ?? []).forEach((rule, ruleIndex) => {
      rule.dependsOn.forEach((dependencyKey) => {
        const pairKey = `${dependencyKey}->${ruleIndex}`;

        if (registeredPairs.has(pairKey)) {
          return;
        }

        const dependencyControl = this.form.get(dependencyKey);

        if (!dependencyControl) {
          throw new Error(
            `State rule ${ruleIndex} depends on unknown field "${dependencyKey}".`
          );
        }

        registeredPairs.add(pairKey);
        this.ruleSubscriptions.push(
          dependencyControl.valueChanges.subscribe(() => {
            this.queueStateRulesForDependency(dependencyKey);
            this.flushStateRuleQueue();
          })
        );
      });
    });
  }

  private clearRuleSubscriptions(): void {
    this.ruleSubscriptions.forEach((subscription) => subscription.unsubscribe());
    this.ruleSubscriptions = [];
  }

  private queueAllStateRules(): void {
    (this.config.stateRules ?? []).forEach((_, index) =>
      this.queuedRuleIndexes.add(index)
    );
  }

  private queueStateRulesForDependency(fieldKey: string): void {
    (this.config.stateRules ?? []).forEach((rule, index) => {
      if (rule.dependsOn.includes(fieldKey)) {
        this.queuedRuleIndexes.add(index);
      }
    });
  }

  private flushStateRuleQueue(): void {
    let iterations = 0;

    while (this.queuedRuleIndexes.size > 0) {
      if (iterations >= this.maxRuleIterations) {
        console.warn(
          `Form state rule evaluation stopped after ${this.maxRuleIterations} iterations. Check for cyclic rules.`
        );
        this.queuedRuleIndexes.clear();
        return;
      }

      const ruleIndexes = Array.from(this.queuedRuleIndexes).sort(
        (left, right) => left - right
      );
      this.queuedRuleIndexes.clear();

      ruleIndexes.forEach((ruleIndex) => {
        const rule = this.config.stateRules?.[ruleIndex];

        if (!rule) {
          return;
        }

        rule.execute(this.createFormRuleContext());
      });

      iterations += 1;
    }
  }

  private createFormRuleContext(): FormRuleContext {
    return {
      form: this.form,
      values: this.form.getRawValue(),
      fields: this.createRuntimeFieldApi()
    };
  }

  private getValidatorErrorKey(validatorName: string): string {
    return (
      this.validatorRegistry.getErrorKey(validatorName) ||
      this.asyncValidatorRegistry.getErrorKey(validatorName)
    );
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

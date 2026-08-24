import { Injectable } from '@angular/core';
import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  DropdownSelection,
  DropdownValue,
  FormFieldConfig,
  ImageCropValue,
  ImageHeaderValue,
  UploadedFileItem,
  ValidationContext,
  ValidatorConfig
} from '../components/form-shell/form-config.model';

type ValidationContextFactory = () => ValidationContext;
type SyncValidatorFactory = (
  field: FormFieldConfig,
  config: ValidatorConfig
) => ValidatorFn;

@Injectable({
  providedIn: 'root'
})
export class ValidatorRegistry {
  private readonly validators = new Map<string, SyncValidatorFactory>([
    ['required', (field) => this.createRequiredValidator(field)],
    ['min', (_, config) => Validators.min(Number(config.value))],
    ['max', (_, config) => Validators.max(Number(config.value))],
    ['minLength', (_, config) => Validators.minLength(Number(config.value))],
    ['maxLength', (_, config) => Validators.maxLength(Number(config.value))],
    ['email', () => Validators.email],
    [
      'pattern',
      (_, config) =>
        Validators.pattern(
          config.value instanceof RegExp
            ? config.value
            : String(config.value ?? '')
        )
    ]
  ]);

  resolveAll(
    field: FormFieldConfig,
    configs: ValidatorConfig[],
    contextFactory: ValidationContextFactory
  ): ValidatorFn[] {
    return configs.map((config) =>
      this.wrapConditionalValidator(
        this.resolve(field, config),
        config,
        contextFactory
      )
    );
  }

  getErrorKey(validatorName: string): string {
    const errorKeys: Record<string, string> = {
      minLength: 'minlength',
      maxLength: 'maxlength'
    };

    return errorKeys[validatorName] ?? validatorName;
  }

  private resolve(field: FormFieldConfig, config: ValidatorConfig): ValidatorFn {
    const factory = this.validators.get(config.validator);

    if (!factory) {
      throw new Error(`Unsupported validator "${config.validator}".`);
    }

    return factory(field, config);
  }

  private wrapConditionalValidator(
    validator: ValidatorFn,
    config: ValidatorConfig,
    contextFactory: ValidationContextFactory
  ): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (config.when && !config.when(contextFactory())) {
        return null;
      }

      return validator(control);
    };
  }

  private createRequiredValidator(field: FormFieldConfig): ValidatorFn {
    if (field.type === 'dropdown') {
      return (control) =>
        this.hasDropdownValue(control.value as DropdownValue)
          ? null
          : { required: true };
    }

    if (field.type === 'image-crop') {
      return (control) =>
        this.hasUploadedItem(control.value as ImageCropValue | null)
          ? null
          : { required: true };
    }

    if (field.type === 'image-header' || field.type === 'file-upload') {
      return (control) =>
        this.hasUploadedValue(
          control.value as
            | ImageHeaderValue[]
            | ImageHeaderValue
            | UploadedFileItem[]
            | UploadedFileItem
            | null
        )
          ? null
          : { required: true };
    }

    return Validators.required;
  }

  private hasDropdownValue(value: DropdownValue): boolean {
    if (!value) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (value.isOther) {
      return !!value.otherValue?.trim();
    }

    return (
      value.selectedKey !== undefined &&
      value.selectedKey !== null &&
      value.selectedKey !== ''
    );
  }

  private hasUploadedValue(
    value:
      | ImageHeaderValue[]
      | ImageHeaderValue
      | UploadedFileItem[]
      | UploadedFileItem
      | null
  ): boolean {
    if (!value) {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return this.hasUploadedItem(value);
  }

  private hasUploadedItem(value: UploadedFileItem | null): boolean {
    return !!(value?.file || value?.sourceUrl || value?.previewUrl);
  }
}

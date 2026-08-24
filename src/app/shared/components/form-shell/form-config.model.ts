import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';

export interface ValidationContext {
  form: FormGroup;
  values: Record<string, unknown>;
}

export interface BaseValidatorConfig {
  validator: string;
  message?: string;
  dependsOn?: string[];
  when?: (context: ValidationContext) => boolean;
}

export interface ValidatorConfig extends BaseValidatorConfig {
  value?: unknown;
}

export interface AsyncValidationResult {
  isValid: boolean;
  message?: string | null;
}

export interface AsyncValidatorConfig extends BaseValidatorConfig {
  debounceMs?: number;
  validate?: (
    value: unknown,
    context: ValidationContext
  ) => Observable<AsyncValidationResult>;
}

export interface FormFieldRuntimeApi {
  hide(fieldKey: string): void;
  show(fieldKey: string): void;
  isHidden(fieldKey: string): boolean;
  disable(fieldKey: string): void;
  enable(fieldKey: string): void;
  isDisabled(fieldKey: string): boolean;
  setReadonly(fieldKey: string, readonly: boolean): void;
  isReadonly(fieldKey: string): boolean;
  clear(fieldKey: string): void;
  setValue(fieldKey: string, value: unknown): void;
  reset(fieldKey: string): void;
  setOptions(fieldKey: string, options: DropdownOption[]): void;
  update(fieldKey: string, properties: RuntimeFieldUpdate): void;
}

export interface FormRuleContext {
  form: FormGroup;
  values: Record<string, unknown>;
  fields: FormFieldRuntimeApi;
}

export interface FormStateRule {
  dependsOn: string[];
  execute: (context: FormRuleContext) => void;
}

export type RuntimeFieldUpdate = Partial<
  Omit<BaseFieldConfig, 'key' | 'type'>
> &
  Record<string, unknown>;

export interface RuntimeFieldState {
  hidden: boolean;
  readonly: boolean;
  overrides: RuntimeFieldUpdate;
}

export interface BaseFieldConfig {
  key: string;
  label: string;
  type: string;
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  helperText?: string;
  colSpan?: number;
  align?: 'left' | 'center' | 'right';
  section?: string;
  validators?: ValidatorConfig[];
  asyncValidators?: AsyncValidatorConfig[];
}

export interface TextFieldConfig extends BaseFieldConfig {
  type: 'text';
  placeholder?: string;
}

export interface TextAreaFieldConfig extends BaseFieldConfig {
  type: 'textarea';
  placeholder?: string;
  rows?: number;
}

export interface NumberFieldConfig extends BaseFieldConfig {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  type: 'checkbox';
  controlStyle?: 'checkbox' | 'toggle';
}

export interface DateFieldConfig extends BaseFieldConfig {
  type: 'date';
  min?: string;
  max?: string;
}

export interface DropdownOption {
  label: string;
  value: string | number;
}

export interface DropdownFieldConfig extends BaseFieldConfig {
  type: 'dropdown';
  options: DropdownOption[];
  searchable?: boolean;
  allowOther?: boolean;
  multiSelect?: boolean;
  clearable?: boolean;
  clearLabel?: string;
  placeholder?: string;
}

export type ImageHeaderSize = 'sm' | 'md' | 'lg';
export type ImageHeaderPosition = 'left' | 'center' | 'right';
export type ImageHeaderShape = 'circle' | 'rectangle' | 'square' | 'triangle';
export type ImageHeaderDisplayMode = 'scroll' | 'slideshow';
export type ImageHeaderItemsPerPage = 1 | 2 | 3 | 4 | 5;

export interface ImageCropSettings {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export type ImageCropShape = 'circle' | 'square' | 'rectangle' | 'triangle';

export interface ImageCropFieldConfig extends BaseFieldConfig {
  type: 'image-crop';
  accept?: string;
  shape?: ImageCropShape;
  frameSizePx?: number;
  minFrameSizePx?: number;
  maxFrameSizePx?: number;
  rectangleAspectRatio?: string;
  showFrame?: boolean;
}

export interface ImageHeaderFieldConfig extends BaseFieldConfig {
  type: 'image-header';
  accept?: string;
  defaultPosition?: ImageHeaderPosition;
  profileType?: boolean;
  size?: ImageHeaderSize;
  frameSizePx?: number;
  multiple?: boolean;
  maxFiles?: number;
  showLabels?: boolean;
  shape?: ImageHeaderShape;
  displayMode?: ImageHeaderDisplayMode;
  itemsPerPage?: ImageHeaderItemsPerPage;
  slideshowIntervalSeconds?: number;
}

export interface FileUploadFieldConfig extends BaseFieldConfig {
  type: 'file-upload';
  multiple?: boolean;
  maxFiles?: number;
  accept?: string;
  allowAssignedFilename?: boolean;
}

export type FormFieldConfig =
  | TextFieldConfig
  | TextAreaFieldConfig
  | NumberFieldConfig
  | CheckboxFieldConfig
  | DateFieldConfig
  | DropdownFieldConfig
  | ImageCropFieldConfig
  | ImageHeaderFieldConfig
  | FileUploadFieldConfig;

export interface FormSectionConfig {
  key: string;
  title: string;
  collapsible?: boolean;
  collapsedByDefault?: boolean;
}

export interface FormConfig {
  formWidth?: string;
  formAlign?: 'left' | 'center' | 'right';
  fieldsPerLine?: number;
  fieldMinWidth?: string;
  fieldSpacing?: string;
  sections?: FormSectionConfig[];
  fields?: FormFieldConfig[];
  requireSubmitConfirmation?: boolean;
  submitConfirmationTitle?: string;
  submitConfirmationMessage?: string;
  stateRules?: FormStateRule[];
}

export interface DropdownSelection {
  selectedKey?: string | number;
  selectedLabel?: string;
  isOther?: boolean;
  otherValue?: string;
}

export type DropdownValue = DropdownSelection | DropdownSelection[] | null;

export interface UploadedFileItem {
  id: string;
  file?: File;
  originalName: string;
  assignedName?: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  previewUrl?: string;
  sourceUrl?: string;
  status?: 'new';
}

export interface ImageCropValue extends UploadedFileItem {
  shape: ImageCropShape;
  frameSizePx: number;
  showFrame: boolean;
  crop: ImageCropSettings;
  rectangleAspectRatio?: string;
}

export interface ImageHeaderValue extends UploadedFileItem {
  position: ImageHeaderPosition;
  profileType: boolean;
  size: ImageHeaderSize;
  frameSizePx?: number;
  shape?: ImageHeaderShape;
  crop?: ImageCropSettings;
  displayMode?: ImageHeaderDisplayMode;
  itemsPerPage?: ImageHeaderItemsPerPage;
  slideshowIntervalSeconds?: number;
  hidden?: boolean;
}

export type FormSubmissionValue = Record<string, unknown>;

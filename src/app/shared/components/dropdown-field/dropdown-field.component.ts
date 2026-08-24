import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  Input,
  forwardRef,
  inject
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
  DropdownValue,
  DropdownOption,
  DropdownSelection
} from '../form-shell/form-config.model';

@Component({
  selector: 'aiw-dropdown-field',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownFieldComponent),
      multi: true
    }
  ],
  templateUrl: './dropdown-field.component.html',
  styleUrl: './dropdown-field.component.css'
})
export class DropdownFieldComponent implements ControlValueAccessor {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Select an option';
  @Input() searchable = false;
  @Input() allowOther = false;
  @Input() multiSelect = false;
  @Input() readonly = false;
  @Input() clearable: boolean | null = null;
  @Input() clearLabel: string | null = null;

  protected selection: DropdownValue = null;
  protected searchTerm = '';
  protected otherDraft = '';
  protected isOpen = false;
  protected disabled = false;

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private onChange: (value: DropdownValue) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  protected get filteredOptions(): DropdownOption[] {
    const normalized = this.searchTerm.trim().toLowerCase();

    if (!normalized) {
      return this.options;
    }

    return this.options.filter((option) =>
      option.label.toLowerCase().includes(normalized)
    );
  }

  protected get hasSelection(): boolean {
    if (Array.isArray(this.selection)) {
      return this.selection.length > 0;
    }

    if (!this.selection) {
      return false;
    }

    if (this.selection.isOther) {
      return !!this.selection.otherValue?.trim();
    }

    return !!this.selection.selectedLabel;
  }

  protected get triggerLabel(): string {
    if (!this.hasSelection) {
      return this.placeholder;
    }

    if (Array.isArray(this.selection)) {
      const labels = this.selection.map((item) => this.getSelectionLabel(item));

      if (labels.length <= 2) {
        return labels.join(', ');
      }

      return `${labels.slice(0, 2).join(', ')} +${labels.length - 2} more`;
    }

    if (this.selection?.isOther) {
      return this.selection.otherValue?.trim() || this.placeholder;
    }

    return this.selection?.selectedLabel || this.placeholder;
  }

  protected get otherPlaceholder(): string {
    if (Array.isArray(this.selection)) {
      const otherSelection = this.selection.find((item) => item.isOther);
      return otherSelection?.otherValue?.trim() || 'Or enter another value';
    }

    return this.selection?.isOther
      ? this.selection.otherValue?.trim() || 'Or enter another value'
      : 'Or enter another value';
  }

  protected get showClearOption(): boolean {
    return !this.multiSelect && (this.clearable ?? true);
  }

  protected get resolvedClearLabel(): string {
    return this.clearLabel?.trim() || this.placeholder;
  }

  writeValue(value: DropdownValue): void {
    if (this.multiSelect) {
      this.selection = Array.isArray(value) ? value : value ? [value] : [];
    } else {
      this.selection = Array.isArray(value) ? value[0] ?? null : value;
    }

    this.otherDraft = '';
  }

  registerOnChange(fn: (value: DropdownValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    if (isDisabled) {
      this.isOpen = false;
    }
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  protected toggleOpen(): void {
    if (this.disabled || this.readonly) {
      return;
    }

    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.onTouched();
    }
  }

  protected selectOption(option: DropdownOption): void {
    const nextValue: DropdownSelection = {
      selectedKey: option.value,
      selectedLabel: option.label,
      isOther: false,
      otherValue: undefined
    };

    this.searchTerm = '';
    this.otherDraft = '';

    if (this.multiSelect) {
      this.updateValue(this.toggleSelection(nextValue));
      return;
    }

    this.isOpen = false;
    this.updateValue(nextValue);
  }

  protected clearSelection(): void {
    if (this.disabled || this.readonly || this.multiSelect) {
      return;
    }

    this.searchTerm = '';
    this.otherDraft = '';
    this.isOpen = false;
    this.updateValue(null);
  }

  protected handleClearClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.clearSelection();
  }

  protected applyOtherValue(): void {
    const trimmedValue = this.otherDraft.trim();

    const nextValue: DropdownSelection = {
      selectedKey: undefined,
      selectedLabel: 'Other',
      isOther: true,
      otherValue: trimmedValue
    };

    if (this.multiSelect) {
      this.updateValue(this.addSelection(nextValue));
    } else {
      this.isOpen = false;
      this.updateValue(nextValue);
    }

    this.otherDraft = '';
  }

  protected isOptionSelected(option: DropdownOption): boolean {
    if (Array.isArray(this.selection)) {
      return this.selection.some(
        (item) => !item.isOther && item.selectedKey === option.value
      );
    }

    return this.selection?.selectedKey === option.value && !this.selection?.isOther;
  }

  @HostListener('document:click', ['$event'])
  protected handleDocumentClick(event: MouseEvent): void {
    if (!this.isOpen) {
      return;
    }

    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
      this.onTouched();
    }
  }

  private updateValue(value: DropdownValue): void {
    this.selection = value;
    this.onChange(value);
    this.onTouched();
  }

  private toggleSelection(selection: DropdownSelection): DropdownSelection[] {
    const selections = this.getSelections();
    const exists = selections.some(
      (item) => !item.isOther && item.selectedKey === selection.selectedKey
    );

    if (exists) {
      return selections.filter(
        (item) => item.isOther || item.selectedKey !== selection.selectedKey
      );
    }

    return [...selections, selection];
  }

  private addSelection(selection: DropdownSelection): DropdownSelection[] {
    const selections = this.getSelections();

    if (selection.isOther) {
      return [
        ...selections.filter(
          (item) =>
            !item.isOther ||
            item.otherValue?.trim().toLowerCase() !==
              selection.otherValue?.trim().toLowerCase()
        ),
        selection
      ];
    }

    return this.toggleSelection(selection);
  }

  private getSelections(): DropdownSelection[] {
    if (Array.isArray(this.selection)) {
      return this.selection;
    }

    return this.selection ? [this.selection] : [];
  }

  private getSelectionLabel(selection: DropdownSelection): string {
    if (selection.isOther) {
      return selection.otherValue?.trim() || 'Other';
    }

    return selection.selectedLabel || String(selection.selectedKey ?? '');
  }
}


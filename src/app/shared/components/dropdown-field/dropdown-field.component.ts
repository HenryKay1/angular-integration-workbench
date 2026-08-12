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

  protected selection: DropdownSelection | null = null;
  protected searchTerm = '';
  protected otherDraft = '';
  protected isOpen = false;
  protected disabled = false;

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private onChange: (value: DropdownSelection | null) => void = () => undefined;
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

    if (this.selection?.isOther) {
      return this.selection.otherValue?.trim() || this.placeholder;
    }

    return this.selection?.selectedLabel || this.placeholder;
  }

  protected get otherPlaceholder(): string {
    return this.selection?.isOther
      ? this.selection.otherValue?.trim() || 'Or enter another value'
      : 'Or enter another value';
  }

  writeValue(value: DropdownSelection | null): void {
    this.selection = value;
    this.otherDraft = '';
  }

  registerOnChange(fn: (value: DropdownSelection | null) => void): void {
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
    if (this.disabled) {
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
    this.isOpen = false;
    this.updateValue(nextValue);
  }

  protected applyOtherValue(): void {
    const trimmedValue = this.otherDraft.trim();

    this.isOpen = false;
    this.updateValue({
      selectedKey: undefined,
      selectedLabel: 'Other',
      isOther: true,
      otherValue: trimmedValue
    });
    this.otherDraft = '';
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

  private updateValue(value: DropdownSelection | null): void {
    this.selection = value;
    this.onChange(value);
    this.onTouched();
  }
}


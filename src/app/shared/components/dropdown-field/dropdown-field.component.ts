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
  template: `
    <div class="dropdown-field" [class.dropdown-field--disabled]="disabled">
      <button
        type="button"
        class="dropdown-field__trigger"
        [class.dropdown-field__trigger--open]="isOpen"
        [class.dropdown-field__trigger--placeholder]="!hasSelection"
        [disabled]="disabled"
        (click)="toggleOpen()"
        (blur)="handleBlur()"
        [title]="triggerLabel"
      >
        <span class="dropdown-field__trigger-text">{{ triggerLabel }}</span>
        <span class="dropdown-field__trigger-icon" aria-hidden="true">
          <svg viewBox="0 0 20 20" focusable="false">
            <path d="M5.25 7.5 10 12.25 14.75 7.5" />
          </svg>
        </span>
      </button>

      <div *ngIf="isOpen" class="dropdown-field__overlay">
        <div class="dropdown-field__menu">
          <label *ngIf="searchable" class="dropdown-field__search">
            <span class="dropdown-field__sr-only">Search options</span>
            <input
              type="search"
              [(ngModel)]="searchTerm"
              placeholder="Search options"
            />
          </label>

          <div class="dropdown-field__options">
            <button
              *ngFor="let option of filteredOptions"
              type="button"
              class="dropdown-field__option"
              [class.dropdown-field__option--active]="selection?.selectedKey === option.value && !selection?.isOther"
              (click)="selectOption(option)"
              [title]="option.label"
            >
              <span class="dropdown-field__option-text">{{ option.label }}</span>
            </button>

            <p *ngIf="filteredOptions.length === 0" class="dropdown-field__empty">
              No matching options.
            </p>
          </div>

          <div *ngIf="allowOther" class="dropdown-field__other-row">
            <input
              type="text"
              class="dropdown-field__other-input"
              [(ngModel)]="otherDraft"
              [placeholder]="otherPlaceholder"
              [disabled]="disabled"
              [title]="otherDraft || otherPlaceholder"
            />
            <button
              type="button"
              class="dropdown-field__other-button"
              [disabled]="disabled || !otherDraft.trim()"
              (click)="applyOtherValue()"
            >
              Use
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dropdown-field {
      position: relative;
      display: grid;
      gap: 0.75rem;
      min-width: 0;
      overflow: visible;
    }

    .dropdown-field--disabled {
      opacity: 0.72;
    }

    .dropdown-field__trigger,
    .dropdown-field__search input,
    .dropdown-field__other-input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #bcccdc;
      border-radius: 0.7rem;
      background: #ffffff;
      color: #102a43;
      font: inherit;
    }

    .dropdown-field__trigger,
    .dropdown-field__other-input {
      padding: 0.8rem 0.9rem;
    }

    .dropdown-field__search input {
      padding: 0.7rem 0.85rem;
    }

    .dropdown-field__trigger {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      text-align: left;
    }

    .dropdown-field__trigger--open {
      border-color: #38b2ac;
      box-shadow: 0 0 0 2px rgba(56, 178, 172, 0.18);
    }

    .dropdown-field__trigger--placeholder {
      color: #7b8794;
    }

    .dropdown-field__trigger-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dropdown-field__trigger-icon {
      flex: 0 0 auto;
      width: 1rem;
      height: 1rem;
      color: #486581;
      transition: transform 140ms ease, color 140ms ease;
    }

    .dropdown-field__trigger-icon svg {
      display: block;
      width: 100%;
      height: 100%;
      stroke: currentColor;
      stroke-width: 2;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    .dropdown-field__trigger--open .dropdown-field__trigger-icon {
      transform: rotate(180deg);
      color: #0f766e;
    }

    .dropdown-field__overlay {
      position: absolute;
      top: calc(100% + 0.45rem);
      left: 0;
      right: 0;
      z-index: 60;
      overflow: visible;
    }

    .dropdown-field__menu {
      display: grid;
      gap: 0.75rem;
      padding: 0.9rem;
      border: 1px solid #d9e2ec;
      border-radius: 0.85rem;
      background: #f8fafc;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
    }

    .dropdown-field__options {
      display: grid;
      gap: 0.5rem;
      height: 14rem;
      overflow: auto;
      align-content: start;
      padding: 0.1rem 0;
    }

    .dropdown-field__option {
      width: 100%;
      min-height: 2.85rem;
      display: flex;
      align-items: center;
      appearance: none;
      box-sizing: border-box;
      border: 1px solid #d9e2ec;
      border-radius: 0.7rem;
      background: #ffffff;
      color: #102a43;
      cursor: pointer;
      font: inherit;
      line-height: 1.4;
      padding: 0.7rem 0.85rem;
      text-align: left;
      white-space: nowrap;
    }

    .dropdown-field__option-text {
      display: block;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .dropdown-field__option--active {
      border-color: #0f766e;
      background: rgba(15, 118, 110, 0.08);
      color: #0f766e;
      font-weight: 700;
    }

    .dropdown-field__other-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: 0.65rem;
      align-items: center;
      position: sticky;
      bottom: 0;
      z-index: 1;
      padding-top: 0.5rem;
      background: #f8fafc;
    }

    .dropdown-field__other-button {
      border: 0;
      border-radius: 0.7rem;
      padding: 0.8rem 1rem;
      background: #0f766e;
      color: #ffffff;
      cursor: pointer;
      font: inherit;
      font-weight: 700;
    }

    .dropdown-field__other-button:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .dropdown-field__empty {
      margin: 0;
      color: #52606d;
      font-size: 0.9rem;
    }

    .dropdown-field__sr-only {
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
  `]
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


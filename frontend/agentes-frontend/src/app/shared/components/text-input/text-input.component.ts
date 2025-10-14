import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let uniqueId = 0;

@Component({
  selector: 'app-text-input',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule],
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextInputComponent),
    multi: true
  }]
})
export class TextInputComponent implements ControlValueAccessor {
  private _inputId = `app-text-input-${++uniqueId}`;
  private _value = '';

  @Input()
  set id(value: string | undefined) { if (value) this._inputId = value; }
  get id(): string { return this._inputId; }
  get inputId(): string { return this._inputId; }

  @Input() label?: string;
  @Input() ariaLabel?: string;
  @Input() placeholder: string = '';
  @Input() name?: string;
  @Input() autocomplete: string = 'on';
  @Input() helperText?: string;
  @Input() errorMessage?: string;
  @Input() warningMessage?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fluid = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() hideLabel = false;
  @Input() skeleton = false;
  @Input() warn = false;
  @Input() invalid = false;
  @Input() clearable = false;
  @Input() prefixIcon?: string;
  @Input() suffixIcon?: string;
  @Input() maxLength: number | null = null;

  // CVA value
  get value(): string { return this._value; }
  set value(val: string) { this._value = val ?? ''; }

  @Output() valueChange = new EventEmitter<string>();
  @Output() changed = new EventEmitter<string>();
  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  isFocused = false;
  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};
  private _disabledFromCva = false;

  get helperId(): string { return `${this.inputId}-helper`; }
  get errorId(): string { return `${this.inputId}-error`; }
  get warnId(): string { return `${this.inputId}-warn`; }
  get counterId(): string { return `${this.inputId}-counter`; }

  get computedAriaLabel(): string | null {
    if (this.hideLabel || !this.label) {
      return this.ariaLabel || this.label || this.placeholder || 'Campo de texto';
    }
    return null;
  }

  get describedBy(): string | null {
    if (this.skeleton) return null;
    const ids: string[] = [];
    if (this.showError && this.errorMessage) ids.push(this.errorId);
    else if (this.showWarning && this.warningMessage) ids.push(this.warnId);
    else if (this.helperText) ids.push(this.helperId);
    if (this.maxLength !== null) ids.push(this.counterId);
    return ids.length ? ids.join(' ') : null;
  }

  get showError(): boolean { return !this.skeleton && (this.invalid || !!this.errorMessage); }
  get showWarning(): boolean { return !this.skeleton && !this.showError && (this.warn || !!this.warningMessage); }

  get containerClasses(): Record<string, boolean> {
    return {
      [`size-${this.size}`]: true,
      'is-fluid': this.fluid,
      'is-disabled': this.disabled || this.skeleton,
      'is-readonly': this.readonly,
      'is-invalid': this.showError,
      'is-warn': !this.showError && this.showWarning,
      'is-focused': this.isFocused,
      'is-skeleton': this.skeleton,
      'with-prefix': !!this.prefixIcon,
      'with-suffix': !!this.suffixIcon || this.clearable
    };
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this._value = target?.value ?? '';
    this.valueChange.emit(this._value);
    this.changed.emit(this._value);
    this.onChange(this._value);
  }

  onFocus(): void { if (!this.skeleton) { this.isFocused = true; this.focused.emit(); } }
  onBlur(): void { this.isFocused = false; this.onTouched(); this.blurred.emit(); }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.clearable && !this.disabled && !this.readonly && !this.skeleton) {
      event.stopPropagation();
      event.preventDefault();
      const target = event.target as HTMLInputElement | null;
      this._value = '';
      if (target) target.value = '';
      this.valueChange.emit(this._value);
      this.changed.emit(this._value);
      this.onChange(this._value);
    }
  }

  // ControlValueAccessor
  writeValue(obj: any): void { this._value = obj ?? ''; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { this._disabledFromCva = isDisabled; this.disabled = isDisabled; }
}

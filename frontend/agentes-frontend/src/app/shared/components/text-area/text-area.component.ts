import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let uniqueId = 0;

@Component({
  selector: 'app-text-area',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule],
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextAreaComponent),
    multi: true
  }]
})
export class TextAreaComponent implements ControlValueAccessor {
  private _id = `app-text-area-${++uniqueId}`;
  private _value = '';

  @Input()
  set id(value: string | undefined) { if (value) this._id = value; }
  get id(): string { return this._id; }

  @Input() label?: string;
  @Input() ariaLabel?: string;
  @Input() placeholder = '';
  @Input() name?: string;
  @Input() helperText?: string;
  @Input() errorMessage?: string;
  @Input() warningMessage?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fluid = true;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() hideLabel = false;
  @Input() skeleton = false;
  @Input() warn = false;
  @Input() invalid = false;
  @Input() rows = 4;
  @Input() autoResize = false;
  @Input() maxLength: number | null = null;

  get value(): string { return this._value; }
  set value(v: string) { this._value = v ?? ''; }

  @Output() valueChange = new EventEmitter<string>();
  @Output() changed = new EventEmitter<string>();
  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  isFocused = false;
  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  get helperId(): string { return `${this.id}-helper`; }
  get errorId(): string { return `${this.id}-error`; }
  get warnId(): string { return `${this.id}-warn`; }
  get counterId(): string { return `${this.id}-counter`; }

  get computedAriaLabel(): string | null {
    if (this.hideLabel || !this.label) {
      return this.ariaLabel || this.label || this.placeholder || 'Campo de texto';
    }
    return null;
  }

  get showError(): boolean { return !this.skeleton && (this.invalid || !!this.errorMessage); }
  get showWarning(): boolean { return !this.skeleton && !this.showError && (this.warn || !!this.warningMessage); }

  get containerClasses(): Record<string, boolean> {
    return {
      [`size-${this.size}`]: true,
      'is-disabled': this.disabled || this.skeleton,
      'is-readonly': this.readonly,
      'is-invalid': this.showError,
      'is-warn': !this.showError && this.showWarning,
      'is-focused': this.isFocused,
      'is-skeleton': this.skeleton,
    };
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement | null;
    this._value = target?.value ?? '';
    if (this.autoResize && target) {
      target.style.height = 'auto';
      target.style.height = `${target.scrollHeight}px`;
    }
    this.valueChange.emit(this._value);
    this.changed.emit(this._value);
    this.onChange(this._value);
  }

  onFocus(): void { if (!this.skeleton) { this.isFocused = true; this.focused.emit(); } }
  onBlur(): void { this.isFocused = false; this.onTouched(); this.blurred.emit(); }

  writeValue(obj: any): void { this._value = obj ?? ''; }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { this.disabled = isDisabled; }
}

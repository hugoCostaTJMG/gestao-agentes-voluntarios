import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output, booleanAttribute, numberAttribute } from '@angular/core';
import { FormsModule } from '@angular/forms';

let uniqueId = 0;

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule],
  templateUrl: './password-input.component.html',
  styleUrls: ['./password-input.component.scss']
})
export class PasswordInputComponent {
  private _inputId = `app-password-input-${++uniqueId}`;
  private _value = '';

  @Input()
  set id(value: string | undefined) {
    if (value) {
      this._inputId = value;
    }
  }
  get id(): string {
    return this._inputId;
  }
  get inputId(): string {
    return this._inputId;
  }

  @Input() label?: string;
  @Input() ariaLabel?: string;
  @Input() placeholder = 'Password';
  @Input() name?: string;
  @Input() autocomplete: 'current-password' | 'new-password' | 'off' = 'current-password';
  @Input() helperText?: string;
  @Input() errorMessage?: string;
  @Input() warningMessage?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input({ transform: booleanAttribute }) fluid = false;
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) readonly = false;
  @Input({ transform: booleanAttribute }) required = false;
  @Input({ transform: booleanAttribute }) hideLabel = false;
  @Input({ transform: booleanAttribute }) skeleton = false;
  @Input({ transform: booleanAttribute }) toggleVisibility = true;
  @Input({ transform: booleanAttribute }) warn = false;
  @Input({ transform: booleanAttribute }) invalid = false;
  @Input({ transform: booleanAttribute }) clearable = false;
  private _maxLength: number | null = null;

  @Input({ transform: numberAttribute })
  set maxLength(value: number | null) {
    if (value === null || value === undefined || Number.isNaN(value)) {
      this._maxLength = null;
    } else {
      this._maxLength = value;
    }
  }
  get maxLength(): number | null {
    return this._maxLength;
  }

  @Input()
  get value(): string {
    return this._value;
  }
  set value(val: string | undefined | null) {
    this._value = val ?? '';
  }

  @Output() valueChange = new EventEmitter<string>();
  @Output() changed = new EventEmitter<string>();
  @Output() toggledVisibility = new EventEmitter<boolean>();
  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  visible = false;
  isFocused = false;

  get helperId(): string {
    return `${this.inputId}-helper`;
  }

  get errorId(): string {
    return `${this.inputId}-error`;
  }

  get warnId(): string {
    return `${this.inputId}-warn`;
  }

  get counterId(): string {
    return `${this.inputId}-counter`;
  }

  get describedBy(): string | null {
    if (this.skeleton) {
      return null;
    }
    const ids: string[] = [];
    if (this.showError && this.errorMessage) {
      ids.push(this.errorId);
    } else if (this.showWarning && this.warningMessage) {
      ids.push(this.warnId);
    } else if (this.helperText) {
      ids.push(this.helperId);
    }
    if (this.maxLength !== null) {
      ids.push(this.counterId);
    }
    return ids.length ? ids.join(' ') : null;
  }

  get showError(): boolean {
    if (this.skeleton) {
      return false;
    }
    return this.invalid || !!this.errorMessage;
  }

  get showWarning(): boolean {
    if (this.skeleton) {
      return false;
    }
    if (this.showError) {
      return false;
    }
    return this.warn || !!this.warningMessage;
  }

  get fieldType(): string {
    return this.visible ? 'text' : 'password';
  }

  get computedAriaLabel(): string | null {
    if (this.hideLabel || !this.label) {
      return this.ariaLabel || this.label || this.placeholder || 'Password';
    }
    return null;
  }

  get containerClasses(): Record<string, boolean> {
    return {
      [`size-${this.size}`]: true,
      'is-fluid': this.fluid,
      'is-disabled': this.disabled || this.skeleton,
      'is-readonly': this.readonly,
      'is-invalid': this.showError,
      'is-warn': !this.showError && this.showWarning,
      'is-focused': this.isFocused,
      'is-skeleton': this.skeleton
    };
  }

  onToggleVisibility(): void {
    if (this.disabled || this.readonly || this.skeleton) {
      return;
    }
    this.visible = !this.visible;
    this.toggledVisibility.emit(this.visible);
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    const newValue = target?.value ?? '';
    this.value = newValue;
    this.valueChange.emit(this._value);
    this.changed.emit(this._value);
  }

  onFocus(): void {
    if (this.skeleton) {
      return;
    }
    this.isFocused = true;
    this.focused.emit();
  }

  onBlur(): void {
    this.isFocused = false;
    this.blurred.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.clearable && !this.disabled && !this.readonly && !this.skeleton) {
      event.stopPropagation();
      event.preventDefault();
      const target = event.target as HTMLInputElement | null;
      this.value = '';
      if (target) {
        target.value = '';
      }
      this.valueChange.emit(this._value);
      this.changed.emit(this._value);
    }
  }
}

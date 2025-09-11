import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let uniqueId = 0;

@Component({
  selector: 'app-number-input',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule],
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => NumberInputComponent),
    multi: true
  }]
})
export class NumberInputComponent implements ControlValueAccessor {
  private _inputId = `app-number-input-${++uniqueId}`;
  @Input()
  set id(value: string | undefined) {
    if (value) {
      this._inputId = value;
    }
  }
  get inputId(): string {
    return this._inputId;
  }

  @Input() name?: string;
  @Input() label?: string;
  @Input() hideLabel = false;
  @Input() helperText?: string;
  @Input() invalidText?: string;
  @Input() warnText?: string;
  @Input() placeholder?: string;
  @Input() min: number | null = null;
  @Input() max: number | null = null;
  @Input() step = 1;
  @Input() pageStep = 10;
  @Input() precision: number | null = null;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fluid = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() invalid = false;
  @Input() warn = false;
  @Input() skeleton = false;
  @Input() ariaLabel?: string;
  @Input() hideControls = false;

  private _value: number | null = null;
  @Input()
  get value(): number | null {
    return this._value;
  }
  set value(v: number | null) {
    this.writeValue(v);
  }

  @Output() valueChange = new EventEmitter<number | null>();
  @Output('increment') incrementEvent = new EventEmitter<number>();
  @Output('decrement') decrementEvent = new EventEmitter<number>();
  @Output() focusin = new EventEmitter<FocusEvent>();
  @Output() focusout = new EventEmitter<FocusEvent>();

  get errorId(): string { return `${this.inputId}-error`; }
  get warnId(): string { return `${this.inputId}-warn`; }
  get helperId(): string { return `${this.inputId}-helper`; }

  displayValue = '';
  lastCommittedValue: number | null = null;
  isFocused = false;

  holdTimeout?: any;
  holdInterval?: any;
  holdDelay = 300;
  holdIntervalMs = 100;
  holdType: 'inc' | 'dec' | null = null;

  onChange = (_: any) => {};
  onTouched = () => {};

  get isAtMin(): boolean {
    return this.min !== null && this._value !== null && this._value <= this.min;
  }

  get isAtMax(): boolean {
    return this.max !== null && this._value !== null && this._value >= this.max;
  }

  get describedByIds(): string | null {
    const ids: string[] = [];
    if (this.invalid && this.invalidText) {
      ids.push(this.errorId);
    } else if (this.warn && this.warnText) {
      ids.push(this.warnId);
    } else if (this.helperText) {
      ids.push(this.helperId);
    }
    return ids.join(' ') || null;
  }

  writeValue(value: number | null): void {
    this._value = value;
    this.lastCommittedValue = value;
    this.displayValue = value === null || value === undefined
      ? ''
      : this.precision !== null
        ? value.toFixed(this.precision)
        : String(value);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onInputChange(raw: string): void {
    this.displayValue = raw;
  }

  commit(): void {
    let newValue: number | null;
    const raw = this.displayValue.trim();
    if (raw === '') {
      newValue = null;
    } else {
      const parsed = Number(raw);
      if (isNaN(parsed)) {
        newValue = this.lastCommittedValue;
      } else {
        newValue = parsed;
      }
    }

    if (newValue !== null) {
      if (this.precision !== null) {
        newValue = Number(newValue.toFixed(this.precision));
      }
      if (this.min !== null && newValue < this.min) {
        newValue = this.min;
      }
      if (this.max !== null && newValue > this.max) {
        newValue = this.max;
      }
    }

    if (newValue !== this._value) {
      this._value = newValue;
      this.onChange(newValue);
      this.valueChange.emit(newValue);
    }
    this.displayValue = newValue === null || newValue === undefined
      ? ''
      : this.precision !== null
        ? newValue.toFixed(this.precision)
        : String(newValue);
    this.lastCommittedValue = this._value;
  }

  increment(step = this.step): void {
    if (this.disabled || this.readonly) return;
    let newVal = (this._value ?? 0) + step;
    if (this.max !== null && newVal > this.max) newVal = this.max;
    this.writeValue(newVal);
    this.onChange(newVal);
    this.valueChange.emit(newVal);
    this.incrementEvent.emit(newVal);
  }

  decrement(step = this.step): void {
    if (this.disabled || this.readonly) return;
    let newVal = (this._value ?? 0) - step;
    if (this.min !== null && newVal < this.min) newVal = this.min;
    this.writeValue(newVal);
    this.onChange(newVal);
    this.valueChange.emit(newVal);
    this.decrementEvent.emit(newVal);
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled || this.readonly) return;
    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        this.increment();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.decrement();
        break;
      case 'PageUp':
        event.preventDefault();
        this.increment(this.pageStep);
        break;
      case 'PageDown':
        event.preventDefault();
        this.decrement(this.pageStep);
        break;
      case 'Home':
        if (this.min !== null) {
          event.preventDefault();
          this.writeValue(this.min);
          this.onChange(this.min);
          this.valueChange.emit(this.min);
        }
        break;
      case 'End':
        if (this.max !== null) {
          event.preventDefault();
          this.writeValue(this.max);
          this.onChange(this.max);
          this.valueChange.emit(this.max);
        }
        break;
      case 'Enter':
        event.preventDefault();
        this.commit();
        break;
      case 'Tab':
        this.commit();
        break;
      case 'Escape':
        event.preventDefault();
        this.writeValue(this.lastCommittedValue);
        break;
    }
  }

  onFocus(event: FocusEvent): void {
    this.isFocused = true;
    this.focusin.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.isFocused = false;
    this.commit();
    this.onTouched();
    this.focusout.emit(event);
  }

  onPressStart(type: 'inc' | 'dec', ev: PointerEvent): void {
    if (this.disabled || this.readonly || this.hideControls) return;
    ev.preventDefault();
    this.holdType = type;
    this.holdTimeout = setTimeout(() => {
      this.holdIntervalMs = 100;
      const step = () => {
        if (this.holdType === 'inc') {
          if (!this.isAtMax) this.increment();
        } else {
          if (!this.isAtMin) this.decrement();
        }
        this.holdIntervalMs = Math.max(60, this.holdIntervalMs - 5);
        this.holdInterval = setTimeout(step, this.holdIntervalMs);
      };
      step();
    }, this.holdDelay);
  }

  onPressEnd(): void {
    clearTimeout(this.holdTimeout);
    clearTimeout(this.holdInterval);
    this.holdType = null;
  }
}


import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output, forwardRef, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { DropdownComponent, DropdownOption } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, NgClass, DropdownComponent],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true
  }]
})
export class SelectComponent implements ControlValueAccessor, OnChanges {
  @Input() label?: string;
  @Input() placeholder = 'Selecione';
  @Input() helperText?: string;
  @Input() errorMessage?: string;
  @Input() warningMessage?: string;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fluid = true;
  @Input() disabled = false;
  @Input() warn = false;
  @Input() invalid = false;
  @Input() multi = false;
  @Input() options: DropdownOption[] = [];

  @Output() valueChange = new EventEmitter<any | any[]>();

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};
  private _value: any | any[] = this.multi ? [] : null;

  get containerClasses(): Record<string, boolean> {
    return {
      [`size-${this.size}`]: true,
      'is-disabled': this.disabled,
      'is-invalid': this.invalid,
      'is-warn': this.warn && !this.invalid,
      'is-fluid': this.fluid
    };
  }

  onChanged(v: any): void {
    // Dropdown sempre retorna array de valores selecionados.
    // Para single-select (multi=false), converte para escalar (primeiro item ou null).
    const out = this.multi ? v : (Array.isArray(v) ? (v.length ? v[0] : null) : v);
    this._value = out;
    this.valueChange.emit(out);
    this.onChange(out);
  }

  writeValue(obj: any): void {
    this._value = obj;
    this.syncSelectionFromValue();
  }
  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState?(isDisabled: boolean): void { this.disabled = isDisabled; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] && !changes['options'].firstChange) {
      this.syncSelectionFromValue();
    }
  }

  private syncSelectionFromValue(): void {
    let val = this._value;
    // Se vier array mas o componente está em modo single, usa o primeiro valor
    if (!this.multi && Array.isArray(val)) {
      val = val.length ? val[0] : null;
    }
    if (this.options && this.options.length) {
      if (this.multi) {
        const set = new Set(Array.isArray(val) ? val : []);
        this.options.forEach(o => o.selected = set.has(o.value));
      } else {
        this.options.forEach(o => o.selected = (o.value === val));
      }
    }
  }
}

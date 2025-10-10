import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DropdownComponent, DropdownOption } from '../dropdown/dropdown.component';

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [CommonModule, NgClass, DropdownComponent],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent {
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

  get containerClasses(): Record<string, boolean> {
    return {
      [`size-${this.size}`]: true,
      'is-disabled': this.disabled,
      'is-invalid': this.invalid,
      'is-warn': this.warn && !this.invalid,
      'is-fluid': this.fluid
    };
  }

  onChanged(v: any): void { this.valueChange.emit(v); }
}


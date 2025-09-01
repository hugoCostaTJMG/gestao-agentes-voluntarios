import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

export interface DropdownOption {
  label: string;
  value: any;
  selected?: boolean;
  disabled?: boolean;
  checkbox?: boolean;
  icon?: string;
}

@Component({
  selector: 'app-dropdown',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder: string = 'Selecione';
  @Input() fluid: boolean = false; // default ou fluid
  @Input() multiSelect: boolean = false;
  @Input() parentCheckbox: boolean = false; // “All” checkbox

  @Output() changed = new EventEmitter<any>();

  isOpen = false;

  toggleDropdown() {
    this.isOpen = !this.isOpen;
  }

  onSelect(option: DropdownOption) {
    if (option.disabled) return;

    if (this.multiSelect) {
      option.selected = !option.selected;
    } else {
      this.options.forEach(o => o.selected = false);
      option.selected = true;
      this.isOpen = false;
    }

    this.changed.emit(this.getSelectedValues());
  }

  toggleAll() {
    const allSelected = this.options.every(o => o.selected);
    this.options.forEach(o => o.selected = !allSelected);
    this.changed.emit(this.getSelectedValues());
  }

  getSelectedValues() {
    return this.options.filter(o => o.selected).map(o => o.value);
  }
  get displayLabel(): string {
  const selected = this.options.filter(o => o.selected).map(o => o.label);
  if (selected.length) {
    return selected.join(', ');
  }
  return this.placeholder;
}
get allSelected(): boolean {
  return this.options.length > 0 && this.options.every(o => o.selected);
}
}

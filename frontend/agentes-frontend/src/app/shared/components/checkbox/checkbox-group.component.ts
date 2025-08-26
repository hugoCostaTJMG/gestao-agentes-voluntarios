import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckboxComponent } from './checkbox.component';

interface CheckboxOption {
  label: string;
  value: string;
  checked?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-checkbox-group',
  standalone: true,
  imports: [CheckboxComponent, CommonModule],
  templateUrl: './checkbox-group.component.html',
  styleUrls: ['./checkbox-group.component.scss'],
})
export class CheckboxGroupComponent implements OnChanges {
  /** Label do grupo de checkboxes */
  @Input() groupLabel: string = '';
  /** Lista de opções a serem exibidas */
  @Input() options: CheckboxOption[] = [];
  /** Mensagem de erro exibida abaixo do grupo */
  @Input() errorMessage?: string;
  /** Mensagem de aviso exibida abaixo do grupo */
  @Input() warningMessage?: string;

  /** Emitido quando os valores selecionados mudam */
  @Output() changed = new EventEmitter<string[]>();

  /** Lista local de valores selecionados */
  selectedValues: string[] = [];

  ngOnChanges(): void {
    this.selectedValues = this.options
      .filter(option => option.checked)
      .map(option => option.value);
  }

  onOptionChanged(value: string, checked: boolean): void {
    const option = this.options.find(o => o.value === value);
    if (option) {
      option.checked = checked;
    }

    if (checked) {
      if (!this.selectedValues.includes(value)) {
        this.selectedValues.push(value);
      }
    } else {
      this.selectedValues = this.selectedValues.filter(v => v !== value);
    }
    this.changed.emit([...this.selectedValues]);
  }
}


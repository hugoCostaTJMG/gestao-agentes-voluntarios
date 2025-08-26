import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent {
  /** Texto exibido ao lado do checkbox */
  @Input() label: string = '';
  /** Estado atual do checkbox */
  @Input() checked: boolean = false;
  /** Desabilita o checkbox */
  @Input() disabled: boolean = false;
  /** Mensagem de erro exibida abaixo do checkbox */
  @Input() errorMessage?: string;
  /** Mensagem de aviso exibida abaixo do checkbox */
  @Input() warningMessage?: string;
  /** Nome do campo */
  @Input() name?: string;
  /** Valor do campo */
  @Input() value?: string;

  /** Emitido quando o valor do checkbox muda */
  @Output() changed = new EventEmitter<boolean>();

  onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.changed.emit(this.checked);
  }
}

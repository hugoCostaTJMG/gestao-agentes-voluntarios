import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

let uniqueId = 0;

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss']
})
export class ToggleComponent {
  @Input() id: string = `app-toggle-${++uniqueId}`;
  @Input() label?: string;
  @Input() helperText?: string;
  @Input() checked = false;
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() checkedChange = new EventEmitter<boolean>();

  get containerClasses(): Record<string, boolean> {
    return { [`size-${this.size}`]: true, 'is-disabled': this.disabled };
  }

  onToggle(): void {
    if (this.disabled) return;
    this.checked = !this.checked;
    this.checkedChange.emit(this.checked);
  }
}


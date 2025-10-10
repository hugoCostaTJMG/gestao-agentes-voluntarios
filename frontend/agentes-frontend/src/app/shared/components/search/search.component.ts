import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, NgClass, FormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {
  @Input() placeholder = 'Buscar';
  @Input() value = '';
  @Input() disabled = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() fluid = true;

  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  private debounce?: any;
  @Input() debounceMs = 300;

  onInput(val: string): void {
    this.value = val;
    this.valueChange.emit(val);
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => this.search.emit(this.value), this.debounceMs);
  }

  onSubmit(): void {
    this.search.emit(this.value);
  }
}


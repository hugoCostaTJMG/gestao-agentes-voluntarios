import { Component, EventEmitter, Input, Output, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { CommonModule, NgClass, NgFor } from '@angular/common';

@Component({
  selector: 'app-content-switcher',
  standalone: true,
  imports: [CommonModule, NgClass, NgFor],
  templateUrl: './content-switcher.component.html',
  styleUrls: ['./content-switcher.component.scss'],
})
export class ContentSwitcherComponent {
  @Input() options: { label: string; value: string; icon?: string; disabled?: boolean }[] = [];
  @Input() selected: string = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() ariaLabel: string = 'content switcher';
  @Input() type: 'default' | 'with-icons' | 'horizontal' | 'vertical' = 'default';

  @Output() selectedChange = new EventEmitter<string>();

  @ViewChildren('optionBtn') optionButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  onSelect(value: string, disabled?: boolean): void {
    if (disabled) {
      return;
    }
    this.selected = value;
    this.selectedChange.emit(this.selected);
  }

  onKeydown(event: KeyboardEvent): void {
    const validKeys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
    if (!validKeys.includes(event.key)) {
      return;
    }
    event.preventDefault();
    const currentIndex = this.options.findIndex(o => o.value === this.selected);
    const startIndex = currentIndex === -1 ? 0 : currentIndex;
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const newIndex = this.findNextEnabledIndex(startIndex, step);
    const option = this.options[newIndex];
    this.onSelect(option.value, option.disabled);
    this.optionButtons.get(newIndex)?.nativeElement.focus();
  }

  private findNextEnabledIndex(start: number, step: number): number {
    const len = this.options.length;
    let idx = start;
    do {
      idx = (idx + step + len) % len;
    } while (this.options[idx].disabled && idx !== start);
    return idx;
  }
}


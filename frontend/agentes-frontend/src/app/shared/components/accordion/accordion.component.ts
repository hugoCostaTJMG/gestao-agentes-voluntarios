import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';

interface AccordionItem {
  title: string;
  content: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-accordion',
  standalone: true,
  imports: [NgFor, NgIf, NgClass],
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
})
export class AccordionComponent {
  @Input() items: AccordionItem[] = [];
  @Input() type: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() loading: boolean = false;

  @Output() toggled = new EventEmitter<number>();

  expandedIndex: number | null = null;
  skeletonItems = Array(3);

  toggleItem(index: number): void {
    if (this.loading) {
      return;
    }

    const item = this.items[index];
    if (item?.disabled) {
      return;
    }

    this.expandedIndex = this.expandedIndex === index ? null : index;
    this.toggled.emit(index);
  }
}


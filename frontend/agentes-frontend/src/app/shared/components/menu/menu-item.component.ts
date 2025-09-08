import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { MenuItem, MenuSelectable } from './menu.types';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './menu-item.component.html',
  styleUrls: ['./menu-item.component.scss']
})
export class MenuItemComponent {
  @Input() item!: MenuItem;
  @Input() active = false;
  @Input() selectable: MenuSelectable = 'none';
  @Output() pressed = new EventEmitter<MenuItem>();

  @ViewChild('button', { static: false }) buttonRef?: ElementRef<HTMLButtonElement>;

  onClick(event: Event) {
    event.stopPropagation();
    if (this.item.disabled || this.item.role === 'separator') {
      return;
    }
    this.pressed.emit(this.item);
  }

  focus() {
    this.buttonRef?.nativeElement.focus();
  }
}

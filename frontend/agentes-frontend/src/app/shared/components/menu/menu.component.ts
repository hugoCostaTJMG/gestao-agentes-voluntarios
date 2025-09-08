import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
  AfterViewInit
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { MenuItem, MenuSelectable } from './menu.types';
import { MenuItemComponent } from './menu-item.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, NgClass, MenuItemComponent],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements AfterViewInit {
  @Input() items: MenuItem[] = [];
  @Input() selectable: MenuSelectable = 'none';
  @Input() ariaLabel = 'Menu';
  @Input() maxHeight = 320;

  @Output() action = new EventEmitter<MenuItem>();
  @Output() closed = new EventEmitter<void>();

  @ViewChildren(MenuItemComponent) itemCmps!: QueryList<MenuItemComponent>;

  activeIndex = -1;
  private typeaheadBuffer = '';
  private typeaheadTimeout: any;

  ngAfterViewInit() {
    this.activeIndex = this.getFirstEnabledIndex();
    this.focusCurrent();
  }

  trackById(_index: number, item: MenuItem) {
    return item.id;
  }

  onItemPressed(item: MenuItem) {
    this.applySelection(item);
    this.action.emit(item);
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        this.setActiveIndex(this.getNextIndex(this.activeIndex));
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        this.setActiveIndex(this.getPrevIndex(this.activeIndex));
        break;
      case 'Home':
        event.preventDefault();
        this.setActiveIndex(this.getFirstEnabledIndex());
        break;
      case 'End':
        event.preventDefault();
        this.setActiveIndex(this.getLastEnabledIndex());
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (this.activeIndex > -1) {
          const item = this.items[this.activeIndex];
          if (!this.isDisabled(item)) {
            this.onItemPressed(item);
          }
        }
        break;
      case 'Escape':
        this.closed.emit();
        break;
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          this.handleTypeahead(event.key);
        }
        break;
    }
  }

  private handleTypeahead(char: string) {
    this.typeaheadBuffer += char.toLowerCase();
    clearTimeout(this.typeaheadTimeout);
    const idx = this.items.findIndex((item, i) =>
      !this.isDisabled(item) &&
      item.label?.toLowerCase().startsWith(this.typeaheadBuffer)
    );
    if (idx !== -1) {
      this.setActiveIndex(idx);
    }
    this.typeaheadTimeout = setTimeout(() => {
      this.typeaheadBuffer = '';
    }, 350);
  }

  private setActiveIndex(index: number) {
    if (index === -1) return;
    this.activeIndex = index;
    this.focusCurrent();
  }

  private focusCurrent() {
    if (this.activeIndex > -1) {
      const cmp = this.itemCmps.get(this.activeIndex);
      cmp?.focus();
      const el = cmp?.buttonRef?.nativeElement;
      el?.scrollIntoView({ block: 'nearest' });
    }
  }

  private getNextIndex(current: number): number {
    let idx = current;
    do {
      idx = (idx + 1) % this.items.length;
    } while (this.isDisabled(this.items[idx]) && idx !== current);
    return idx;
  }

  private getPrevIndex(current: number): number {
    let idx = current;
    do {
      idx = (idx - 1 + this.items.length) % this.items.length;
    } while (this.isDisabled(this.items[idx]) && idx !== current);
    return idx;
  }

  private getFirstEnabledIndex(): number {
    return this.items.findIndex(item => !this.isDisabled(item));
  }

  private getLastEnabledIndex(): number {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (!this.isDisabled(this.items[i])) {
        return i;
      }
    }
    return -1;
  }

  private isDisabled(item: MenuItem | undefined): boolean {
    return !item || item.disabled || item.role === 'separator';
  }

  private applySelection(item: MenuItem) {
    if (this.selectable === 'none') {
      return;
    }

    if (item.role === 'menuitemcheckbox') {
      if (this.selectable === 'single') {
        this.items.forEach(i => (i.checked = false));
        item.checked = true;
      } else {
        item.checked = !item.checked;
      }
    } else if (item.role === 'menuitemradio') {
      this.items.forEach(i => {
        if (i.role === 'menuitemradio') {
          i.checked = false;
        }
      });
      item.checked = true;
    } else {
      if (this.selectable === 'single') {
        this.items.forEach(i => (i.selected = false));
        item.selected = true;
      } else {
        item.selected = !item.selected;
      }
    }
  }
}

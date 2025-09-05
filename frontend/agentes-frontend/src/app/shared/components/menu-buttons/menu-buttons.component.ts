import { Component, Input, Output, EventEmitter, HostListener, ElementRef, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';

export type MenuButtonsVariant = 'overflow' | 'menu' | 'combo';
export type MenuButtonsType = 'primary' | 'secondary' | 'danger' | 'ghost';
export type MenuButtonsSize = 'sm' | 'md' | 'lg';
export type MenuPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

export interface MenuItem {
  id: string;
  label: string;
  iconLeft?: string;
  helperText?: string;
  disabled?: boolean;
  danger?: boolean;
  dividerAbove?: boolean;
}

let uniqueId = 0;

@Component({
  standalone: true,
  selector: 'app-menu-buttons',
  imports: [CommonModule, NgClass, NgFor, NgIf],
  templateUrl: './menu-buttons.component.html',
  styleUrls: ['./menu-buttons.component.scss']
})
export class MenuButtonsComponent {
  @Input() variant: MenuButtonsVariant = 'menu';
  @Input() type: MenuButtonsType = 'primary';
  @Input() size: MenuButtonsSize = 'md';
  @Input() label: string = 'Actions';
  @Input() icon?: string;
  @Input() disabled = false;
  @Input() loading = false;

  @Input() items: MenuItem[] = [];
  @Input() placement: MenuPlacement = 'auto';
  @Input() align: 'start' | 'end' = 'start';
  @Input() menuWidth?: number;

  @Input() primaryActionId: string = 'primary';
  @Output() primaryClick = new EventEmitter<void>();

  @Output() itemSelect = new EventEmitter<MenuItem>();
  @Output() openChange = new EventEmitter<boolean>();

  open = false;
  activeIndex = 0;
  menuId = `mb-menu-${uniqueId++}`;

  placementClass = 'pos-bottom';
  alignClass = 'align-start';

  @ViewChild('menu') menuRef?: ElementRef<HTMLElement>;
  @ViewChildren('menuItem') menuItems?: QueryList<ElementRef<HTMLElement>>;

  constructor(private host: ElementRef<HTMLElement>) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeMenu();
    }
  }

  @HostListener('window:resize')
  onResize() {
    if (this.open && this.placement === 'auto') {
      this.computePlacement();
    }
  }

  toggleMenu() {
    this.open ? this.closeMenu() : this.openMenu();
  }

  openMenu() {
    if (this.disabled) {
      return;
    }
    this.open = true;
    this.openChange.emit(true);
    setTimeout(() => {
      this.computePlacement();
      const first = this.getFirstEnabledIndex();
      this.focusItem(first);
    });
  }

  closeMenu() {
    if (!this.open) return;
    this.open = false;
    this.openChange.emit(false);
  }

  computePlacement() {
    if (this.placement !== 'auto') {
      this.placementClass = `pos-${this.placement}`;
      this.alignClass = `align-${this.align}`;
      return;
    }
    const hostRect = this.host.nativeElement.getBoundingClientRect();
    const menu = this.menuRef?.nativeElement;
    const menuHeight = menu?.offsetHeight || 0;
    const spaceBottom = window.innerHeight - hostRect.bottom;
    const spaceTop = hostRect.top;
    const placeTop = menuHeight > spaceBottom && spaceTop > spaceBottom;
    this.placementClass = placeTop ? 'pos-top' : 'pos-bottom';
    this.alignClass = `align-${this.align}`;
  }

  onPrimaryClick() {
    if (this.disabled) return;
    this.primaryClick.emit();
  }

  onTriggerKeydown(event: KeyboardEvent) {
    if (this.disabled) return;
    const key = event.key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.toggleMenu();
    } else if (key === 'ArrowDown') {
      event.preventDefault();
      if (!this.open) {
        this.openMenu();
      } else {
        const next = this.getNextEnabledIndex(this.activeIndex);
        this.focusItem(next);
      }
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      if (!this.open) {
        this.openMenu();
      } else {
        const prev = this.getPrevEnabledIndex(this.activeIndex);
        this.focusItem(prev);
      }
    }
  }

  onItemKeydown(event: KeyboardEvent, index: number) {
    const key = event.key;
    if (key === 'ArrowDown') {
      event.preventDefault();
      const next = this.getNextEnabledIndex(index);
      this.focusItem(next);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      const prev = this.getPrevEnabledIndex(index);
      this.focusItem(prev);
    } else if (key === 'Home') {
      event.preventDefault();
      this.focusItem(this.getFirstEnabledIndex());
    } else if (key === 'End') {
      event.preventDefault();
      this.focusItem(this.getLastEnabledIndex());
    } else if (key === 'Escape') {
      event.preventDefault();
      this.closeMenu();
    } else if (key === 'Tab') {
      this.closeMenu();
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      const item = this.items[index];
      this.selectItem(item);
    }
  }

  onItemClick(item: MenuItem) {
    if (item.disabled) return;
    this.selectItem(item);
  }

  selectItem(item: MenuItem) {
    this.itemSelect.emit(item);
    this.closeMenu();
  }

  focusItem(index: number) {
    if (index < 0) return;
    this.activeIndex = index;
    setTimeout(() => {
      const el = this.menuItems?.toArray()[index]?.nativeElement;
      el?.focus();
    });
  }

  getFirstEnabledIndex(): number {
    return this.items.findIndex(it => !it.disabled);
  }

  getLastEnabledIndex(): number {
    for (let i = this.items.length - 1; i >= 0; i--) {
      if (!this.items[i].disabled) return i;
    }
    return 0;
  }

  getNextEnabledIndex(current: number): number {
    for (let i = current + 1; i < this.items.length; i++) {
      if (!this.items[i].disabled) return i;
    }
    return this.getFirstEnabledIndex();
  }

  getPrevEnabledIndex(current: number): number {
    for (let i = current - 1; i >= 0; i--) {
      if (!this.items[i].disabled) return i;
    }
    return this.getLastEnabledIndex();
  }
}


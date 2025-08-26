import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgClass } from '@angular/common';

interface ContainerListItem {
  text: string;
  disabled?: boolean;
  expanded?: boolean;
}

@Component({
  selector: 'app-container-list',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, NgClass],
  templateUrl: './container-list.component.html',
  styleUrl: './container-list.component.scss',
})
export class ContainerListComponent {
  title = '';
  newItem = '';
  items: ContainerListItem[] = [];
  selectedIndex: number | null = null;
  editingIndex: number | null = null;
  editingTitle = false;
  addingItem = false;
  disabled = false;

  addItem(): void {
    const value = this.newItem.trim();
    if (value) {
      this.items.push({ text: value });
      this.newItem = '';
    }
  }

  removeItem(index: number): void {
    this.items.splice(index, 1);
    if (this.selectedIndex === index) {
      this.selectedIndex = null;
    }
  }

  selectItem(index: number): void {
    const item = this.items[index];
    if (item.disabled) {
      return;
    }
    this.selectedIndex = index;
    item.expanded = !item.expanded;
  }

  startEditTitle(): void {
    this.editingTitle = true;
  }

  stopEditTitle(): void {
    this.editingTitle = false;
  }

  startEdit(index: number): void {
    if (this.items[index]?.disabled) {
      return;
    }
    this.editingIndex = index;
  }

  stopEdit(index: number): void {
    if (this.editingIndex === index) {
      this.editingIndex = null;
    }
  }

  trackByIndex(i: number): number {
    return i;
  }
}

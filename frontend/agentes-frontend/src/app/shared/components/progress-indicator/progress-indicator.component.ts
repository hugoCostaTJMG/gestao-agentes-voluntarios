import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

import { ProgressIndicatorItemComponent } from '../progress-indicator-item/progress-indicator-item.component';

export interface ProgressItem {
  id?: string;
  label: string;
  optionalLabel?: string;
  state?: 'incomplete' | 'current' | 'complete' | 'error' | 'disabled';
  tooltip?: string;
  href?: string;
}

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [CommonModule, NgClass, NgFor, NgIf, ProgressIndicatorItemComponent],
  templateUrl: './progress-indicator.component.html',
  styleUrl: './progress-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressIndicatorComponent implements OnChanges, AfterViewInit, OnDestroy {
  private static nextId = 0;

  @HostBinding('attr.role') readonly role = 'presentation';

  private viewChangesSub?: Subscription;

  private _items: ProgressItem[] = [];

  readonly id = `app-progress-indicator-${ProgressIndicatorComponent.nextId++}`;
  readonly liveRegionId = `${this.id}-live-region`;

  /** Resolved ids for each step to keep aria-describedby stable between renders. */
  private readonly itemIds = new Map<number, string>();

  /** Indicates which index currently owns the roving tabindex. */
  focusedIndex = 0;

  /** Accessible feedback describing the current step. */
  liveMessage = '';

  @Input()
  get items(): ProgressItem[] {
    return this._items;
  }
  set items(value: ProgressItem[] | null | undefined) {
    this._items = Array.isArray(value) ? value : [];
    this.rebuildItemIds();
    this.syncCurrentIndex();
  }

  @Input() currentIndex = 0;
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() clickable = true;
  @Input() showLabels = true;
  @Input() skeleton = false;
  @Input() ariaLabel = 'Progress indicator';

  @Output() readonly stepChange = new EventEmitter<number>();
  @Output() readonly stepActivate = new EventEmitter<ProgressItem>();
  @Output() readonly stepFocus = new EventEmitter<number>();

  @ViewChildren(ProgressIndicatorItemComponent)
  private readonly itemComponents?: QueryList<ProgressIndicatorItemComponent>;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentIndex']) {
      this.syncCurrentIndex();
    }

    if (changes['orientation']) {
      this.ensureFocusVisibility();
    }

    if (changes['skeleton']) {
      this.ensureFocusVisibility();
    }
  }

  ngAfterViewInit(): void {
    this.viewChangesSub = this.itemComponents?.changes.subscribe(() => {
      this.ensureFocusVisibility();
    });
    this.ensureFocusVisibility();
  }

  ngOnDestroy(): void {
    this.viewChangesSub?.unsubscribe();
  }

  get isVertical(): boolean {
    return this.orientation === 'vertical';
  }

  get itemCount(): number {
    return this._items.length;
  }

  get renderedItems(): ProgressItem[] {
    if (this.skeleton) {
      const count = this._items.length > 0 ? this._items.length : 4;
      return Array.from({ length: count }, (_, index) => ({
        id: `${this.id}-skeleton-${index}`,
        label: '',
        optionalLabel: '',
        state: 'incomplete',
      }));
    }
    return this._items;
  }

  trackByIndex(index: number): number {
    return index;
  }

  onItemActivate(index: number): void {
    if (this.skeleton) {
      return;
    }

    const item = this._items[index];
    if (!item || this.isDisabled(index)) {
      return;
    }

    if (this.focusedIndex !== index) {
      this.focusedIndex = index;
      this.stepFocus.emit(index);
    }

    if (this.clickable) {
      if (this.currentIndex !== index) {
        this.currentIndex = index;
        this.updateLiveMessage();
      }
      this.stepChange.emit(index);
    }

    this.stepActivate.emit(item);
    this.cdr.markForCheck();
  }

  onItemFocus(index: number): void {
    if (this.focusedIndex !== index) {
      this.focusedIndex = index;
      this.stepFocus.emit(index);
      this.cdr.markForCheck();
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.skeleton || this.itemCount === 0) {
      return;
    }

    const horizontal = this.orientation === 'horizontal';
    const key = event.key;
    let handled = false;

    if (horizontal) {
      if (key === 'ArrowRight') {
        handled = this.moveFocus(1);
      } else if (key === 'ArrowLeft') {
        handled = this.moveFocus(-1);
      }
    } else {
      if (key === 'ArrowDown') {
        handled = this.moveFocus(1);
      } else if (key === 'ArrowUp') {
        handled = this.moveFocus(-1);
      }
    }

    if (key === 'Home') {
      handled = this.focusEdge(true);
    } else if (key === 'End') {
      handled = this.focusEdge(false);
    } else if (key === 'Enter' || key === ' ') {
      if (!this.isDisabled(this.focusedIndex) && this.clickable) {
        this.onItemActivate(this.focusedIndex);
        handled = true;
      }
    } else if (key === 'Escape') {
      handled = true; // Esc closes tooltips via child listeners but prevent other effects
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }

  isDisabled(index: number): boolean {
    if (this.skeleton) {
      return true;
    }
    const item = this._items[index];
    return !item || item.state === 'disabled';
  }

  getItemId(index: number, item: ProgressItem): string {
    if (item.id) {
      return item.id;
    }
    const existing = this.itemIds.get(index);
    if (existing) {
      return existing;
    }
    const generated = `${this.id}-step-${index}`;
    this.itemIds.set(index, generated);
    return generated;
  }

  getTooltipId(index: number, item: ProgressItem): string | null {
    if (!item.tooltip) {
      return null;
    }
    return `${this.getItemId(index, item)}-tooltip`;
  }

  private rebuildItemIds(): void {
    this.itemIds.clear();
    this._items.forEach((item, index) => {
      if (item.id) {
        this.itemIds.set(index, item.id);
      }
    });
    this.ensureFocusVisibility();
    this.updateLiveMessage();
  }

  private syncCurrentIndex(): void {
    if (!this._items.length) {
      this.currentIndex = 0;
      this.focusedIndex = 0;
      this.liveMessage = '';
      this.cdr.markForCheck();
      return;
    }

    const maxIndex = this._items.length - 1;
    if (this.currentIndex > maxIndex) {
      this.currentIndex = maxIndex;
    }
    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }

    if (this.isDisabled(this.currentIndex)) {
      const fallback = this.findNextEnabled(this.currentIndex, 1) ?? this.findNextEnabled(this.currentIndex, -1);
      this.currentIndex = fallback ?? this.currentIndex;
    }

    if (this.isDisabled(this.focusedIndex) || this.focusedIndex >= this._items.length) {
      this.focusedIndex = this.currentIndex;
    }

    this.ensureFocusVisibility();
    this.updateLiveMessage();
  }

  private ensureFocusVisibility(): void {
    if (!this._items.length || !this.itemComponents) {
      return;
    }

    if (this.isDisabled(this.focusedIndex)) {
      const enabled = this.findNextEnabled(this.focusedIndex, 1) ?? this.findNextEnabled(this.focusedIndex, -1);
      if (enabled != null) {
        this.focusedIndex = enabled;
      }
    }

    this.cdr.markForCheck();
  }

  private moveFocus(direction: 1 | -1): boolean {
    const next = this.findNextEnabled(this.focusedIndex, direction);
    if (next == null) {
      return false;
    }
    this.focusItem(next);
    return true;
  }

  private focusEdge(toStart: boolean): boolean {
    const index = toStart ? this.findEdgeEnabled(0, 1) : this.findEdgeEnabled(this._items.length - 1, -1);
    if (index == null) {
      return false;
    }
    this.focusItem(index);
    return true;
  }

  private focusItem(index: number): void {
    if (index < 0 || index >= this._items.length) {
      return;
    }
    this.focusedIndex = index;
    const component = this.itemComponents?.get(index);
    component?.focus();
    this.stepFocus.emit(index);
    this.cdr.markForCheck();
  }

  private findNextEnabled(start: number, direction: 1 | -1): number | null {
    let index = start + direction;
    while (index >= 0 && index < this._items.length) {
      if (!this.isDisabled(index)) {
        return index;
      }
      index += direction;
    }
    return null;
  }

  private findEdgeEnabled(start: number, direction: 1 | -1): number | null {
    let index = start;
    while (index >= 0 && index < this._items.length) {
      if (!this.isDisabled(index)) {
        return index;
      }
      index += direction;
    }
    return null;
  }

  private updateLiveMessage(): void {
    if (!this._items.length || this.currentIndex < 0 || this.currentIndex >= this._items.length) {
      this.liveMessage = '';
      this.cdr.markForCheck();
      return;
    }

    const current = this._items[this.currentIndex];
    const total = this._items.length;
    const indexText = this.currentIndex + 1;
    const optionalText = current.optionalLabel ? ` (${current.optionalLabel})` : '';
    const statusText = current.state === 'current' ? ' (atual)' : '';
    this.liveMessage = `Etapa ${indexText} de ${total}: ${current.label}${optionalText}${statusText}`;
    this.cdr.markForCheck();
  }
}

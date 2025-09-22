import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';

const NAV_MIN_BUTTONS = 3;

type NavItem = number | 'ellipsis-left' | 'ellipsis-right';

let uniqueIdCounter = 0;

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, NgClass, NgIf, NgFor],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnChanges {
  @Input() variant: 'nav' | 'table-bar' = 'nav';
  @Input() totalItems = 0;
  @Input() pageSize = 10;
  @Input() pageSizeOptions: number[] = [10, 20, 50, 100];
  @Input() page = 1;
  @Input() maxPageButtons = 7;
  @Input() disabled = false;
  @Input() showFirstLast = false;
  @Input() ariaLabel = 'Paginação';
  @Input() compact = false;
  @Input() itemsLabel = 'Items per page:';
  @Input() ofLabel = 'of';
  @Input() itemsWord = 'items';
  @Input() pageWord = 'Page';

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  private readonly instanceId = ++uniqueIdCounter;

  readonly ids = {
    pageSize: `pagination-page-size-${this.instanceId}`,
    pageSelect: `pagination-page-select-${this.instanceId}`,
  };

  navItems: NavItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.totalItems = Math.max(0, Math.floor(this.totalItems));
    this.pageSize = this.sanitizePageSize(this.pageSize);
    this.maxPageButtons = this.sanitizeMaxButtons(this.maxPageButtons);

    const clampedPage = this.clampPage(this.page);
    const shouldEmitChange = !changes['page']?.firstChange && clampedPage !== this.page;
    this.page = clampedPage;

    this.updateNavItems();

    if (shouldEmitChange) {
      this.pageChange.emit(this.page);
    }
  }

  get totalPages(): number {
    const size = this.pageSize || 1;
    const items = Math.max(0, this.totalItems);
    return Math.max(1, Math.ceil(items / size));
  }

  get pages(): number[] {
    const total = this.totalPages;
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  get rangeStart(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    return (this.page - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    if (this.totalItems === 0) {
      return 0;
    }
    return Math.min(this.rangeStart + this.pageSize - 1, this.totalItems);
  }

  isPageNumber(item: NavItem): item is number {
    return typeof item === 'number';
  }

  calcPagesForNav(): NavItem[] {
    const total = this.totalPages;
    const current = this.clampPage(this.page);
    const maxButtons = Math.max(NAV_MIN_BUTTONS, this.maxPageButtons);

    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, index) => index + 1);
    }

    const items: NavItem[] = [];
    const innerCount = Math.max(1, maxButtons - 2);

    if (current <= innerCount + 1) {
      for (let i = 1; i <= innerCount + 1 && i <= total; i++) {
        items.push(i);
      }

      const lastItem = items[items.length - 1];
      if (typeof lastItem === 'number' && lastItem < total - 1) {
        items.push('ellipsis-right');
      }

      const lastAfterEllipsis = items[items.length - 1];
      const isLastTotal = typeof lastAfterEllipsis === 'number' && lastAfterEllipsis === total;
      if (!isLastTotal) {
        items.push(total);
      }

      return items;
    }

    if (current >= total - innerCount) {
      items.push(1);

      if (total - innerCount > 2) {
        items.push('ellipsis-left');
      }

      const start = Math.max(2, total - innerCount);
      for (let i = start; i <= total; i++) {
        items.push(i);
      }

      return items;
    }

    const start = Math.max(2, current - Math.floor(innerCount / 2));
    const end = Math.min(total - 1, start + innerCount - 1);
    const adjustedStart = Math.max(2, end - innerCount + 1);
    items.push(1);
    if (adjustedStart > 2) {
      items.push('ellipsis-left');
    }

    for (let i = adjustedStart; i <= end; i++) {
      if (i > 1 && i < total) {
        items.push(i);
      }
    }

    if (end < total - 1) {
      items.push('ellipsis-right');
    }

    items.push(total);

    return items;
  }

  goTo(page: number | string): void {
    if (this.disabled) {
      return;
    }

    const targetPage = typeof page === 'string' ? parseInt(page, 10) : page;
    if (!Number.isFinite(targetPage)) {
      return;
    }

    const clamped = this.clampPage(targetPage);
    if (clamped === this.page) {
      return;
    }

    this.page = clamped;
    this.updateNavItems();
    this.pageChange.emit(this.page);
  }

  onPageSizeChange(size: number | string): void {
    if (this.disabled) {
      return;
    }

    const value = typeof size === 'string' ? parseInt(size, 10) : size;
    if (!Number.isFinite(value)) {
      return;
    }

    const sanitized = this.sanitizePageSize(value);
    if (sanitized === this.pageSize) {
      return;
    }

    this.pageSize = sanitized;
    this.page = 1;
    this.updateNavItems();
    this.pageSizeChange.emit(this.pageSize);
    this.pageChange.emit(this.page);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.disabled || this.variant !== 'nav') {
      return;
    }

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.goTo(this.page - 1);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.goTo(this.page + 1);
        break;
      case 'Home':
        event.preventDefault();
        this.goTo(1);
        break;
      case 'End':
        event.preventDefault();
        this.goTo(this.totalPages);
        break;
      default:
        break;
    }
  }

  private updateNavItems(): void {
    if (this.variant === 'nav') {
      this.navItems = this.calcPagesForNav();
    } else {
      this.navItems = [];
    }
  }

  private clampPage(page: number): number {
    if (!Number.isFinite(page)) {
      return 1;
    }

    const total = this.totalPages;
    return Math.min(Math.max(1, Math.floor(page)), total);
  }

  private sanitizePageSize(size: number): number {
    const sanitized = Math.max(1, Math.floor(Number.isFinite(size) ? size : 1));
    return sanitized;
  }

  private sanitizeMaxButtons(count: number): number {
    const sanitized = Math.max(NAV_MIN_BUTTONS, Math.floor(Number.isFinite(count) ? count : NAV_MIN_BUTTONS));
    return sanitized;
  }
}

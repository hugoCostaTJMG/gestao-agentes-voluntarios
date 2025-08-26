/**
 * Example usage:
 * <app-data-table
 *   [columns]="cols"
 *   [rows]="data"
 *   [zebra]="true"
 *   [selectable]="'multi'"
 *   [expandable]="true"
 *   [expandedRowTemplate]="rowDetail"
 *   [batchActions]="[
 *     { id:'export', label:'Export', icon:'fa fa-download' },
 *     { id:'delete', label:'Delete', icon:'fa fa-trash', danger:true }
 *   ]"
 *   (rowClick)="onRowClick($event)"
 *   (batchAction)="onBatch($event)">
 *   <button table-actions class="btn-primary">New</button>
 * </app-data-table>
 *
 * <ng-template #rowDetail let-row>
 *   <div class="expanded-content">
 *     <strong>{{ row.name }}</strong> — {{ row.description }}
 *   </div>
 * </ng-template>
 */
import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  OnInit,
  OnDestroy
} from '@angular/core';
import {
  CommonModule,
  NgIf,
  NgFor,
  NgClass,
  NgTemplateOutlet
} from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {
  DataTableColumn,
  DataTableBatchAction,
  SortDirection
} from './data-table.types';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, NgClass, NgTemplateOutlet],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit, OnDestroy {
  @Input() columns: DataTableColumn[] = [];
  @Input() rows: any[] = [];
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() zebra = false;
  @Input() stickyHeader = true;
  @Input() loading = false;
  @Input() selectable: 'none' | 'single' | 'multi' = 'multi';
  @Input() expandable = false;
  @Input() expandedRowTemplate?: TemplateRef<any>;

  @Input() pageIndex = 0;
  @Input() pageSize = 10;
  @Input() total = 0;
  @Input() clientPagination = true;

  @Input() initialSort?: { columnId: string; direction: SortDirection };

  @Input() showToolbar = true;
  @Input() toolbarTitle = 'Title';
  @Input() toolbarDescription = 'Description';
  @Input() showSearch = true;
  @Input() searchPlaceholder = 'Search…';
  @Input() batchActions: DataTableBatchAction[] = [];

  @Input() ariaLabel?: string;
  @Input() errorMessage?: string;

  @Output() searchChange = new EventEmitter<string>();
  @Output() sortChange = new EventEmitter<{ columnId: string; direction: SortDirection }>();
  @Output() selectionChange = new EventEmitter<any[]>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() expandChange = new EventEmitter<{ row: any; expanded: boolean }>();
  @Output() pageChange = new EventEmitter<{ pageIndex: number; pageSize: number }>();
  @Output() batchAction = new EventEmitter<{ actionId: string; selected: any[] }>();

  trackByRow = (_: number, row: any) => row;
  trackByCol = (_: number, col: DataTableColumn) => col.id;

  sortState: { columnId: string; direction: SortDirection } | null = null;

  selected: any[] = [];
  expanded = new Set<any>();
  focusedRowIndex = 0;
  lastSelectedIndex: number | null = null;

  private search$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit() {
    if (this.initialSort) {
      this.sortState = { ...this.initialSort };
    }
    this.search$
      .pipe(debounceTime(250), takeUntil(this.destroy$))
      .subscribe(value => this.searchChange.emit(value));
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(value: string) {
    this.search$.next(value);
  }

  clearSearch(input: HTMLInputElement) {
    input.value = '';
    this.search$.next('');
  }

  getAriaSort(col: DataTableColumn): 'ascending' | 'descending' | 'none' {
    if (this.sortState?.columnId !== col.id || !this.sortState.direction) {
      return 'none';
    }
    return this.sortState.direction === 'asc' ? 'ascending' : 'descending';
  }

  toggleSort(col: DataTableColumn) {
    if (!col.sortable) return;
    let direction: SortDirection = 'asc';
    if (this.sortState?.columnId === col.id) {
      direction =
        this.sortState.direction === 'asc'
          ? 'desc'
          : this.sortState.direction === 'desc'
          ? null
          : 'asc';
    }
    this.sortState = { columnId: col.id, direction };
    this.sortChange.emit(this.sortState);
  }

  get processedRows(): any[] {
    let data = [...this.rows];
    if (this.sortState?.direction) {
      const col = this.columns.find(c => c.id === this.sortState!.columnId);
      if (col?.field) {
        data.sort((a, b) => {
          const av = a[col.field!];
          const bv = b[col.field!];
          if (av == null && bv == null) return 0;
          if (av == null) return -1;
          if (bv == null) return 1;
          if (av < bv) return this.sortState!.direction === 'asc' ? -1 : 1;
          if (av > bv) return this.sortState!.direction === 'asc' ? 1 : -1;
          return 0;
        });
      }
    }
    return data;
  }

  get displayedRows(): any[] {
    let data = this.processedRows;
    if (this.clientPagination) {
      const start = this.pageIndex * this.pageSize;
      data = data.slice(start, start + this.pageSize);
    }
    return data;
  }

  get computedTotal(): number {
    return this.clientPagination ? this.rows.length : this.total;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.computedTotal / this.pageSize));
  }

  get extraColumns(): number {
  let c = 0;
    if (this.selectable !== 'none') c++;
    if (this.expandable) c++;
    return c;
  }

  get skeletonRows(): any[] {
    return Array.from({ length: this.pageSize });
  }

  get allSelected(): boolean {
    return (
      this.displayedRows.length > 0 &&
      this.displayedRows.every(r => this.selected.includes(r))
    );
  }

  toggleAll(checked: boolean) {
    if (this.selectable !== 'multi') return;
    if (checked) {
      this.displayedRows.forEach(r => {
        if (!this.selected.includes(r)) this.selected.push(r);
      });
    } else {
      this.selected = this.selected.filter(r => !this.displayedRows.includes(r));
    }
    this.selectionChange.emit(this.selected);
  }

  isRowSelected(row: any): boolean {
    return this.selected.includes(row);
  }

  toggleRow(row: any, checked?: boolean, rowIndex?: number, range = false) {
    if (this.selectable === 'none') return;
    const isSelected = this.isRowSelected(row);
    const shouldSelect = checked !== undefined ? checked : !isSelected;

    if (this.selectable === 'single') {
      this.selected = shouldSelect ? [row] : [];
    } else {
      if (range && this.lastSelectedIndex !== null && rowIndex !== undefined) {
        const start = Math.min(this.lastSelectedIndex, rowIndex);
        const end = Math.max(this.lastSelectedIndex, rowIndex);
        for (let i = start; i <= end; i++) {
          const r = this.displayedRows[i];
          if (shouldSelect && !this.selected.includes(r)) this.selected.push(r);
          if (!shouldSelect) {
            this.selected = this.selected.filter(s => s !== r);
          }
        }
      } else {
        if (shouldSelect && !isSelected) this.selected.push(row);
        if (!shouldSelect) {
          this.selected = this.selected.filter(s => s !== row);
        }
        this.lastSelectedIndex = rowIndex ?? null;
      }
    }
    this.selectionChange.emit(this.selected);
  }

  toggleExpand(row: any) {
    const expanded = this.expanded.has(row);
    if (expanded) this.expanded.delete(row);
    else this.expanded.add(row);
    this.expandChange.emit({ row, expanded: !expanded });
  }

  onRowClick(row: any) {
    this.rowClick.emit(row);
  }

  runBatch(action: DataTableBatchAction) {
    this.batchAction.emit({ actionId: action.id, selected: this.selected });
  }

  cancelBatch() {
    this.selected = [];
    this.selectionChange.emit(this.selected);
  }

  prevPage() {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      if (!this.clientPagination) {
        this.pageChange.emit({ pageIndex: this.pageIndex, pageSize: this.pageSize });
      }
    }
  }

  nextPage() {
    if (this.pageIndex + 1 < this.totalPages) {
      this.pageIndex++;
      if (!this.clientPagination) {
        this.pageChange.emit({ pageIndex: this.pageIndex, pageSize: this.pageSize });
      }
    }
  }

  onPageSizeChange(size: string) {
    this.pageSize = parseInt(size, 10);
    this.pageIndex = 0;
    if (!this.clientPagination) {
      this.pageChange.emit({ pageIndex: this.pageIndex, pageSize: this.pageSize });
    }
  }

  onWrapperKeydown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusedRowIndex = Math.min(
        this.focusedRowIndex + 1,
        this.displayedRows.length - 1
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.focusedRowIndex = Math.max(this.focusedRowIndex - 1, 0);
    } else if (event.key === ' ' && this.displayedRows.length) {
      event.preventDefault();
      const row = this.displayedRows[this.focusedRowIndex];
      this.toggleRow(
        row,
        undefined,
        this.focusedRowIndex,
        event.shiftKey && this.selectable === 'multi'
      );
    }
  }
}

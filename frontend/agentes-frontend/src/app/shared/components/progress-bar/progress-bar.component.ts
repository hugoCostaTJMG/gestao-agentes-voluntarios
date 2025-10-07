import {
  AfterContentChecked,
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  HostBinding,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
} from '@angular/core';
import { CommonModule, NgClass, NgTemplateOutlet } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { ProgressBarItemComponent, ProgressBarItemStatus } from './progress-bar-item.component';

type ProgressBarStatus = 'default' | 'success' | 'error' | 'neutral';

interface ProgressBarSegment {
  label?: string;
  value: number;
  percent: number;
  status: ProgressBarItemStatus;
  tooltip?: string;
  icon?: string;
  ariaLabel?: string;
}

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule, NgClass, NgTemplateOutlet],
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarComponent
  implements OnChanges, AfterContentInit, AfterContentChecked, OnDestroy
{
  private static nextId = 0;

  private readonly percentChanges$ = new Subject<number>();
  private percentChangesSub?: Subscription;
  private itemsChangesSub?: Subscription;

  private lastPercent?: number;
  private completedEmitted = false;
  private itemsSignature: string | null = null;
  private normalizationWarned = false;

  readonly id = `app-progress-bar-${ProgressBarComponent.nextId++}`;
  readonly labelId = `${this.id}-label`;
  readonly helperId = `${this.id}-helper`;
  readonly liveRegionId = `${this.id}-live`;

  @Input() value: number | null | undefined = 0;
  @Input() max: number = 100;
  @Input() indeterminate: boolean = false;
  @Input() label?: string;
  @Input() helperText?: string;
  @Input() status: ProgressBarStatus = 'default';
  @Input() showPercentage: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() inline: boolean = false;
  @Input() skeleton: boolean = false;
  @Input() ariaLabel?: string;
  @Input() ariaDescribedby?: string;
  @Input() animated: boolean = true;
  @Input() striped: boolean = false;
  @Input() segmented: boolean = false;
  @Input() stackedLabels: boolean = false;
  @Input() showItemLabels: boolean = false;

  @Output() readonly completed = new EventEmitter<void>();

  @ContentChildren(ProgressBarItemComponent)
  items?: QueryList<ProgressBarItemComponent>;

  percent?: number;
  currentValue: number = 0;
  liveMessage: string = '';
  segments: ProgressBarSegment[] = [];

  constructor(private readonly cdr: ChangeDetectorRef) {
    this.percentChangesSub = this.percentChanges$
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((percent) => {
        this.liveMessage = `Progresso: ${Math.round(percent)}%`;
        this.cdr.markForCheck();
      });
  }

  @HostBinding('class')
  get hostClasses(): string {
    const classes = ['pb-host', `pb-size-${this.size}`, `pb-status-${this.status}`];
    if (this.inline) {
      classes.push('pb-inline');
    }
    if (this.segmented) {
      classes.push('pb-segmented');
    }
    if (this.skeleton) {
      classes.push('pb-skeleton');
    }
    if (this.indeterminate) {
      classes.push('pb-indeterminate');
    }
    return classes.join(' ');
  }

  get isDeterminate(): boolean {
    return !this.indeterminate && !this.skeleton;
  }

  get ariaBusy(): string {
    return this.indeterminate || this.skeleton ? 'true' : 'false';
  }

  get ariaValueMin(): string | null {
    return this.isDeterminate ? '0' : null;
  }

  get ariaValueMax(): string | null {
    return this.isDeterminate ? String(Math.max(this.max, 0)) : null;
  }

  get ariaValueNow(): string | null {
    return this.isDeterminate ? String(this.currentValue) : null;
  }

  get ariaLabelAttr(): string | null {
    return this.label ? null : this.ariaLabel ?? null;
  }

  get ariaLabelledby(): string | null {
    return this.label ? this.labelId : null;
  }

  get ariaDescribedByAttr(): string | null {
    const ids: string[] = [];
    if (this.helperText) {
      ids.push(this.helperId);
    }
    if (this.ariaDescribedby) {
      ids.push(this.ariaDescribedby);
    }
    return ids.length ? ids.join(' ') : null;
  }

  get percentageText(): string {
    return `${Math.round(this.percent ?? 0)}%`;
  }

  get percentStyle(): string | null {
    return this.percent !== undefined ? `${this.percent}%` : null;
  }

  get statusIcon(): string | null {
    if (this.status === 'success') {
      return '✓';
    }
    if (this.status === 'error') {
      return '⨯';
    }
    return null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      'value' in changes ||
      'max' in changes ||
      'indeterminate' in changes ||
      'skeleton' in changes
    ) {
      this.updateProgress();
    }

    if ('segmented' in changes || 'max' in changes) {
      this.resetSegments();
      this.recalculateSegments();
    }
  }

  ngAfterContentInit(): void {
    if (this.items) {
      this.itemsChangesSub = this.items.changes.subscribe(() => {
        this.resetSegments();
        this.recalculateSegments();
      });
    }
    this.recalculateSegments();
  }

  ngAfterContentChecked(): void {
    if (this.segmented) {
      const signature = this.buildItemsSignature();
      if (signature !== this.itemsSignature) {
        this.itemsSignature = signature;
        this.recalculateSegments();
      }
    }
  }

  ngOnDestroy(): void {
    this.percentChangesSub?.unsubscribe();
    this.itemsChangesSub?.unsubscribe();
  }

  private updateProgress(): void {
    const max = Math.max(this.max, 0);
    const rawValue = this.value ?? 0;
    const clampedValue = max > 0 ? this.clamp(rawValue, 0, max) : 0;

    this.currentValue = clampedValue;

    if (this.isDeterminate && max > 0) {
      const percent = this.clamp((clampedValue / max) * 100, 0, 100);
      this.percent = percent;
      if (percent !== this.lastPercent) {
        this.lastPercent = percent;
        this.percentChanges$.next(percent);
      }
      if (percent >= 100) {
        if (!this.completedEmitted) {
          this.completed.emit();
          this.completedEmitted = true;
        }
      } else {
        this.completedEmitted = false;
      }
    } else {
      this.percent = undefined;
      this.lastPercent = undefined;
      this.liveMessage = '';
      this.completedEmitted = false;
    }
  }

  private recalculateSegments(): void {
    if (!this.segmented) {
      if (this.segments.length) {
        this.segments = [];
        this.cdr.markForCheck();
      }
      return;
    }

    const items = this.items?.toArray() ?? [];
    if (!items.length) {
      if (this.segments.length) {
        this.segments = [];
        this.cdr.markForCheck();
      }
      return;
    }

    const max = Math.max(this.max, 0);
    const safeMax = max > 0 ? max : 0;
    const sanitized = items.map((item) => ({
      label: item.label,
      value: Math.max(item.value, 0),
      status: item.status ?? 'default',
      tooltip: item.tooltip,
      icon: item.icon,
      ariaLabel: item.ariaLabel,
    }));

    const total = sanitized.reduce((sum, item) => sum + item.value, 0);
    let factor = 1;
    if (safeMax > 0 && total > safeMax) {
      factor = safeMax / total;
      if (!this.normalizationWarned) {
        console.warn(
          '[ProgressBarComponent] Segment values exceed max. Values will be normalized.'
        );
        this.normalizationWarned = true;
      }
    } else {
      this.normalizationWarned = false;
    }

    const computed: ProgressBarSegment[] = sanitized.map((item) => {
      const normalizedValue = item.value * factor;
      const percent = safeMax > 0 ? this.clamp((normalizedValue / safeMax) * 100, 0, 100) : 0;
      return {
        label: item.label,
        value: normalizedValue,
        percent,
        status: item.status,
        tooltip: item.tooltip,
        icon: item.icon,
        ariaLabel: item.ariaLabel,
      };
    });

    this.segments = computed;
    this.cdr.markForCheck();
  }

  private resetSegments(): void {
    this.itemsSignature = null;
    this.normalizationWarned = false;
  }

  private buildItemsSignature(): string {
    if (!this.items || !this.items.length) {
      return '';
    }

    return this.items
      .map((item) =>
        [
          item.label ?? '',
          item.value,
          item.status ?? 'default',
          item.tooltip ?? '',
          item.icon ?? '',
          item.ariaLabel ?? '',
        ].join('|')
      )
      .join(';');
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

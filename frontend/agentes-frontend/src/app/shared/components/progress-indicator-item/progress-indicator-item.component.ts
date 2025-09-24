import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule, NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-progress-indicator-item',
  standalone: true,
  imports: [CommonModule, NgClass, NgIf],
  templateUrl: './progress-indicator-item.component.html',
  styleUrl: './progress-indicator-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressIndicatorItemComponent {
  private static nextId = 0;

  @Input() index = 0;
  @Input() label = '';
  @Input() optionalLabel?: string;
  @Input() state: 'incomplete' | 'current' | 'complete' | 'error' | 'disabled' = 'incomplete';
  @Input() tooltip?: string;
  @Input() size: 'sm' | 'md' = 'md';
  @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
  @Input() clickable = true;
  @Input() skeleton = false;
  @Input() showLabels = true;
  @Input() isFirst = false;
  @Input() isLast = false;
  @Input() tabStop = false;
  @Input() itemId: string = `app-progress-indicator-item-${ProgressIndicatorItemComponent.nextId++}`;
  @Input() tooltipId?: string;
  @Input() total = 0;
  @Input() position = 0;
  @Input() href?: string;

  @Output() readonly activate = new EventEmitter<void>();
  @Output() readonly focused = new EventEmitter<void>();

  @ViewChild('interactive', { static: true })
  private readonly interactive?: ElementRef<HTMLElement>;

  tooltipVisible = false;

  constructor(private readonly cdr: ChangeDetectorRef) {}

  get isDisabledState(): boolean {
    return this.state === 'disabled' || this.skeleton;
  }

  get isCurrent(): boolean {
    return this.state === 'current';
  }

  get isComplete(): boolean {
    return this.state === 'complete';
  }

  get isError(): boolean {
    return this.state === 'error';
  }

  get interactiveRole(): string | null {
    if (this.skeleton) {
      return null;
    }
    return this.clickable ? 'button' : null;
  }

  get ariaDisabled(): string | null {
    return this.isDisabledState ? 'true' : null;
  }

  get tabIndex(): number {
    if (this.isDisabledState) {
      return -1;
    }
    return this.tabStop ? 0 : -1;
  }

  focus(): void {
    if (!this.interactive) {
      return;
    }
    this.interactive.nativeElement.focus({ preventScroll: true });
  }

  onClick(event: MouseEvent): void {
    if (!this.canActivate()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.activate.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      if (this.canActivate()) {
        event.preventDefault();
        event.stopPropagation();
        this.activate.emit();
      }
    } else if (event.key === 'Escape' && this.tooltipVisible) {
      this.hideTooltip();
      event.stopPropagation();
      event.preventDefault();
    }
  }

  onFocus(): void {
    this.focused.emit();
    if (this.tooltip && !this.skeleton && !this.isDisabledState) {
      this.tooltipVisible = true;
      this.cdr.markForCheck();
    }
  }

  onBlur(): void {
    if (this.tooltipVisible) {
      this.hideTooltip();
    }
  }

  onMouseEnter(): void {
    if (this.tooltip && !this.skeleton && !this.isDisabledState) {
      this.tooltipVisible = true;
      this.cdr.markForCheck();
    }
  }

  onMouseLeave(): void {
    if (this.tooltipVisible) {
      this.hideTooltip();
    }
  }

  hideTooltip(): void {
    this.tooltipVisible = false;
    this.cdr.markForCheck();
  }

  private canActivate(): boolean {
    return this.clickable && !this.isDisabledState && !this.skeleton;
  }
}

import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule, NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, OnDestroy, Output, ViewChild } from '@angular/core';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';
export type ModalActionKind = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost' | 'cancel';

export interface ModalStep {
  label: string;
  optionalLabel?: string;
  state: 'complete' | 'current' | 'incomplete';
}

export interface ModalAction {
  id: string;
  label: string;
  kind: ModalActionKind;
  align?: 'left' | 'right';
  disabled?: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, NgClass, NgIf, NgTemplateOutlet, A11yModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent implements OnDestroy {
  private _open = false;
  private lastActiveElement: HTMLElement | null = null;
  private bodyOverflow = '';

  @ViewChild('container') containerRef!: ElementRef<HTMLElement>;

  @Input()
  get open(): boolean { return this._open; }
  set open(value: boolean) {
    this._open = value;
    if (value) {
      this.onOpen();
    } else {
      this.onClose();
    }
  }

  @Input() size: ModalSize = 'lg';
  @Input() title = '';
  @Input() label?: string;
  @Input() description?: string;
  @Input() showClose = true;
  @Input() closeOnEsc = true;
  @Input() closeOnBackdrop = true;
  @Input() focusTrap = true;
  @Input() initialFocus?: string;
  @Input() actions: ModalAction[] = [];
  @Input() busy = false;
  @Input() busyMessage = 'Loading message';
  @Input() steps: ModalStep[] = [];

  // A11y
  @Input() ariaLabel?: string;
  @Input() ariaLabelledby?: string;
  @Input() ariaDescribedby?: string;

  @Output() openChange = new EventEmitter<boolean>();
  @Output() closed = new EventEmitter<'esc' | 'backdrop' | 'close-button' | 'action'>();
  @Output() action = new EventEmitter<string>();

  titleId = `modal-title-${Math.random().toString(36).substring(2,9)}`;
  descId = `modal-desc-${Math.random().toString(36).substring(2,9)}`;

  ngOnDestroy(): void {
    if (this.open) {
      this.restoreBody();
    }
  }

  get leftActions(): ModalAction[] {
    return this.actions.filter(a => a.align === 'left');
  }

  get rightActions(): ModalAction[] {
    return this.actions.filter(a => a.align !== 'left');
  }

  get progress(): number {
    if (!this.steps.length) return 0;
    const completed = this.steps.filter(s => s.state === 'complete').length;
    const currentIndex = this.steps.findIndex(s => s.state === 'current');
    const value = completed + (currentIndex >= 0 ? 1 : 0);
    return (value / this.steps.length) * 100;
  }

  @HostListener('document:keydown.escape', ['$event'])
  handleEsc(event: KeyboardEvent): void {
    if (this.open && this.closeOnEsc && !this.busy) {
      event.preventDefault();
      this.emitClose('esc');
    }
  }

  onBackdropClick(): void {
    if (this.closeOnBackdrop && !this.busy) {
      this.emitClose('backdrop');
    }
  }

  onCloseButton(): void {
    if (!this.busy) {
      this.emitClose('close-button');
    }
  }

  onActionClick(act: ModalAction): void {
    if (act.disabled || this.busy) {
      return;
    }
    this.action.emit(act.id);
    if (act.kind === 'cancel') {
      this.emitClose('action');
    }
  }

  private onOpen(): void {
    this.lastActiveElement = document.activeElement as HTMLElement;
    this.bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    setTimeout(() => this.setInitialFocus(), 0);
  }

  private onClose(): void {
    this.restoreBody();
    if (this.lastActiveElement) {
      this.lastActiveElement.focus();
    }
  }

  private restoreBody(): void {
    document.body.style.overflow = this.bodyOverflow;
  }

  private setInitialFocus(): void {
    if (!this.open) return;
    const container = this.containerRef?.nativeElement;
    let focusEl: HTMLElement | null = null;
    if (this.initialFocus) {
      focusEl = container.querySelector(this.initialFocus) as HTMLElement;
    }
    if (!focusEl) {
      focusEl = container.querySelector('button.modal-action.primary') as HTMLElement;
    }
    if (!focusEl) {
      focusEl = container;
    }
    focusEl.focus();
  }

  private emitClose(reason: 'esc' | 'backdrop' | 'close-button' | 'action'): void {
    this._open = false;
    this.openChange.emit(false);
    this.closed.emit(reason);
    this.onClose();
  }
}


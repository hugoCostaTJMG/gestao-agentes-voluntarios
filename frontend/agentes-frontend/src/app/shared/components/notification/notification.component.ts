import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, HostBinding, HostListener, Input, Output } from '@angular/core';
import { NotificationItemComponent, NotificationItemModel } from '../notification-item/notification-item.component';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, NgClass, NotificationItemComponent],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent {
  @Input() items: NotificationItemModel[] = [];
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';
  @Input() theme: 'light' | 'dark' = 'light';

  @Output() itemAction = new EventEmitter<string>();
  @Output() itemDismiss = new EventEmitter<string>();

  @HostBinding('attr.role') role = 'region';
  @HostBinding('attr.aria-live') ariaLive = 'polite';

  @HostBinding('class') get hostClasses(): string {
    return [
      'notification-host',
      this.isToast() ? 'toast' : 'inline',
      `position-${this.position}`,
      `theme-${this.theme}`
    ].join(' ');
  }

  trackById(_index: number, item: NotificationItemModel): string {
    return item.id;
  }

  onAction(id: string): void {
    this.itemAction.emit(id);
  }

  onDismiss(id: string): void {
    this.items = this.items.filter(i => i.id !== id);
    this.itemDismiss.emit(id);
  }

  isToast(): boolean {
    return this.items.some(i => i.kind === 'toast');
  }

  // Global ESC key closes last toast
  @HostListener('document:keydown.escape')
  onEsc(): void {
    const toasts = this.items.filter(i => i.kind === 'toast');
    if (toasts.length) {
      const last = toasts[toasts.length - 1];
      this.onDismiss(last.id);
    }
  }
}

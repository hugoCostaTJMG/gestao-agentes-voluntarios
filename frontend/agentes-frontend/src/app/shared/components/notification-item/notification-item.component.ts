import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

export type NotificationKind = 'inline' | 'toast';
export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type ActionStyle = 'link' | 'outline' | 'ghost';

export interface NotificationItemModel {
  id: string;
  kind: NotificationKind;
  type: NotificationType;
  title?: string;
  message: string;
  actionLabel?: string;
  actionStyle?: ActionStyle; // default: 'link'
  actionAriaLabel?: string;
  timestamp?: string; // e.g.: "Time stamp [00:00:00]"
  dismissible?: boolean; // default: true
  theme?: 'light' | 'dark'; // default inherited from container via class
}

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(8px)' }),
        animate(
          '150ms cubic-bezier(0.2,0,0.38,0.9)',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms cubic-bezier(0.2,0,0.38,0.9)',
          style({ opacity: 0, transform: 'translateY(-8px)' })
        ),
      ]),
    ]),
  ],
})
export class NotificationItemComponent {
  @Input() item!: NotificationItemModel;

  @Output() action = new EventEmitter<string>();
  @Output() dismiss = new EventEmitter<string>();

  iconClass(type: NotificationType): string {
    switch (type) {
      case 'success':
        return 'fa-solid fa-circle-check';
      case 'warning':
        return 'fa-solid fa-triangle-exclamation';
      case 'error':
        return 'fa-solid fa-circle-xmark';
      default:
        return 'fa-solid fa-circle-info';
    }
  }

  onAction(): void {
    this.action.emit(this.item.id);
  }

  onDismiss(): void {
    this.dismiss.emit(this.item.id);
  }

  // Allows ESC key to dismiss when item has focus
  @HostListener('keydown.escape')
  handleEsc(): void {
    if (this.item.dismissible !== false) {
      this.onDismiss();
    }
  }
}


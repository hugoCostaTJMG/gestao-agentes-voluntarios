import { CommonModule, NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tag',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './tag.component.html',
  styleUrls: ['./tag.component.scss']
})
export class TagComponent {
  @Input() text = '';
  @Input() kind: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral' = 'secondary';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() filter = false; // closable
  @Input() disabled = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;

  @Output() closed = new EventEmitter<void>();
  @Output() clicked = new EventEmitter<void>();

  onClose(event: Event): void { event.stopPropagation(); if (!this.disabled) this.closed.emit(); }
  onClick(): void { if (!this.disabled) this.clicked.emit(); }
}


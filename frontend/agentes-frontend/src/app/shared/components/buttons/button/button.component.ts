import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

type ButtonKind =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'danger'
  | 'danger-tertiary'
  | 'danger-ghost';

type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass, NgIf, RouterLink],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() label = '';
  /** Mantive o nome `type` para compatibilidade com seu código, mas agora mapeado para os kinds do Carbon */
  @Input() type: ButtonKind = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;

  @Input() iconLeft?: string;
  @Input() iconRight?: string;

  @Input() buttonType: 'button' | 'submit' | 'reset' = 'button';
  @Input() routerLink?: string | any[];
  @Input() ariaLabel?: string;

  @Output() clicked = new EventEmitter<Event>();

  /** Icon-only quando não há label e existe ao menos um ícone */
  get iconOnly(): boolean {
    return !this.label && !!(this.iconLeft || this.iconRight);
  }

  onClick(event: Event): void {
    if (this.disabled || this.loading) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.clicked.emit(event);
  }
}

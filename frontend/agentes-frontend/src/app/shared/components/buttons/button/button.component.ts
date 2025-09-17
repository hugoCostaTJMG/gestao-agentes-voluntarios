import { Component, EventEmitter, Input, Output, ChangeDetectionStrategy } from '@angular/core';
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
  styleUrls: ['./button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  // Visuais/uso atual
  @Input() label = '';
  @Input() type: ButtonKind = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() buttonType: 'button' | 'submit' | 'reset' = 'button';
  @Input() routerLink?: string | any[];
  @Input() queryParams?: Record<string, any> | undefined;

  // Acessibilidade básica
  @Input() id?: string;
  @Input() ariaLabel?: string;
  @Input() ariaLabelledby?: string;
  @Input() ariaDescribedby?: string;

  // Estados ARIA
  /** Se o botão aciona algo expansível (ex.: disclosure/accordion) */
  @Input() disclosure = false;
  /** Estado aberto/fechado do alvo do disclosure */
  @Input() expanded = false;
  /** ID do elemento controlado (para aria-controls) */
  @Input() ariaControls?: string;

  /** Botão toggle (liga/desliga) com aria-pressed */
  @Input() toggle = false;
  @Input() pressed = false;

  /** Expor aria-busy explicitamente (além de derivar de loading) */
  @Input() ariaBusy?: 'true' | 'false';
  /** Caso deseje expor semanticamente como link (quando estilizado como botão) */
  @Input() asLink = false;

  /** Descreve via ID de alerta/status (ex.: mensagem de erro ou instrução) */
  @Input() ariaErrormessage?: string;

  @Output() clicked = new EventEmitter<Event>();

  /** Icon-only quando não há label e existe ao menos um ícone */
  get iconOnly(): boolean {
    return !this.label && !!(this.iconLeft || this.iconRight);
  }

  /** aria-busy resolvido (prioriza input explícito) */
  get resolvedAriaBusy(): 'true' | null {
    if (this.ariaBusy) return this.ariaBusy === 'true' ? 'true' : null;
    return this.loading ? 'true' : null;
    // null evita atributo quando false
  }

  /** aria-pressed resolvido apenas quando toggle */
  get resolvedAriaPressed(): 'true' | 'false' | null {
    return this.toggle ? (this.pressed ? 'true' : 'false') : null;
  }

  /** aria-expanded resolvido apenas quando disclosure */
  get resolvedAriaExpanded(): 'true' | 'false' | null {
    return this.disclosure ? (this.expanded ? 'true' : 'false') : null;
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

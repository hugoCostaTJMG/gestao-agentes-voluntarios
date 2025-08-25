import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [NgClass, RouterLink, NgIf, NgTemplateOutlet],
  templateUrl: './badge.component.html',
  styleUrls: ['./badge.component.scss']
})
export class BadgeComponent {
  /** Texto exibido dentro do badge */
  @Input() text: string = '';
  /** Variante de cor do badge */
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'dark' = 'primary';
  /** Tom do badge */
  @Input() tone: 'solid' | 'soft' | 'outline' = 'solid';
  /** Tamanho do badge */
  @Input() size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  /** Formato do badge */
  @Input() shape: 'pill' | 'rounded' = 'rounded';
  /** Ícone exibido à esquerda */
  @Input() iconLeft?: string;
  /** Ícone exibido à direita */
  @Input() iconRight?: string;
  /** Exibir apenas o ponto de status */
  @Input() dot: boolean = false;
  /** Contador numérico exibido à direita */
  @Input() count?: number;
  /** Exibe botão de fechar */
  @Input() closable: boolean = false;
  /** Link externo para o badge */
  @Input() href?: string;
  /** Rota angular para o badge */
  @Input() routerLink?: string | any[];
  /** Rótulo acessível quando não há texto visível */
  @Input() ariaLabel?: string;
  /** Desabilita o badge */
  @Input() disabled: boolean = false;
  /** Permite sobrescrever o tabindex padrão */
  @Input() tabIndexOverride?: number;

  /** Emitido ao clicar no botão de fechar */
  @Output() closed = new EventEmitter<void>();
  /** Emitido ao clicar no badge */
  @Output() clicked = new EventEmitter<void>();

  /** Determina se o badge é clicável */
  get clickable(): boolean {
    return !this.disabled && (this.href !== undefined || this.routerLink !== undefined || this.clicked.observed);
  }

  /** Determina o papel semântico do badge */
  get role(): string {
    if (this.href || this.routerLink) {
      return 'link';
    }
    return this.clickable ? 'button' : 'status';
  }

  /** Classes aplicadas dinamicamente ao badge */
  get badgeClasses(): Record<string, boolean> {
    return {
      [this.variant]: true,
      [this.tone]: true,
      [this.size]: true,
      [this.shape]: true,
      disabled: this.disabled,
      dot: this.dot,
      closable: this.closable,
      clickable: this.clickable
    };
  }

  /** Elemento base utilizado na renderização */
  get elementType(): 'a' | 'button' | 'span' {
    if (this.href || this.routerLink) {
      return 'a';
    }
    if (this.clickable) {
      return 'button';
    }
    return 'span';
  }

  onClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit();
  }

  onClose(event: Event): void {
    event.stopPropagation();
    this.closed.emit();
  }

  onKeydown(event: KeyboardEvent): void {
    if (this.disabled) {
      return;
    }
    if (this.clickable && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      this.clicked.emit();
    }
  }

  onCloseKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this.closed.emit();
    }
  }
}

/*
Exemplos de uso:
<app-badge text="Primary" variant="primary" tone="solid" size="md" shape="pill"></app-badge>
<app-badge text="Danger" variant="danger" tone="soft" size="sm" iconLeft="fa fa-fire"></app-badge>
<app-badge text="Sucesso" variant="success" tone="outline" size="lg" iconRight="fa fa-check"></app-badge>
<app-badge dot variant="info" size="xs" ariaLabel="Status info"></app-badge>
<app-badge text="Inbox" [count]="3" closable variant="neutral"></app-badge>
<a app-badge text="Docs" href="/docs" variant="primary"></a>
*/

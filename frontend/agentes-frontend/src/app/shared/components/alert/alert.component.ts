import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss'],
  animations: [
    trigger('fade', [
      transition(':enter', [style({ opacity: 0 }), animate('150ms ease-in', style({ opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-out', style({ opacity: 0 }))]),
    ]),
  ],
})
export class AlertComponent {
  // Variantes ampliadas para o layout da imagem
  @Input() type:
    | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'ghost' = 'primary';

  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  /** Título grande (ex.: "Well done!") */
  @Input() title?: string;

  /** Mensagem; suporta quebras de linha com \n */
  @Input() message: string = '';

  /** Ícones opcionais (classes FontAwesome) */
  @Input() iconLeft?: string;
  @Input() iconRight?: string;

  /** Mostra botão de fechar (X) */
  @Input() dismissible: boolean = false;

  @Output() dismissed = new EventEmitter<void>();

  visible = true;

  onDismiss(): void {
    this.visible = false;
    this.dismissed.emit();
  }
}

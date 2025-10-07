import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
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
export class AlertComponent implements OnInit, OnChanges, OnDestroy {
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
  /** Fecha automaticamente após X ms (padrão: 10000ms). Use 0 para desabilitar */
  @Input() autoCloseMs: number = 10000;

  @Output() dismissed = new EventEmitter<void>();

  visible = true;
  private timer: any = null;

  onDismiss(): void {
    this.visible = false;
    this.dismissed.emit();
  }

  ngOnInit(): void {
    this.startTimer();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['message'] || changes['type']) {
      this.restartTimer();
    }
    if (changes['autoCloseMs']) {
      this.restartTimer();
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  private startTimer(): void {
    this.clearTimer();
    if (this.autoCloseMs && this.autoCloseMs > 0) {
      this.timer = setTimeout(() => this.onDismiss(), this.autoCloseMs);
    }
  }

  private restartTimer(): void {
    this.startTimer();
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

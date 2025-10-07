import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgenteVoluntario } from '../../models/interfaces';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-carteirinha-preview',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  templateUrl: './carteirinha-preview.component.html',
  styleUrls: ['./carteirinha-preview.component.scss']
})
export class CarteirinhaPreviewComponent implements OnChanges, OnDestroy {
  @Input() agente?: AgenteVoluntario | null;
  fotoUrl?: string;
  private objectUrl?: string;

  constructor(private api: ApiService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['agente']) {
      this.carregarFoto();
    }
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = undefined;
    }
  }

  private carregarFoto(): void {
    this.revokeObjectUrl();
    this.fotoUrl = undefined;
    const id = this.agente?.id;
    if (!id) return;
    this.api.getFotoAgente(id).subscribe({
      next: (blob) => {
        if (blob && blob.size > 0) {
          this.objectUrl = URL.createObjectURL(blob);
          this.fotoUrl = this.objectUrl;
        }
      },
      error: () => {
        this.fotoUrl = undefined;
      }
    });
  }

  get nome(): string {
    return this.agente?.nomeCompleto || (this.agente as any)?.nome || '—';
  }

  get cpf(): string {
    const v = this.agente?.cpf || '';
    const d = v.replace(/\D/g, '');
    return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : v || '—';
  }

  get comarca(): string {
    return this.agente?.comarcas?.[0]?.nomeComarca || '—';
  }

  get statusTexto(): string {
    const s = (this.agente?.status || '').toString();
    // normaliza para rotulo legível
    const n = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\b(DE|DA|DO|DAS|DOS)\b/g, ' ').replace(/\s+/g, '_');
    switch (n) {
      case 'ATIVO': return 'Ativo';
      case 'INATIVO': return 'Inativo';
      case 'EM_ANALISE': return 'Em Análise';
      case 'QUADRO_RESERVA': return 'Quadro de Reserva';
      default: return s || '—';
    }
  }

  get statusVariant(): 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'dark' {
    const s = (this.agente?.status || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\b(DE|DA|DO|DAS|DOS)\b/g, ' ').replace(/\s+/g, '_');
    switch (s) {
      case 'ATIVO': return 'success';
      case 'EM_ANALISE': return 'warning';
      case 'INATIVO': return 'danger';
      default: return 'neutral';
    }
  }

  get codigo(): string {
    const id = this.agente?.id || 0;
    return `AGV-${String(id).padStart(4, '0')}`;
  }
}

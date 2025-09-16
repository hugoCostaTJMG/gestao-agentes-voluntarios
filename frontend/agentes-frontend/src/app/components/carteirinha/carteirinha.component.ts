import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { take } from 'rxjs/operators';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AgenteVoluntario } from '../../models/interfaces';

@Component({
  selector: 'app-carteirinha',
  standalone: true,
  imports: [CommonModule, NgIf, ButtonComponent, BadgeComponent, AlertComponent],
  templateUrl: './carteirinha.component.html',
  styleUrls: ['./carteirinha.component.scss']
})
export class CarteirinhaComponent implements OnInit {
  agente?: AgenteVoluntario;
  podeGerar = false;
  loadingDados = false;
  loadingPreview = false;
  loadingDownload = false;
  mensagemErro = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    const usuario = this.authService.getCurrentUser();

    this.carregarDadosAgente(1);
    this.verificarStatus(1);
  }

  get nomeCompleto(): string {
    return this.agente?.nomeCompleto ?? this.agente?.nome ?? this.authService.getCurrentUser()?.nome ?? '';
  }

  get cpfFormatado(): string {
    return this.agente?.cpf ?? '---';
  }

  get comarcaPrincipal(): string {
    return this.agente?.comarcas?.[0]?.nomeComarca ?? 'Não informado';
  }

  get statusAgente(): string {
    return this.agente?.status ?? 'INDEFINIDO';
  }

  get statusVariant(): 'primary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'dark' {
    switch ((this.agente?.status ?? '').toUpperCase()) {
      case 'ATIVO':
        return 'success';
      case 'EM_ANALISE':
      case 'PENDENTE':
        return 'warning';
      case 'INATIVO':
      case 'SUSPENSO':
        return 'danger';
      default:
        return 'neutral';
    }
  }

  get codigoCredencial(): string {
    if (this.agente?.id) {
      return `AGV-${String(this.agente.id).padStart(4, '0')}`;
    }
    return 'AGV-XXXX';
  }

  private carregarDadosAgente(id: number): void {
    this.loadingDados = true;
    this.apiService.buscarAgentePorId(id).pipe(take(1)).subscribe({
      next: (agente) => {
        this.agente = agente;
        this.loadingDados = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do agente.', error);
        this.mensagemErro = 'Erro ao carregar seus dados. Tente novamente.';
        this.loadingDados = false;
      }
    });
  }

  private verificarStatus(id: number): void {
    this.apiService.verificarStatusCarteirinha(id).pipe(take(1)).subscribe({
      next: (resultado) => {
        this.podeGerar = resultado.podeGerar;
        if (!resultado.podeGerar && resultado.mensagem) {
          this.mensagemErro = resultado.mensagem;
        }
      },
      error: (error) => {
        console.error('Erro ao verificar status da carteirinha.', error);
        this.mensagemErro = 'Não foi possível verificar seu status para emissão da carteirinha.';
      }
    });
  }

  previewCarteirinha(): void {
    if (!this.agente?.id || !this.podeGerar) {
      return;
    }
    this.mensagemErro = '';
    this.loadingPreview = true;
    this.apiService.download(`/carteirinha/preview/${this.agente.id}`).pipe(take(1)).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        this.loadingPreview = false;
      },
      error: (error) => {
        console.error('Erro ao gerar preview da carteirinha.', error);
        this.mensagemErro = 'Não foi possível gerar o preview da carteirinha.';
        this.loadingPreview = false;
      }
    });
  }

  gerarCarteirinha(): void {
    if (!this.agente?.id || !this.podeGerar) {
      return;
    }
    this.mensagemErro = '';
    this.loadingDownload = true;
    this.apiService.download(`/carteirinha/gerar/${this.agente.id}`).pipe(take(1)).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `carteirinha_${this.agente?.nomeCompleto?.replace(/\s+/g, '_') ?? 'agente'}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.loadingDownload = false;
      },
      error: (error) => {
        console.error('Erro ao gerar carteirinha.', error);
        this.mensagemErro = 'Não foi possível gerar a carteirinha no momento.';
        this.loadingDownload = false;
      }
    });
  }
}

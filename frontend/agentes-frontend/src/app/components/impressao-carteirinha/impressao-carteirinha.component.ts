import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';
import { NgIf, NgFor } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CarteirinhaPreviewComponent } from '../carteirinha-preview/carteirinha-preview.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ProgressIndicatorComponent, type ProgressItem } from '../../shared/components/progress-indicator/progress-indicator.component';

@Component({
  selector: 'app-impressao-carteirinha',
  standalone: true,
  imports: [NgIf, NgFor, ModalComponent, CarteirinhaPreviewComponent, PageHeaderComponent, AlertComponent, ButtonComponent, BadgeComponent, ProgressIndicatorComponent],
  templateUrl: './impressao-carteirinha.component.html',
  styleUrls: ['./impressao-carteirinha.component.scss']
})
export class ImpressaoCarteirinhaComponent implements OnInit {
  agenteId: number = 0;
  agente: any = null;
  loading: boolean = false;
  error: string = '';
  podeGerar: boolean = false;
  verificandoStatus: boolean = false;
  previewOpen = false;
  fotoUrl?: string;
  private objectUrl?: string;
  progressItems: ProgressItem[] = [];
  progressCurrent = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.temPermissaoImpressao()) {
      this.router.navigate(['/']);
      return;
    }

    const idParam = this.route.snapshot.paramMap.get('id');
    this.agenteId = idParam ? Number(idParam) : 0;

    if (this.agenteId) {
      this.carregarDadosAgente();
      this.verificarStatusCarteirinha();
    } else {
      this.mostrarErro('ID do agente não informado');
    }
    this.updateProgress();
  }

  /**
   * Verifica se o usuário tem permissão para impressão
   */
  temPermissaoImpressao(): boolean {
    const perfil = this.authService.getUserProfile();
    return !!perfil && ['CORREGEDORIA'].includes(perfil);
  }

  /**
   * Carrega os dados do agente
   */
  carregarDadosAgente(): void {
    this.loading = true;
    this.error = '';

    this.apiService.buscarAgentePorId(this.agenteId).pipe(take(1)).subscribe({
      next: (response) => {
        this.agente = response;
        this.loading = false;
        this.carregarFoto();
        this.updateProgress();
      },
      error: (error) => {
        this.mostrarErro('Erro ao carregar dados do agente');
        console.error('Erro ao carregar agente:', error);
      }
    });
  }

  private carregarFoto(): void {
    this.revokeObjectUrl();
    this.fotoUrl = undefined;
    this.apiService.getFotoAgente(this.agenteId).pipe(take(1)).subscribe({
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

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = undefined;
    }
  }

  /**
   * Verifica se o agente pode ter carteirinha gerada
   */
  verificarStatusCarteirinha(): void {
    this.verificandoStatus = true;
    this.updateProgress();

    this.apiService.verificarStatusCarteirinha(this.agenteId).pipe(take(1)).subscribe({
      next: (response) => {
        this.podeGerar = response.podeGerar;
        this.verificandoStatus = false;
        
        if (!this.podeGerar) {
          this.mostrarErro(response.mensagem || 'Agente não está apto para geração de carteirinha');
        }
        this.updateProgress();
      },
      error: (error) => {
        this.verificandoStatus = false;
        this.mostrarErro('Erro ao verificar status do agente');
        console.error('Erro ao verificar status:', error);
        this.updateProgress();
      }
    });
  }

  /**
   * Gera preview da carteirinha em nova aba
   */
  gerarPreview(): void {
    if (!this.podeGerar) return;
    this.previewOpen = true;
  }

  /**
   * Gera e baixa a carteirinha em PDF
   */
  gerarCarteirinha(): void {
    if (!this.podeGerar) return;

    this.loading = true;
    this.error = '';
    this.updateProgress();

    this.apiService.download(`/carteirinha/gerar/${this.agenteId}`).pipe(take(1)).subscribe({
      next: (blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `carteirinha_${this.agente?.nomeCompleto?.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

        this.mostrarSucesso('Carteirinha gerada com sucesso!');
        this.loading = false;
        this.updateProgress();
      },
      error: (err) => {
        this.mostrarErro('Erro ao gerar carteirinha');
        console.error('Erro na geração:', err);
        this.loading = false;
        this.updateProgress();
      }
    });
  }

  /**
   * Mostra mensagem de erro
   */
  mostrarErro(mensagem: string): void {
    this.error = mensagem;
  }

  /**
   * Mostra mensagem de sucesso
   */
  mostrarSucesso(mensagem: string): void {
    // Para manter compatível, por enquanto usa alert.
    // Opcional: integrar com componente de notification shared.
    alert(mensagem);
  }

  voltar(): void {
    this.router.navigate(['/agentes', this.agenteId]);
  }

  editarAgente(): void {
    this.router.navigate(['/agentes', this.agenteId, 'editar']);
  }

  formatarCPF(cpf: string): string {
    if (!cpf || cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarData(data: string): string {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
  }

  getStatusFormatado(): string {
    if (!this.agente?.status) return '';
    
    const statusMap: Record<string, string> = {
      'ATIVO': 'Ativo',
      'INATIVO': 'Inativo',
      'EM_ANALISE': 'Em Análise',
      'REVOGADO': 'Revogado'
    };
    
    return statusMap[this.agente.status] || this.agente.status;
  }

  getStatusVariant(): 'success' | 'warning' | 'danger' | 'neutral' {
    if (!this.agente?.status) return 'neutral';
    const s = String(this.agente.status).toUpperCase();
    if (s === 'ATIVO') return 'success';
    if (s === 'EM_ANALISE') return 'warning';
    if (s === 'REVOGADO' || s === 'INATIVO') return 'danger';
    return 'neutral';
  }

  private updateProgress(): void {
    const dadosLoaded = !!this.agente && !this.loading;
    const verificando = this.verificandoStatus;
    const apto = this.podeGerar;
    const imprimindo = this.loading && !!this.agenteId;

    this.progressItems = [
      { label: 'Dados', state: dadosLoaded ? 'complete' : 'current' },
      { label: 'Verificação', state: verificando ? 'current' : (dadosLoaded ? (apto ? 'complete' : 'error') : 'disabled') },
      { label: 'Impressão', state: apto ? (imprimindo ? 'current' : 'incomplete') : 'disabled' }
    ];

    if (!dadosLoaded) { this.progressCurrent = 0; return; }
    if (verificando) { this.progressCurrent = 1; return; }
    if (apto) { this.progressCurrent = imprimindo ? 2 : 1; return; }
    this.progressCurrent = 1;
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs/operators';
import { NgIf } from '@angular/common';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CarteirinhaPreviewComponent } from '../carteirinha-preview/carteirinha-preview.component';

@Component({
  selector: 'app-impressao-carteirinha',
  standalone: true,
  imports: [NgIf, ModalComponent, CarteirinhaPreviewComponent],
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

    this.apiService.verificarStatusCarteirinha(this.agenteId).pipe(take(1)).subscribe({
      next: (response) => {
        this.podeGerar = response.podeGerar;
        this.verificandoStatus = false;
        
        if (!this.podeGerar) {
          this.mostrarErro(response.mensagem || 'Agente não está apto para geração de carteirinha');
        }
      },
      error: (error) => {
        this.verificandoStatus = false;
        this.mostrarErro('Erro ao verificar status do agente');
        console.error('Erro ao verificar status:', error);
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
      },
      error: (err) => {
        this.mostrarErro('Erro ao gerar carteirinha');
        console.error('Erro na geração:', err);
        this.loading = false;
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
    alert(mensagem); // TODO: substituir por toast
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

  getStatusClass(): string {
    if (!this.agente?.status) return '';
    
    const classMap: Record<string, string> = {
      'ATIVO': 'badge-success',
      'INATIVO': 'badge-secondary',
      'EM_ANALISE': 'badge-warning',
      'REVOGADO': 'badge-danger'
    };
    
    return classMap[this.agente.status] || 'badge-secondary';
  }
}

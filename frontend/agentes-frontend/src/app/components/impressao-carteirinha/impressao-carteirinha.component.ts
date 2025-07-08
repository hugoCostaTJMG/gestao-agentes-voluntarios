import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-impressao-carteirinha',
  templateUrl: './impressao-carteirinha.component.html',
  styleUrls: ['./impressao-carteirinha.component.scss']
})
export class ImpressaoCarteirinhaComponent implements OnInit {
  agenteId: string = '';
  agente: any = null;
  loading: boolean = false;
  error: string = '';
  podeGerar: boolean = false;
  verificandoStatus: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Verificar permissão de acesso
    if (!this.temPermissaoImpressao()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Obter ID do agente da rota
    this.agenteId = this.route.snapshot.paramMap.get('id') || '';
    
    if (this.agenteId) {
      this.carregarDadosAgente();
      this.verificarStatusCarteirinha();
    } else {
      this.error = 'ID do agente não informado';
    }
  }

  /**
   * Verifica se o usuário tem permissão para impressão
   */
  temPermissaoImpressao(): boolean {
    const perfil = this.authService.getUserProfile();
    return ['CORREGEDORIA', 'COFIJ', 'ADMINISTRADOR'].includes(perfil);
  }

  /**
   * Carrega os dados do agente
   */
  carregarDadosAgente(): void {
    this.loading = true;
    this.error = '';

    this.apiService.get(`/agentes/${this.agenteId}`).subscribe({
      next: (response) => {
        this.agente = response;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erro ao carregar dados do agente';
        this.loading = false;
        console.error('Erro ao carregar agente:', error);
      }
    });
  }

  /**
   * Verifica se o agente pode ter carteirinha gerada
   */
  verificarStatusCarteirinha(): void {
    this.verificandoStatus = true;

    this.apiService.get(`/carteirinha/verificar/${this.agenteId}`).subscribe({
      next: (response) => {
        this.podeGerar = response.podeGerar;
        this.verificandoStatus = false;
        
        if (!this.podeGerar) {
          this.error = response.mensagem || 'Agente não está apto para geração de carteirinha';
        }
      },
      error: (error) => {
        this.verificandoStatus = false;
        this.error = 'Erro ao verificar status do agente';
        console.error('Erro ao verificar status:', error);
      }
    });
  }

  /**
   * Gera preview da carteirinha
   */
  gerarPreview(): void {
    if (!this.podeGerar) {
      return;
    }

    this.loading = true;
    this.error = '';

    // Abrir preview em nova aba
    const url = `${this.apiService.getBaseUrl()}/carteirinha/preview/${this.agenteId}`;
    const headers = this.apiService.getAuthHeaders();
    
    // Fazer requisição com headers de autenticação
    fetch(url, {
      method: 'GET',
      headers: headers
    })
    .then(response => {
      if (response.ok) {
        return response.blob();
      }
      throw new Error('Erro ao gerar preview');
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      this.loading = false;
    })
    .catch(error => {
      this.error = 'Erro ao gerar preview da carteirinha';
      this.loading = false;
      console.error('Erro no preview:', error);
    });
  }

  /**
   * Gera e baixa a carteirinha em PDF
   */
  gerarCarteirinha(): void {
    if (!this.podeGerar) {
      return;
    }

    this.loading = true;
    this.error = '';

    const url = `${this.apiService.getBaseUrl()}/carteirinha/gerar/${this.agenteId}`;
    const headers = this.apiService.getAuthHeaders();

    fetch(url, {
      method: 'GET',
      headers: headers
    })
    .then(response => {
      if (response.ok) {
        return response.blob();
      }
      throw new Error('Erro ao gerar carteirinha');
    })
    .then(blob => {
      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `carteirinha_${this.agente?.nomeCompleto?.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      this.loading = false;
      
      // Mostrar mensagem de sucesso
      this.mostrarSucesso('Carteirinha gerada com sucesso!');
    })
    .catch(error => {
      this.error = 'Erro ao gerar carteirinha';
      this.loading = false;
      console.error('Erro na geração:', error);
    });
  }

  /**
   * Mostra mensagem de sucesso
   */
  mostrarSucesso(mensagem: string): void {
    // Implementar toast ou alert de sucesso
    alert(mensagem); // Temporário - substituir por toast
  }

  /**
   * Volta para a tela anterior
   */
  voltar(): void {
    this.router.navigate(['/agentes', this.agenteId]);
  }

  /**
   * Navega para edição do agente
   */
  editarAgente(): void {
    this.router.navigate(['/agentes', this.agenteId, 'editar']);
  }

  /**
   * Formata CPF para exibição
   */
  formatarCPF(cpf: string): string {
    if (!cpf || cpf.length !== 11) {
      return cpf;
    }
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata data para exibição
   */
  formatarData(data: string): string {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
  }

  /**
   * Obtém o status formatado do agente
   */
  getStatusFormatado(): string {
    if (!this.agente?.status) return '';
    
    const statusMap: { [key: string]: string } = {
      'ATIVO': 'Ativo',
      'INATIVO': 'Inativo',
      'EM_ANALISE': 'Em Análise',
      'REVOGADO': 'Revogado'
    };
    
    return statusMap[this.agente.status] || this.agente.status;
  }

  /**
   * Obtém a classe CSS para o status
   */
  getStatusClass(): string {
    if (!this.agente?.status) return '';
    
    const classMap: { [key: string]: string } = {
      'ATIVO': 'badge-success',
      'INATIVO': 'badge-secondary',
      'EM_ANALISE': 'badge-warning',
      'REVOGADO': 'badge-danger'
    };
    
    return classMap[this.agente.status] || 'badge-secondary';
  }
}


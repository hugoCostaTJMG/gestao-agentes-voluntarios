import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AgenteVoluntario } from '../../models/interfaces';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ModalComponent, ModalAction } from '../../shared/components/modal/modal.component';
import { CarteirinhaPreviewComponent } from '../carteirinha-preview/carteirinha-preview.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-painel-agentes',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent, ModalComponent, CarteirinhaPreviewComponent],
  templateUrl: './painel-agentes.component.html',
  styleUrls: ['./painel-agentes.component.scss']
})
export class PainelAgentesComponent implements OnInit {
  agentes: AgenteVoluntario[] = [];
  agentesFiltrados: AgenteVoluntario[] = [];
  comarcasUnicas: string[] = [];
  loading = false;

  // Preview carteirinha
  previewOpen = false;
  previewBusy = false;
  previewActions: ModalAction[] = [
    { id: 'fechar', label: 'Fechar', kind: 'secondary', align: 'left' },
    { id: 'gerar', label: 'Gerar PDF', kind: 'primary' }
  ];
  agenteSelecionado: AgenteVoluntario | null = null;

  filtros = {
    nome: '',
    status: '',
    comarca: '',
    validade: ''
  };

  paginaAtual = 1;
  itensPorPagina = 20;
  totalPaginas = 1;

  alertMessage = '';
  alertType: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  showAlert = false;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.carregarAgentes();
  }

  carregarAgentes(): void {
    this.loading = true;
    this.apiService.listarAgentes().subscribe({
      next: (response) => {
        this.agentes = response.content;
        this.agentesFiltrados = [...response.content];
        this.extrairComarcasUnicas();
        this.calcularPaginacao();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar agentes:', error);
        this.loading = false;
      }
    });
  }

  extrairComarcasUnicas(): void {
    const comarcasSet = new Set<string>();
    this.agentes.forEach(agente => {
      agente.comarcas?.forEach(comarca => comarcasSet.add(comarca.nomeComarca));
    });
    this.comarcasUnicas = Array.from(comarcasSet).sort();
  }

  aplicarFiltros(): void {
    const norm = (s: string = '') => s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    this.agentesFiltrados = this.agentes.filter(agente => {
      const nomeAgente = agente.nomeCompleto || (agente as any).nome || '';
      const nomeMatch = !this.filtros.nome || norm(nomeAgente).includes(norm(this.filtros.nome));

      const statusMatch = !this.filtros.status || this.normalizarStatus(agente.status) === this.filtros.status;

      const comarcaMatch = !this.filtros.comarca || (
        agente.comarcas && agente.comarcas.some(c => norm(c.nomeComarca) === norm(this.filtros.comarca))
      );

      const validadeMatch = !this.filtros.validade || this.verificarValidade(agente);

      return nomeMatch && statusMatch && comarcaMatch && validadeMatch;
    });

    this.paginaAtual = 1;
    this.calcularPaginacao();
  }

  verificarValidade(_agente: AgenteVoluntario): boolean {
    return true;
  }

  limparFiltros(): void {
    this.filtros = {
      nome: '',
      status: '',
      comarca: '',
      validade: ''
    };
    this.aplicarFiltros();
  }

  calcularPaginacao(): void {
    this.totalPaginas = Math.ceil(this.agentesFiltrados.length / this.itensPorPagina);
  }

  getPaginas(): number[] {
    const paginas: number[] = [];
    const inicio = Math.max(1, this.paginaAtual - 2);
    const fim = Math.min(this.totalPaginas, this.paginaAtual + 2);

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }
    return paginas;
  }

  irParaPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
    }
  }

  private normalizarStatus(status: string | undefined): string {
    const s = (status || '').toString();
    // Remove acentos, remove preposições comuns e normaliza caixa/espaços
    const semAcento = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    const semPreposicoes = semAcento.replace(/\b(DE|DA|DO|DAS|DOS)\b/g, ' ');
    return semPreposicoes.replace(/\s+/g, '_').trim();
  }

  isAgenteAtivo(agente: AgenteVoluntario): boolean {
    return this.normalizarStatus(agente.status) === 'ATIVO';
  }

  getStatusClass(status: string): string {
    switch (this.normalizarStatus(status)) {
      case 'ATIVO': return 'bg-success';
      case 'INATIVO': return 'bg-secondary';
      case 'EM_ANALISE': return 'bg-warning';
      case 'QUADRO_RESERVA': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (this.normalizarStatus(status)) {
      case 'ATIVO': return 'Ativo';
      case 'INATIVO': return 'Inativo';
      case 'EM_ANALISE': return 'Em Análise';
      case 'QUADRO_RESERVA': return 'Quadro de Reserva';
      default: return status;
    }
  }

  getComarcasTexto(agente: AgenteVoluntario): string {
    if (!agente.comarcas || agente.comarcas.length === 0) {
      return '-';
    }
    if (agente.comarcas.length === 1) {
      return agente.comarcas[0].nomeComarca;
    }
    return `${agente.comarcas[0].nomeComarca} (+${agente.comarcas.length - 1})`;
  }

  getValidadeTexto(_agente: AgenteVoluntario): string {
    return 'Vigente';
  }

  getValidadeClass(_agente: AgenteVoluntario): string {
    return 'text-success';
  }

  formatarCPF(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarData(data: string): string {
    if (!data) return '-';
    const d = new Date(data);
    if (isNaN(d.getTime())) {
      // tenta formato yyyy-mm-dd
      const m = String(data).match(/^(\d{4})-(\d{2})-(\d{2})/);
      if (m) {
        return `${m[3]}/${m[2]}/${m[1]}`;
      }
      return String(data);
    }
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  emitirCredencial(id: number): void {
    // Verifica se pode gerar a carteirinha e, se sim, baixa o PDF
    this.apiService.verificarStatusCarteirinha(id).subscribe({
      next: (ver) => {
        if (!ver?.podeGerar) {
          this.alertMessage = ver?.mensagem || 'Não é possível gerar a carteirinha para este agente.';
          this.alertType = 'danger';
          this.showAlert = true;
          return;
        }
        this.apiService.download(`/carteirinha/gerar/${id}`).subscribe({
          next: (blob) => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `carteirinha_${id}.pdf`;
            a.click();
            URL.revokeObjectURL(a.href);

            this.alertMessage = `Carteirinha gerada para o agente ${id}.`;
            this.alertType = 'primary';
            this.showAlert = true;
          },
          error: (error) => {
            console.error('Erro ao gerar carteirinha:', error);
            this.alertMessage = 'Não foi possível gerar a carteirinha.';
            this.alertType = 'danger';
            this.showAlert = true;
          }
        });
      },
      error: (error) => {
        console.error('Erro ao verificar status da carteirinha:', error);
        this.alertMessage = 'Falha ao verificar se é possível gerar a carteirinha.';
        this.alertType = 'danger';
        this.showAlert = true;
      }
    });
  }

  visualizarAgente(id: number): void {
    this.previewBusy = true;
    this.previewOpen = true;
    this.agenteSelecionado = null;
    this.apiService.buscarAgentePorId(id).subscribe({
      next: (ag) => {
        this.agenteSelecionado = ag;
        this.previewBusy = false;
      },
      error: (error) => {
        console.error('Erro ao carregar agente para preview:', error);
        this.previewBusy = false;
        this.previewOpen = false;
        this.alertMessage = 'Não foi possível abrir a prévia da carteirinha.';
        this.alertType = 'danger';
        this.showAlert = true;
      }
    });
  }

  onPreviewAction(actionId: string): void {
    if (actionId === 'fechar') {
      this.previewOpen = false;
      return;
    }
    if (actionId === 'gerar') {
      const id = this.agenteSelecionado?.id;
      if (!id) return;
      // Opcional: verificar regra antes de gerar
      this.previewBusy = true;
      this.apiService.verificarStatusCarteirinha(id).subscribe({
        next: (ver) => {
          if (!ver?.podeGerar) {
            this.previewBusy = false;
            this.alertMessage = ver?.mensagem || 'Não é possível gerar a carteirinha para este agente.';
            this.alertType = 'danger';
            this.showAlert = true;
            return;
          }
          this.apiService.download(`/carteirinha/gerar/${id}`).subscribe({
            next: (blob) => {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `carteirinha_${(this.agenteSelecionado?.nomeCompleto || 'agente').replace(/\s+/g, '_')}.pdf`;
              a.click();
              window.URL.revokeObjectURL(url);
              this.previewBusy = false;
            },
            error: (e) => {
              console.error('Erro ao gerar carteirinha:', e);
              this.previewBusy = false;
              this.alertMessage = 'Não foi possível gerar a carteirinha.';
              this.alertType = 'danger';
              this.showAlert = true;
            }
          });
        },
        error: () => {
          this.previewBusy = false;
          this.alertMessage = 'Falha ao verificar se é possível gerar a carteirinha.';
          this.alertType = 'danger';
          this.showAlert = true;
        }
      });
    }
  }


  exportarCSV(): void {
    const headers = ['Nome', 'CPF', 'Status', 'Comarca', 'Data Cadastro'];
    const csvContent = [
      headers.join(','),
      ...this.agentesFiltrados.map(agente => [
        `"${agente.nomeCompleto}"`,
        `"${this.formatarCPF(agente.cpf)}"`,
        `"${this.getStatusLabel(agente.status)}"`,
        `"${this.getComarcasTexto(agente)}"`,
        `"${this.formatarData(agente.dataCadastro)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agentes_voluntarios_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }

  exportarPDF(): void {
    console.log('Exportar PDF');
  }

  imprimir(): void {
    window.print();
  }

  editarAgente(id: number): void {
    this.router.navigate([`/agentes/${id}/editar`]);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AgenteVoluntario } from '../../models/interfaces';
import { AlertComponent } from '../../shared/components/alert/alert.component';

@Component({
  selector: 'app-painel-agentes',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertComponent],
  templateUrl: './painel-agentes.component.html',
  styleUrls: ['./painel-agentes.component.scss']
})
export class PainelAgentesComponent implements OnInit {
  agentes: AgenteVoluntario[] = [];
  agentesFiltrados: AgenteVoluntario[] = [];
  comarcasUnicas: string[] = [];
  loading = false;

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

  constructor(private apiService: ApiService) {}

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
    this.agentesFiltrados = this.agentes.filter(agente => {
      const nomeMatch = !this.filtros.nome ||
        agente.nomeCompleto.toLowerCase().includes(this.filtros.nome.toLowerCase());

      const statusMatch = !this.filtros.status || agente.status === this.filtros.status;

      const comarcaMatch = !this.filtros.comarca ||
        (agente.comarcas && agente.comarcas.some(c => c.nomeComarca === this.filtros.comarca));

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

  getStatusClass(status: string): string {
    switch (status) {
      case 'ATIVO': return 'bg-success';
      case 'INATIVO': return 'bg-secondary';
      case 'EM_ANALISE': return 'bg-warning';
      case 'REVOGADO': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ATIVO': return 'Ativo';
      case 'INATIVO': return 'Inativo';
      case 'EM_ANALISE': return 'Em Análise';
      case 'REVOGADO': return 'Revogado';
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
    return new Date(data).toLocaleDateString('pt-BR');
  }

  emitirCredencial(id: number): void {
    this.alertMessage = `Credencial emitida para o agente ${id}`;
    this.alertType = 'primary';
    this.showAlert = true;
  }

  visualizarAgente(id: number): void {
    this.alertMessage = `Visualizando agente ${id}`;
    this.alertType = 'secondary';
    this.showAlert = true;
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
}

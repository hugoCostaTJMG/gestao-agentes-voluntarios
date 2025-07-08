import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AgenteVoluntario } from '../../models/interfaces';

@Component({
  selector: 'app-painel-agentes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <i class="fas fa-users me-2"></i>
                Painel de Agentes Voluntários
              </h5>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" (click)="exportarCSV()">
                  <i class="fas fa-file-csv me-1"></i>
                  CSV
                </button>
                <button class="btn btn-outline-danger btn-sm" (click)="exportarPDF()">
                  <i class="fas fa-file-pdf me-1"></i>
                  PDF
                </button>
                <button class="btn btn-outline-secondary btn-sm" (click)="imprimir()">
                  <i class="fas fa-print me-1"></i>
                  Imprimir
                </button>
              </div>
            </div>
            
            <!-- Filtros -->
            <div class="card-body border-bottom">
              <div class="row g-3">
                <div class="col-md-3">
                  <label class="form-label">Nome</label>
                  <input type="text" class="form-control form-control-sm" 
                         [(ngModel)]="filtros.nome" (input)="aplicarFiltros()"
                         placeholder="Filtrar por nome">
                </div>
                <div class="col-md-2">
                  <label class="form-label">Status</label>
                  <select class="form-select form-select-sm" 
                          [(ngModel)]="filtros.status" (change)="aplicarFiltros()">
                    <option value="">Todos</option>
                    <option value="ATIVO">Ativo</option>
                    <option value="INATIVO">Inativo</option>
                    <option value="EM_ANALISE">Em Análise</option>
                    <option value="REVOGADO">Revogado</option>
                  </select>
                </div>
                <div class="col-md-3">
                  <label class="form-label">Comarca</label>
                  <select class="form-select form-select-sm" 
                          [(ngModel)]="filtros.comarca" (change)="aplicarFiltros()">
                    <option value="">Todas</option>
                    <option *ngFor="let comarca of comarcasUnicas" [value]="comarca">
                      {{ comarca }}
                    </option>
                  </select>
                </div>
                <div class="col-md-2">
                  <label class="form-label">Validade</label>
                  <select class="form-select form-select-sm" 
                          [(ngModel)]="filtros.validade" (change)="aplicarFiltros()">
                    <option value="">Todas</option>
                    <option value="vigente">Vigente</option>
                    <option value="vencida">Vencida</option>
                    <option value="vence_30_dias">Vence em 30 dias</option>
                  </select>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button class="btn btn-outline-secondary btn-sm w-100" (click)="limparFiltros()">
                    <i class="fas fa-eraser me-1"></i>
                    Limpar
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabela -->
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0" id="tabelaAgentes">
                  <thead class="table-light">
                    <tr>
                      <th>Nome</th>
                      <th>CPF</th>
                      <th>Status</th>
                      <th>Comarca</th>
                      <th>Validade</th>
                      <th>Data Cadastro</th>
                      <th class="no-print">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let agente of agentesFiltrados; let i = index">
                      <td>{{ agente.nomeCompleto }}</td>
                      <td>{{ formatarCPF(agente.cpf) }}</td>
                      <td>
                        <span class="badge" [ngClass]="getStatusClass(agente.status)">
                          {{ getStatusLabel(agente.status) }}
                        </span>
                      </td>
                      <td>{{ getComarcasTexto(agente) }}</td>
                      <td>
                        <span [ngClass]="getValidadeClass(agente)">
                          {{ getValidadeTexto(agente) }}
                        </span>
                      </td>
                      <td>{{ formatarData(agente.dataCadastro) }}</td>
                      <td class="no-print">
                        <div class="btn-group btn-group-sm">
                          <button class="btn btn-outline-primary" 
                                  (click)="visualizarAgente(agente.id)"
                                  title="Visualizar">
                            <i class="fas fa-eye"></i>
                          </button>
                          <button class="btn btn-outline-success" 
                                  (click)="emitirCredencial(agente.id)"
                                  [disabled]="agente.status !== 'ATIVO'"
                                  title="Emitir Credencial">
                            <i class="fas fa-id-card"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr *ngIf="agentesFiltrados.length === 0">
                      <td colspan="7" class="text-center py-4 text-muted">
                        <i class="fas fa-search me-2"></i>
                        Nenhum agente encontrado com os filtros aplicados
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Paginação -->
            <div class="card-footer d-flex justify-content-between align-items-center">
              <div class="text-muted">
                Mostrando {{ agentesFiltrados.length }} de {{ agentes.length }} agentes
              </div>
              <nav *ngIf="totalPaginas > 1">
                <ul class="pagination pagination-sm mb-0">
                  <li class="page-item" [class.disabled]="paginaAtual === 1">
                    <button class="page-link" (click)="irParaPagina(paginaAtual - 1)">
                      <i class="fas fa-chevron-left"></i>
                    </button>
                  </li>
                  <li class="page-item" *ngFor="let p of getPaginas()" 
                      [class.active]="p === paginaAtual">
                    <button class="page-link" (click)="irParaPagina(p)">{{ p }}</button>
                  </li>
                  <li class="page-item" [class.disabled]="paginaAtual === totalPaginas">
                    <button class="page-link" (click)="irParaPagina(paginaAtual + 1)">
                      <i class="fas fa-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      font-size: 0.75rem;
    }
    .table th {
      border-top: none;
      font-weight: 600;
      font-size: 0.875rem;
    }
    .table td {
      font-size: 0.875rem;
      vertical-align: middle;
    }
    .btn-group-sm .btn {
      padding: 0.25rem 0.5rem;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      .card {
        border: none !important;
        box-shadow: none !important;
      }
      .card-header, .card-footer {
        display: none !important;
      }
    }
    @media (max-width: 768px) {
      .table-responsive {
        font-size: 0.8rem;
      }
      .btn-group {
        flex-direction: column;
      }
    }
  `]
})
export class PainelAgentesComponent implements OnInit {
  agentes: AgenteVoluntario[] = [];
  agentesFiltrados: AgenteVoluntario[] = [];
  comarcasUnicas: string[] = [];
  loading = false;
  
  // Filtros
  filtros = {
    nome: '',
    status: '',
    comarca: '',
    validade: ''
  };

  // Paginação
  paginaAtual = 1;
  itensPorPagina = 20;
  totalPaginas = 1;

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
      if (agente.comarcas) {
        agente.comarcas.forEach(comarca => {
          comarcasSet.add(comarca.nomeComarca);
        });
      }
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

  verificarValidade(agente: AgenteVoluntario): boolean {
    // Implementar lógica de validade baseada nas credenciais
    // Por enquanto, retorna true
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
    const paginas = [];
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

  getValidadeTexto(agente: AgenteVoluntario): string {
    // Implementar lógica de validade
    return 'Vigente';
  }

  getValidadeClass(agente: AgenteVoluntario): string {
    // Implementar classes baseadas na validade
    return 'text-success';
  }

  formatarCPF(cpf: string): string {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }

  visualizarAgente(id: string): void {
    // Implementar navegação para detalhes do agente
    console.log('Visualizar agente:', id);
  }

  emitirCredencial(id: string): void {
    // Implementar emissão de credencial
    console.log('Emitir credencial para agente:', id);
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
    // Implementar exportação PDF usando jsPDF
    console.log('Exportar PDF');
  }

  imprimir(): void {
    window.print();
  }
}


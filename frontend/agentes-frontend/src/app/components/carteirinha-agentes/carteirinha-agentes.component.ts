import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AgenteVoluntario, PaginatedResponse } from '../../models/interfaces';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { SearchComponent } from '../../shared/components/search/search.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CarteirinhaPreviewComponent } from '../carteirinha-preview/carteirinha-preview.component';

type AgenteCard = AgenteVoluntario & { podeGerar?: boolean; verificando?: boolean; mensagem?: string; loadingPreview?: boolean; loadingGerar?: boolean; fotoUrl?: string; _objectUrl?: string };

@Component({
  selector: 'app-carteirinha-agentes',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, ButtonComponent, AlertComponent, BadgeComponent, SearchComponent, ModalComponent, CarteirinhaPreviewComponent],
  templateUrl: './carteirinha-agentes.component.html',
  styleUrls: ['./carteirinha-agentes.component.scss']
})
export class CarteirinhaAgentesComponent implements OnInit, OnDestroy {
  agentes: AgenteCard[] = [];
  loading = false;
  erro = '';
  previewOpen = false;
  previewAgente?: AgenteCard;
  filtroTermo = '';
  agentesAtivosFiltrados: AgenteCard[] = [];
  agentesDemaisFiltrados: AgenteCard[] = [];
  filtroGrupo: 'todos' | 'ativos' | 'demais' | 'selecionados' = 'todos';
  private selecionados = new Set<number>();
  loadingLote = false;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.carregarAgentes();
  }

  ngOnDestroy(): void {
    // libera URLs de objeto criadas para fotos
    this.agentes.forEach(a => {
      if (a._objectUrl) {
        try { URL.revokeObjectURL(a._objectUrl); } catch {}
        a._objectUrl = undefined;
      }
    });
  }

  carregarAgentes(): void {
    this.loading = true;
    this.erro = '';
    this.api.listarAgentes(0, 50).subscribe({
      next: (resp: PaginatedResponse<AgenteVoluntario>) => {
        this.agentes = (resp.content || []).map(a => ({ ...a, verificando: true }));
        this.loading = false;
        // Verifica status de geração por agente
        this.agentes.forEach(a => { this.verificar(a); this.carregarFoto(a); });
        this.aplicarFiltro();
      },
      error: () => {
        this.loading = false;
        this.erro = 'Não foi possível carregar os agentes.';
      }
    });
  }

  verificar(agente: AgenteCard): void {
    agente.verificando = true;
    this.api.verificarStatusCarteirinha(agente.id!).subscribe({
      next: (r) => {
        agente.podeGerar = !!r.podeGerar;
        agente.mensagem = r.mensagem;
        agente.verificando = false;
      },
      error: () => {
        agente.podeGerar = false;
        agente.mensagem = 'Falha ao verificar';
        agente.verificando = false;
      }
    });
  }

  preview(agente: AgenteCard): void {
    if (!agente.id) return;
    this.previewAgente = agente;
    this.previewOpen = true;
  }

  aplicarFiltro(): void {
    const norm = (s: string = '') => s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    const termo = this.filtroTermo.trim();
    const termoNorm = norm(termo);
    const termoDigits = termo.replace(/\D/g, '');

    const statusKey = (st?: string) => (st || '')
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\b(DE|DA|DO|DAS|DOS)\b/g, ' ').replace(/\s+/g, '_');

    const match = (ag: AgenteCard) => {
      if (!termo) return true;
      const nome = ag.nomeCompleto || (ag as any).nome || '';
      const cpf = String(ag.cpf || '');
      return norm(nome).includes(termoNorm) || cpf.replace(/\D/g, '').includes(termoDigits);
    };

    const ativos: AgenteCard[] = [];
    const demais: AgenteCard[] = [];

    for (const ag of this.agentes) {
      if (!match(ag)) continue;
      if (statusKey(ag.status) === 'ATIVO') ativos.push(ag); else demais.push(ag);
    }

    this.agentesAtivosFiltrados = ativos;
    this.agentesDemaisFiltrados = demais;
  }

  isSelecionado(ag: AgenteCard): boolean {
    return !!ag.id && this.selecionados.has(ag.id);
  }

  toggleSelecionado(ag: AgenteCard): void {
    if (!ag.id) return;
    if (this.selecionados.has(ag.id)) this.selecionados.delete(ag.id); else this.selecionados.add(ag.id);
  }

  get selecionadosCount(): number { return this.selecionados.size; }

  limparSelecao(): void { this.selecionados.clear(); }

  selecionarVisiveis(): void {
    const visiveis = this.getVisiveis();
    visiveis.forEach(a => { if (a.id) this.selecionados.add(a.id); });
  }

  private getVisiveis(): AgenteCard[] {
    switch (this.filtroGrupo) {
      case 'ativos':
        return this.agentesAtivosFiltrados;
      case 'demais':
        return this.agentesDemaisFiltrados;
      case 'selecionados':
        return [...this.agentesAtivosFiltrados, ...this.agentesDemaisFiltrados]
          .filter(a => a.id && this.selecionados.has(a.id));
      default:
        return [...this.agentesAtivosFiltrados, ...this.agentesDemaisFiltrados];
    }
  }

  gerarSelecionadas(): void {
    if (!this.selecionados.size) return;
    const ids = Array.from(this.selecionados.values());
    this.loadingLote = true;
    this.api.gerarCarteirinhasLote(ids).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carteirinhas_lote_${new Date().toISOString().slice(0,10)}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.loadingLote = false;
      },
      error: () => {
        this.loadingLote = false;
        alert('Não foi possível gerar o PDF em lote.');
      }
    });
  }

  private carregarFoto(ag: AgenteCard): void {
    if (!ag.id) return;
    this.api.getFotoAgente(ag.id).subscribe({
      next: (blob) => {
        if (blob && blob.size > 0) {
          try {
            if (ag._objectUrl) { URL.revokeObjectURL(ag._objectUrl); }
          } catch {}
          const url = URL.createObjectURL(blob);
          ag._objectUrl = url;
          ag.fotoUrl = url;
        }
      },
      error: () => {
        // sem foto
      }
    });
  }

  gerar(agente: AgenteCard): void {
    if (!agente.id || !agente.podeGerar) return;
    agente.loadingGerar = true;
    this.api.download(`/carteirinha/gerar/${agente.id}`).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `carteirinha_${(agente.nomeCompleto || 'agente').replace(/\s+/g, '_')}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
        agente.loadingGerar = false;
      },
      error: () => {
        agente.loadingGerar = false;
        alert('Não foi possível gerar a carteirinha.');
      }
    });
  }

  voltar(): void { this.router.navigate(['/agentes']); }

  cpfFormat(cpf?: string): string {
    if (!cpf) return '';
    const d = cpf.replace(/\D/g, '');
    return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf;
  }

  statusBadge(ag: AgenteCard): 'success' | 'warning' | 'secondary' | 'danger' {
    const s = (ag.status || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();
    switch (s) {
      case 'ATIVO': return 'success';
      case 'EM_ANALISE': return 'warning';
      case 'INATIVO': return 'secondary';
      default: return 'secondary';
    }
  }

  credencialCodigo(ag: AgenteCard): string {
    const id = ag.id || 0;
    return `AGV-${String(id).padStart(4, '0')}`;
  }
}

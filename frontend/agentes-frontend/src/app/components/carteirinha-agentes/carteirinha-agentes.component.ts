import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AgenteVoluntario, PaginatedResponse } from '../../models/interfaces';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';

type AgenteCard = AgenteVoluntario & { podeGerar?: boolean; verificando?: boolean; mensagem?: string; loadingPreview?: boolean; loadingGerar?: boolean };

@Component({
  selector: 'app-carteirinha-agentes',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, ButtonComponent],
  templateUrl: './carteirinha-agentes.component.html',
  styleUrls: ['./carteirinha-agentes.component.scss']
})
export class CarteirinhaAgentesComponent implements OnInit {
  agentes: AgenteCard[] = [];
  loading = false;
  erro = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.carregarAgentes();
  }

  carregarAgentes(): void {
    this.loading = true;
    this.erro = '';
    this.api.listarAgentes(0, 50).subscribe({
      next: (resp: PaginatedResponse<AgenteVoluntario>) => {
        this.agentes = (resp.content || []).map(a => ({ ...a, verificando: true }));
        this.loading = false;
        // Verifica status de geração por agente
        this.agentes.forEach(a => this.verificar(a));
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
    agente.loadingPreview = true;
    this.api.download(`/carteirinha/preview/${agente.id}`).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        agente.loadingPreview = false;
      },
      error: () => {
        agente.loadingPreview = false;
        alert('Não foi possível gerar o preview.');
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


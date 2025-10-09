import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { AgenteVoluntarioResponseDTO, Usuario } from '../../models/interfaces';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  loading = true;
  erro = '';
  erroTipo: 'warning' | 'danger' | 'info' = 'warning';

  usuario?: Usuario | null;
  agente?: AgenteVoluntarioResponseDTO;

  constructor(
    private readonly api: ApiService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    this.usuario = this.auth.getCurrentUser();
    if (!this.usuario) {
      this.loading = false;
      this.erro = 'Nenhum usuário autenticado foi identificado.';
      this.erroTipo = 'danger';
      return;
    }
    // Se for AGENTE, carrega dados completos do banco (buscarAgenteMe)
    // Caso contrário, usa apenas os dados do token (Keycloak) sem chamar o endpoint de agente
    if ((this.usuario.perfil || '').toUpperCase() === 'AGENTE') {
      this.carregarPerfil();
    } else {
      this.loading = false;
      this.agente = undefined;
      this.erro = '';
    }
  }

  get nome(): string {
    return this.agente?.nomeCompleto || this.usuario?.nome || '—';
  }

  get email(): string {
    return this.usuario?.email || this.agente?.email || '—';
  }

  get perfil(): string {
    return this.usuario?.perfil || '—';
  }

  get cpf(): string {
    // Se houver agente, usa CPF do banco; senão, tenta do token (/auth/me)
    const cpf = this.agente?.cpf || this.usuario?.cpf;
    return this.formatarCPF(cpf);
  }

  get telefone(): string {
    // Se houver agente, usa telefone do banco; senão, tenta do token (/auth/me)
    const tel = this.agente?.telefone || this.usuario?.telefone;
    return this.formatarTelefone(tel);
  }

  get disponibilidade(): string {
    return this.agente?.disponibilidade || '—';
  }

  get status(): string {
    return this.agente?.status || '—';
  }

  get dataCadastro(): string {
    const raw = (this.agente?.dataCadastro || '').toString().trim();
    if (!raw) return '—';

    // Se já vier formatado em pt-BR (ex.: "15/09/2025 18:00"), apenas retorna
    if (/^\d{2}\/\d{2}\/\d{4}(\s+\d{2}:\d{2}(:\d{2})?)?$/.test(raw)) {
      return raw;
    }

    // Se vier em ISO (ex.: 2025-09-15T18:00:00Z), formata para pt-BR
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      try {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
          }).format(d);
        }
      } catch {}
    }

    // Tentativa final: tentar parse padrão do JS; se falhar, retorna como veio
    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit', month: '2-digit', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }).format(d);
      }
    } catch {}

    return raw;
  }

  get comarcas(): string {
    const lista = this.agente?.comarcas || [];
    if (!lista?.length) {
      return '—';
    }

    return lista
      .map(comarca => (comarca as any)?.nomeComarca || '')
      .filter(Boolean)
      .join(', ');
  }

  get areasAtuacao(): string {
    const lista = this.agente?.areasAtuacao || [];
    if (!lista?.length) {
      return '—';
    }

    return lista
      .map(area => (area as any)?.nomeAreaAtuacao || '')
      .filter(Boolean)
      .join(', ');
  }

  statusBadgeClass(): string {
    const status = (this.status || '').toUpperCase();
    switch (status) {
      case 'ATIVO':
        return 'bg-success';
      case 'INATIVO':
        return 'bg-danger';
      case 'EM_ANALISE':
        return 'bg-warning text-dark';
      case 'QUADRO_RESERVA':
        return 'bg-info';
      default:
        return 'bg-secondary';
    }
  }

  private carregarPerfil(): void {
    this.loading = true;
    this.api.buscarAgenteMe().subscribe({
      next: perfil => {
        this.agente = perfil;
        this.loading = false;
        this.erro = '';
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        const status = error.status;
        if (status === 403) {
          this.erro = 'As informações detalhadas do agente não estão disponíveis para o seu perfil.';
          this.erroTipo = 'info';
        } else if (status === 404) {
          this.erro = 'Não encontramos um cadastro de agente associado ao seu usuário.';
          this.erroTipo = 'warning';
        } else {
          this.erro = 'Não foi possível carregar as informações completas do perfil no momento.';
          this.erroTipo = 'danger';
        }
      }
    });
  }

  private formatarCPF(cpf?: string): string {
    if (!cpf) {
      return '—';
    }

    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) {
      return cpf;
    }

    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  private formatarTelefone(telefone?: string): string {
    if (!telefone) {
      return '—';
    }

    const digits = telefone.replace(/\D/g, '');
    if (digits.length === 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    if (digits.length === 11) {
      return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    return telefone;
  }
}

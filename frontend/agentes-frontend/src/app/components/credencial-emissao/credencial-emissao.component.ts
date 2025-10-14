import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AgenteVoluntario, Credencial } from '../../models/interfaces';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';

@Component({
  selector: 'app-credencial-emissao',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, ButtonComponent, PageHeaderComponent, AlertComponent],
  templateUrl: './credencial-emissao.component.html',
  styleUrl: './credencial-emissao.component.scss'
})
export class CredencialEmissaoComponent implements OnInit {
  agentesAtivos: AgenteVoluntario[] = [];
  selecionadoId?: number;
  loading = false;
  erro = '';
  ultimaCredencial?: Credencial;
  // Busca visual
  search = '';
  dropdownOpen = false;
  highlightIndex = 0;
  placeholder = '-- escolha --';
  showClear = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.carregarAgentesAtivos();
  }

  carregarAgentesAtivos(): void {
    this.loading = true;
    this.api.listarAgentesAtivos().subscribe({
      next: (lista) => {
        this.agentesAtivos = lista || [];
        this.loading = false;
      },
      error: () => {
        this.erro = 'Falha ao carregar agentes ativos.';
        this.loading = false;
      }
    });
  }

  private norm(s: string): string {
    return (s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  get agentesFiltrados(): AgenteVoluntario[] {
    const q = this.norm(this.search).trim();
    const qDigits = (this.search || '').replace(/\D/g, '');
    if (!q && !qDigits) return this.agentesAtivos;
    return this.agentesAtivos.filter(a => {
      const nome = this.norm(a.nomeCompleto || a.nome || '');
      const cpf = String(a.cpf || '').replace(/\D/g, '');
      return (q && nome.includes(q)) || (qDigits && cpf.includes(qDigits));
    });
  }

  openDropdown(): void {
    this.dropdownOpen = true;
    this.highlightIndex = 0;
  }

  closeDropdown(): void { this.dropdownOpen = false; }

  onInput(): void {
    this.dropdownOpen = true;
    this.highlightIndex = 0;
  }

  onInputKeydown(event: KeyboardEvent): void {
    const max = this.agentesFiltrados.length - 1;
    switch (event.key) {
      case 'ArrowDown':
        this.dropdownOpen = true;
        this.highlightIndex = Math.min(this.highlightIndex + 1, max);
        event.preventDefault();
        break;
      case 'ArrowUp':
        this.highlightIndex = Math.max(this.highlightIndex - 1, 0);
        event.preventDefault();
        break;
      case 'Enter':
        if (this.agentesFiltrados[this.highlightIndex]) {
          this.choose(this.agentesFiltrados[this.highlightIndex]);
        }
        event.preventDefault();
        break;
      case 'Escape':
        this.closeDropdown();
        break;
    }
  }

  choose(a: AgenteVoluntario): void {
    this.selecionadoId = a.id;
    this.search = `${a.nomeCompleto} (${this.formatarCPF(a.cpf)})`;
    this.closeDropdown();
  }

  clearSelection(): void {
    this.selecionadoId = undefined;
    this.search = '';
    this.openDropdown();
  }

  @HostListener('document:click', ['$event'])
  handleDocClick(ev: MouseEvent): void {
    const target = ev.target as HTMLElement;
    // fecha quando clicar fora do combobox
    if (!target.closest('.search-select')) this.closeDropdown();
  }

  emitir(): void {
    this.erro = '';
    this.ultimaCredencial = undefined;
    if (!this.selecionadoId) return;
    this.loading = true;
    this.api.emitirCredencial(this.selecionadoId).subscribe({
      next: (cred) => {
        this.ultimaCredencial = cred;
        this.loading = false;
      },
      error: (e) => {
        this.erro = 'Não foi possível emitir a credencial. Verifique se o agente está ATIVO e seu perfil possui permissão.';
        this.loading = false;
      }
    });
  }

  baixarPDF(): void {
    if (!this.ultimaCredencial?.id) return;
    this.api.gerarPDFCredencial(this.ultimaCredencial.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `credencial_${this.ultimaCredencial?.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    });
  }

  formatarCPF(cpf: string): string {
    if (!cpf) return '';
    const digits = String(cpf).replace(/\D/g, '');
    if (digits.length !== 11) return cpf;
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
}

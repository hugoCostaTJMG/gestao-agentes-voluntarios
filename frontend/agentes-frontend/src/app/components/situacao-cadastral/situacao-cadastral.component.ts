import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AgenteVoluntarioResponseDTO } from '../../models/interfaces';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { CpfMaskDirective } from '../../shared/directives/cpf-mask.directive';

@Component({
  selector: 'app-situacao-cadastral',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgIf, ButtonComponent, CpfMaskDirective, AlertComponent],
  templateUrl: './situacao-cadastral.component.html',
  styleUrls: ['./situacao-cadastral.component.scss']
})
export class SituacaoCadastralComponent {
  form: FormGroup;
  loading = false;
  erro = '';
  sucesso = '';
  agente?: AgenteVoluntarioResponseDTO;
  statusSelecionado: 'EM_ANALISE' | 'ATIVO' | 'INATIVO' = 'EM_ANALISE';

  constructor(private fb: FormBuilder, private api: ApiService) {
    this.form = this.fb.group({
      cpf: ['', [Validators.required]]
    });
  }

  buscar(): void {
    this.erro = '';
    this.sucesso = '';
    this.agente = undefined;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const cpf = (this.form.value.cpf || '').toString().replace(/\D/g, '');
    if (!cpf || cpf.length !== 11) {
      this.erro = 'Informe um CPF válido (11 dígitos).';
      return;
    }
    this.loading = true;
    this.api.buscarAgentePorCpf(cpf).subscribe({
      next: (ag) => {
        this.agente = ag;
        const st = (ag.status || '').toUpperCase();
        this.statusSelecionado = (st === 'ATIVO' || st === 'INATIVO') ? st as any : 'EM_ANALISE';
        this.loading = false;
      },
      error: () => {
        this.erro = 'Agente não encontrado para o CPF informado.';
        this.loading = false;
      }
    });
  }

  atualizarStatus(): void {
    if (!this.agente?.id) return;
    this.loading = true;
    this.erro = '';
    this.sucesso = '';
    this.api.atualizarStatusAgente(this.agente.id, this.statusSelecionado).subscribe({
      next: (res) => {
        this.sucesso = 'Situação cadastral atualizada com sucesso!';
        if (this.agente) this.agente.status = this.statusSelecionado;
        this.loading = false;
      },
      error: () => {
        this.erro = 'Falha ao atualizar a situação cadastral.';
        this.loading = false;
      }
    });
  }

  formatarCPF(cpf: string | undefined): string {
    if (!cpf) return '';
    const d = String(cpf).replace(/\D/g, '');
    return d.length === 11 ? d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') : cpf;
  }

  get comarcasTexto(): string {
    const lista = this.agente?.comarcas || [];
    if (!lista || lista.length === 0) return '—';
    try {
      return lista.map((c: any) => c?.nomeComarca || '').filter(Boolean).join(', ');
    } catch {
      return '—';
    }
  }
}

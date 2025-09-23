import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AgenteVoluntario, Credencial } from '../../models/interfaces';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';

@Component({
  selector: 'app-credencial-emissao',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor, ButtonComponent],
  templateUrl: './credencial-emissao.component.html',
  styleUrl: './credencial-emissao.component.scss'
})
export class CredencialEmissaoComponent implements OnInit {
  agentesAtivos: AgenteVoluntario[] = [];
  selecionadoId?: number;
  loading = false;
  erro = '';
  ultimaCredencial?: Credencial;

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
}

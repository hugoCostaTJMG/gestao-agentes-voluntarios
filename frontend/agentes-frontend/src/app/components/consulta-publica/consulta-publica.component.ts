import { Component } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ApiService } from '../../services/api.service';
import { ConsultaPublica } from '../../models/interfaces';

@Component({
  selector: 'app-consulta-publica',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, ButtonComponent, BadgeComponent, AlertComponent],
  templateUrl: './consulta-publica.component.html',
  styleUrls: ['./consulta-publica.component.scss']
})
export class ConsultaPublicaComponent {
  numeroCredencial = '';
  loadingConsulta = false;
  resultado?: ConsultaPublica;
  mensagem?: { tipo: 'success' | 'error'; texto: string };

  constructor(private readonly apiService: ApiService) {}

  consultarCredencial(): void {
    const credencialFormatada = this.numeroCredencial.trim();
    if (!credencialFormatada) {
      this.mensagem = { tipo: 'error', texto: 'Informe o número da credencial para continuar.' };
      this.resultado = undefined;
      return;
    }

    const somenteDigitos = credencialFormatada.replace(/\D/g, '');
    if (!somenteDigitos) {
      this.mensagem = { tipo: 'error', texto: 'Número da credencial inválido.' };
      this.resultado = undefined;
      return;
    }

    const credencialId = Number(somenteDigitos);
    this.loadingConsulta = true;
    this.mensagem = undefined;
    this.resultado = undefined;

    this.apiService.verificarCredencial(credencialId).subscribe({
      next: (dados) => {
        this.resultado = dados;
        this.loadingConsulta = false;
        this.mensagem = { tipo: 'success', texto: 'Credencial localizada com sucesso.' };
      },
      error: () => {
        this.loadingConsulta = false;
        this.resultado = undefined;
        this.mensagem = { tipo: 'error', texto: 'Credencial não encontrada ou inválida.' };
      }
    });
  }

  escanearQrCode(): void {
    window.alert('Funcionalidade de leitura por QR Code em desenvolvimento.');
  }

  limparMensagem(): void {
    this.mensagem = undefined;
  }
}

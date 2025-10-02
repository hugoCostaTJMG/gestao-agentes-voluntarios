import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { ApiService } from '../../services/api.service';
import { ConsultaPublica } from '../../models/interfaces';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-consulta-publica',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, ButtonComponent, BadgeComponent, AlertComponent],
  templateUrl: './consulta-publica.component.html',
  styleUrls: ['./consulta-publica.component.scss']
})
export class ConsultaPublicaComponent implements OnInit {
  numeroCredencial = '';
  loadingConsulta = false;
  resultado?: ConsultaPublica;
  mensagem?: { tipo: 'success' | 'error'; texto: string };

  constructor(
    private readonly apiService: ApiService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    try {
      const chaveParam = this.route.snapshot.paramMap.get('id');
      if (chaveParam) {
        this.loadingConsulta = true;
        this.apiService.verificarCredencial(chaveParam).subscribe({
          next: (dados) => {
            this.resultado = dados;
            this.loadingConsulta = false;
          },
          error: () => {
            this.loadingConsulta = false;
            this.mensagem = { tipo: 'error', texto: 'Credencial não encontrada ou inválida.' };
          }
        });
      }
    } catch {}
  }

  consultarCredencial(): void {
    const chave = this.numeroCredencial.trim();
    if (!chave) {
      this.mensagem = { tipo: 'error', texto: 'Informe o número da credencial para continuar.' };
      this.resultado = undefined;
      return;
    }
    this.loadingConsulta = true;
    this.mensagem = undefined;
    this.resultado = undefined;

    this.apiService.verificarCredencial(chave).subscribe({
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

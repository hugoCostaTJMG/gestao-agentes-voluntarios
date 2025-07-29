import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loading = false;
  showError = false;
  showInfo = false;
  errorMessage = '';
  infoMessage = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Verificar se já está logado
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/agentes']);
      return;
    }

    // Verificar se há código de retorno do gov.br
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.processarRetornoGovBr(params['code']);
      }
    });
  }

  loginKeycloak(): void {
    this.showInfo = true;
    this.infoMessage = 'Redirecionando para o Keycloak...';
    
    // Aqui você implementaria a integração com Keycloak
    // Por enquanto, simular um login administrativo
    setTimeout(() => {
      const adminUser: Usuario = {
        id: '1',
        nome: 'Administrador',
        email: 'admin@corregedoria.gov.br',
        perfil: 'ADMIN',
        token: 'mock-admin-token'
      };
      
      this.authService.setCurrentUser(adminUser);
      this.router.navigate(['/agentes']);
    }, 2000);
  }

  loginGovBr(): void {
    this.loading = true;
    this.showError = false;
    this.showInfo = true;
    this.infoMessage = 'Redirecionando para o gov.br...';

    const redirectUri = `${window.location.origin}/login`;
    
    this.apiService.gerarUrlAutorizacaoGovBr(redirectUri).subscribe({
      next: (response) => {
        window.location.href = response.authorizeUrl;
      },
      error: (error) => {
        this.loading = false;
        this.showInfo = false;
        this.showError = true;
        this.errorMessage = 'Erro ao conectar com gov.br. Tente novamente.';
        console.error('Erro no login gov.br:', error);
      }
    });
  }

  private processarRetornoGovBr(code: string): void {
    this.loading = true;
    this.showInfo = true;
    this.infoMessage = 'Processando autenticação...';

    const redirectUri = `${window.location.origin}/login`;

    // 1. Trocar código por token
    this.apiService.trocarCodigoPorToken(code, redirectUri).subscribe({
      next: (tokenResponse) => {
        // 2. Fazer login com o token
        const loginData = {
          cpf: '', // O CPF será obtido do token
          govBrToken: tokenResponse.accessToken
        };

        this.apiService.loginGovBr(loginData).subscribe({
          next: (agente) => {
            // 3. Criar usuário logado
            const user: Usuario = {
              id: agente.id || '',
              nome: agente.nomeCompleto,
              email: agente.email,
              perfil: 'AGENTE',
              token: tokenResponse.accessToken
            };

            this.authService.setCurrentUser(user);
            this.router.navigate(['/meu-perfil']);
          },
          error: (error) => {
            this.loading = false;
            this.showInfo = false;
            this.showError = true;
            
            if (error.status === 404) {
              this.errorMessage = 'CPF não encontrado na base de agentes voluntários.';
            } else {
              this.errorMessage = 'Erro na autenticação. Tente novamente.';
            }
            
            console.error('Erro no login:', error);
          }
        });
      },
      error: (error) => {
        this.loading = false;
        this.showInfo = false;
        this.showError = true;
        this.errorMessage = 'Erro ao processar autenticação gov.br.';
        console.error('Erro ao trocar código por token:', error);
      }
    });
  }
}


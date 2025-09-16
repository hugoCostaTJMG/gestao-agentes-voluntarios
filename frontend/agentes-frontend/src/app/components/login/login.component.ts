import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/interfaces';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loading = false;
  showError = false;
  showInfo = false;
  isLoggedIn = false;
  errorMessage = '';
  infoMessage = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private keycloak: KeycloakService
  ) {}

  ngOnInit(): void {
    // Se já está logado, redireciona:
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // Captura retorno do gov.br (código de autorização)
    this.route.queryParams.subscribe(params => {
      if (params['code']) {
        this.processarRetornoGovBr(params['code']);
      }
    });
  }

  async loginKeycloak() {
    this.showInfo = true;
    this.infoMessage = 'Redirecionando para o Keycloak...';

    await this.keycloak.init();
    this.keycloak.login(); // redireciona para o Keycloak
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

  /**
   * Extrai o 'sub' (ou campos equivalentes) do JWT.
   * Usa base64url → base64 e faz o parse do payload.
   */
  private extractSubject(jwt: string): string | undefined {
    try {
      const base64url = jwt.split('.')[1];
      if (!base64url) return undefined;

      const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
      // Ajuste de padding (base64) para evitar InvalidCharacterError
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      const payload = JSON.parse(atob(padded));

      // Preferência: sub → cpf → documento → user_id → uid
      return payload.sub || payload.cpf || payload.documento || payload.user_id || payload.uid;
    } catch (e) {
      console.warn('Falha ao extrair subject do token gov.br:', e);
      return undefined;
    }
  }

  private processarRetornoGovBr(code: string): void {
    this.loading = true;
    this.showInfo = true;
    this.infoMessage = 'Processando autenticação...';

    const redirectUri = `${window.location.origin}/login`;

    // 1) Trocar código por token
    this.apiService.trocarCodigoPorToken(code, redirectUri).subscribe({
      next: (tokenResponse) => {
        // 2) Fazer login com o token no backend
        const loginData = {
          cpf: '', // backend extrai do token; se necessário, pode preencher após decodificar o JWT
          govBrToken: tokenResponse.accessToken
        };

        this.apiService.loginGovBr(loginData).subscribe({
          next: (agente) => {
            // 3) Montar Usuario sempre com keycloakId preenchido
            const subject = this.extractSubject(tokenResponse.accessToken);
            const externalId = subject ?? agente.keycloakId ?? agente.cpf;

            if (!externalId) {
              this.loading = false;
              this.showInfo = false;
              this.showError = true;
              this.errorMessage = 'Não foi possível identificar o usuário autenticado.';
              console.error('Retorno gov.br sem identificador único (sub/cpf/keycloakId).');
              return;
            }

            const user: Usuario = {
              keycloakId: externalId,
              id: agente.id,
              nome: agente.nomeCompleto ?? agente.nome ?? '',
              email: agente.email ?? '',
              perfil: 'AGENTE',
              token: tokenResponse.accessToken
            };

            // Guarda o usuário logado
            this.authService.setCurrentUser(user);

            // Redireciona para a área logada
            this.router.navigate(['/']);
          },
          error: (error) => {
            this.loading = false;
            this.showInfo = false;
            this.showError = true;

            if (error?.status === 404) {
              this.errorMessage = 'CPF não encontrado na base de agentes voluntários.';
            } else {
              this.errorMessage = 'Erro na autenticação. Tente novamente.';
            }

            console.error('Erro no login gov.br:', error);
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

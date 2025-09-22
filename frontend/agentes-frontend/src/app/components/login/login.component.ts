import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
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

    // Captura retorno do Keycloak (token)
    this.route.queryParams.subscribe(params => {
      if (params['notRegistered']) {
        this.showError = true;
        this.errorMessage = 'Seu CPF não está cadastrado como Agente Voluntário.';
      }
      if (params['token']) {
        this.keycloak.init().then(() => this.router.navigate(['/']));
      }
    });
  }

  async loginKeycloak() {
    this.showInfo = true;
    this.infoMessage = 'Redirecionando para o Keycloak...';
    this.keycloak.login(); // backend inicia o fluxo OIDC do Keycloak
  }

  // Fluxo alternativo removido — autenticação via Keycloak apenas.
}

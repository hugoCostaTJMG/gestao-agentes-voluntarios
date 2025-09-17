import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import type { KeycloakInstance, KeycloakProfile } from 'keycloak-js';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { Usuario } from '../models/interfaces';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private keycloak!: KeycloakInstance;
  private isLoggingOut = false;
      
  constructor(
    private authService: AuthService,
    private router: Router,
    private apiService: ApiService
  ) {}

  async init(): Promise<boolean> {
    this.keycloak = new Keycloak({
      url: 'http://localhost:8084/auth',
      realm: 'tjmg',
      clientId: 'agentes-voluntarios'
    });

    const authenticated = await this.keycloak.init({
      onLoad: 'check-sso',   // 🔑 check-sso: só verifica, sem forçar login
      checkLoginIframe: false,
      pkceMethod: 'S256',
      silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
    });

    if (authenticated) {
      const profile = await this.keycloak.loadUserProfile();
      const token = this.keycloak.token || '';
      const realmRoles = this.getRealmRoles().map(role => role.toUpperCase());
      const clientRoles = this.getClientRoles().map(role => role.toUpperCase());
      const allRoles = new Set<string>([...realmRoles, ...clientRoles]);

      let perfil = '';
      if (allRoles.has('ADMIN')) {
        perfil = 'ADMIN';
      } else if (allRoles.has('AGENTE')) {
        perfil = 'AGENTE';
      }

      const baseUser: Usuario = {
        keycloakId: profile.id!, 
        nome: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
        email: profile.email || '',
        perfil,
        token
      };

      this.authService.setCurrentUser(baseUser);

      if (perfil === 'AGENTE') {
        const cpf = this.extractCpf(profile as KeycloakProfile);
        let enrichedUser: Usuario = baseUser;

        if (cpf) {
          try {
            const agente = await firstValueFrom(this.apiService.buscarAgentePorCpf(cpf));
            enrichedUser = {
              ...baseUser,
              id: agente.id,
              nome: agente.nomeCompleto,
              email: agente.email || baseUser.email,
              cpf: agente.cpf,
              telefone: agente.telefone
            };
          } catch (error) {
            console.error('Não foi possível carregar os dados do usuário via CPF', error);
          }
        } else {
          console.warn('CPF não disponível no perfil do usuário autenticado.');
        }

        this.authService.setCurrentUser(enrichedUser);
      }

      // 🔑 aqui você redireciona pra área logada
      if (this.router.url === '/login') {
        this.router.navigate(['/']);
      }
    }

    return authenticated;
  }

  login(): void {
    this.keycloak.login({ redirectUri: window.location.origin });
  }

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    this.authService.logout();

    if (this.keycloak) {
      this.keycloak.logout({ redirectUri: window.location.origin })
        .then(() => {
          this.isLoggingOut = false;
        })
        .catch(error => {
          console.error('Erro ao efetuar logout no Keycloak', error);
          this.isLoggingOut = false;
        });
    } else {
      this.isLoggingOut = false;
    }
  }

  async getValidToken(): Promise<string | undefined> {
    if (!this.keycloak) return undefined;
    try {
      await this.keycloak.updateToken(60);
      return this.keycloak.token;
    } catch {
      return undefined;
    }
  }

  getToken(): string | undefined {
    return this.keycloak?.token;
  }

  getRealmRoles(): string[] {
    if (!this.keycloak?.realmAccess?.roles) {
      return [];
    }

    return [...this.keycloak.realmAccess.roles];
  }

  getClientRoles(): string[] {
    if (!this.keycloak?.resourceAccess) {
      return [];
    }

    const roles = new Set<string>();
    Object.values(this.keycloak.resourceAccess).forEach(access => {
      access?.roles?.forEach(role => roles.add(role));
    });

    return Array.from(roles);
  }

  private extractCpf(profile: KeycloakProfile): string | null {
    const attributes = profile.attributes as Record<string, string[] | undefined> | undefined;
    if (attributes?.cpf?.length) {
      return attributes.cpf[0];
    }

    const tokenParsed = this.keycloak.tokenParsed as Record<string, unknown> | undefined;
    const cpfFromToken = tokenParsed?.['cpf'];
    return typeof cpfFromToken === 'string' ? cpfFromToken : null;
  }

  handleUnauthorized(): void {
    if (!this.isLoggingOut && this.authService.isLoggedIn()) {
      this.logout();
    }
  }
}

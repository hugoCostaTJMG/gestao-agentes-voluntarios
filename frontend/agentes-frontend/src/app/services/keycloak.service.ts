import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import type { KeycloakInstance } from 'keycloak-js';
import { AuthService } from './auth.service';
import { Usuario } from '../models/interfaces';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private keycloak!: KeycloakInstance;
      
  constructor(
    private authService: AuthService,
    private router: Router
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

    const user: Usuario = {
      keycloakId: profile.id, 
      nome: `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
      email: profile.email || '',
      perfil,
      token
    };

    // salva no localStorage
    this.authService.setCurrentUser(user);

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
    this.authService.logout();
    this.keycloak.logout({ redirectUri: window.location.origin });
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
}

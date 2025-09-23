import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Usuario } from '../models/interfaces';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KeycloakService {
  private isLoggingOut = false;
      
  constructor(
    private authService: AuthService,
    private router: Router,
    private api: ApiService
  ) {}

  async init(): Promise<boolean> {
    // Captura token retornado pelo backend após login (query param "token" ou fragment)
    const url = new URL(window.location.href);
    const tokenFromQuery = url.searchParams.get('token');
    const tokenFromHash = new URLSearchParams(url.hash?.replace(/^#/, ''))?.get('token') || undefined;
    const token = tokenFromQuery || tokenFromHash;

    if (token) {
      // 1) salva token provisoriamente para que Authorization funcione
      const provisional: Usuario = { keycloakId: '', nome: '', email: '', perfil: '', token };
      this.authService.setCurrentUser(provisional);

      // 2) tenta enriquecer com dados do backend (/auth/me) incluindo validação via CPF
      try {
        const me = await firstValueFrom(this.api.get<Usuario>('/auth/me'));
        const enriched: Usuario = { ...provisional, ...me, token };
        this.authService.setCurrentUser(enriched);
      } catch (e: any) {
        // Se não é agente cadastrado (404), encerra sessão local e volta para login
        if (e && e.status === 404) {
          this.authService.logout();
          // Mantém token fora do storage ao retornar para o login
          const base = window.location.origin + '/login?notRegistered=1';
          window.location.replace(base);
          return false;
        }
        // fallback: tenta inferir perfil via token
        const perfil = this.inferPerfilFromToken(token) || '';
        const fallback: Usuario = { ...provisional, perfil };
        this.authService.setCurrentUser(fallback);
      }

      // 3) Limpa o token da URL por segurança
      url.searchParams.delete('token');
      history.replaceState({}, document.title, url.pathname + url.search);

      // 4) Redireciona para home se estiver no /login
      if (this.router.url.startsWith('/login')) {
        this.router.navigate(['/']);
      }
      return true;
    }

    // Sem token retornado agora. Mantém estado atual.
    return this.authService.isLoggedIn();
  }

  login(): void {
    // Redireciona para o backend iniciar o fluxo OIDC
    // Usa force=true para obrigar o Keycloak a pedir credenciais novamente
    window.location.href = `${environment.apiUrl}/auth/keycloak/login?force=true`;
  }

  logout(): void {
    if (this.isLoggingOut) {
      return;
    }

    this.isLoggingOut = true;
    // Limpa o estado local do SPA
    this.authService.logout();
    // Melhor esforço: limpar cookies do domínio atual (não HttpOnly)
    try {
      this.clearClientCookies([
        'ID_TOKEN_HINT',
        'KEYCLOAK_SESSION',
        'KEYCLOAK_IDENTITY',
        'KEYCLOAK_REMEMBER_ME',
        'AUTH_SESSION_ID',
        'AUTH_SESSION_ID_LEGACY',
        'kc_locale'
      ]);
    } catch {}
    // Inicia logout no Keycloak via backend (encerra SSO de verdade)
    window.location.href = `${environment.apiUrl}/auth/keycloak/logout`;
  }

  private clearClientCookies(names?: string[]) {
    const paths = ['/', '/auth', '/auth/', '/auth/keycloak', '/auth/keycloak/'];
    const all = document.cookie.split(';').map(c => c.trim());
    const toDelete = (names && names.length)
      ? all.filter(c => names!.some(n => c.startsWith(`${n}=`)))
      : all;

    toDelete.forEach(c => {
      const name = c.split('=')[0];
      paths.forEach(p => {
        document.cookie = `${name}=; Path=${p}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
        // Tentativa com SameSite para navegadores mais restritivos
        document.cookie = `${name}=; Path=${p}; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      });
    });
    try { sessionStorage.clear(); } catch {}
    try { localStorage.removeItem('currentUser'); } catch {}
  }

  async getValidToken(): Promise<string | undefined> {
    return this.authService.getToken() || undefined;
  }

  getToken(): string | undefined {
    return this.authService.getToken() || undefined;
  }

  getRealmRoles(): string[] {
    // Com login no backend, as roles são lidas diretamente do JWT no frontend
    return [];
  }

  getClientRoles(): string[] {
    // Com login no backend, as roles são lidas diretamente do JWT no frontend
    return [];
  }

  private inferPerfilFromToken(token: string): string | null {
    try {
      const payloadSegment = token.split('.')[1];
      if (!payloadSegment) return null;
      const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      const payload = JSON.parse(atob(padded));
      const roles = new Set<string>();
      payload?.realm_access?.roles?.forEach((r: string) => roles.add(r.toUpperCase()));
      const resourceAccess = payload?.resource_access ?? {};
      Object.values(resourceAccess).forEach((access: any) => access?.roles?.forEach((r: string) => roles.add(r.toUpperCase())));
      if (roles.has('ADMIN')) return 'ADMIN';
      if (roles.has('AGENTE')) return 'AGENTE';
      return null;
    } catch {
      return null;
    }
  }

  handleUnauthorized(): void {
    if (this.isLoggingOut) {
      return;
    }
    if (this.authService.isLoggedIn()) {
      this.logout();
      return;
    }
    try {
      // Sem sessão local: garante ida para tela de login
      this.router.navigate(['/login']);
    } catch {
      // fallback duro
      window.location.href = '/login';
    }
  }
}

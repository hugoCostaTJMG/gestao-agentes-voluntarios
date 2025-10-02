import { inject, Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { KeycloakService } from './keycloak.service';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  private readonly auth = inject(AuthService);
  private readonly keycloak = inject(KeycloakService);

  /** Somente roles “de negócio” consideradas na autorização */
  private static readonly BUSINESS_ROLES = new Set(['CORREGEDORIA', 'COMARCA', 'AGENTE']);

  getUserRoles(): string[] {
    const roles = new Set<string>();
    const user = this.auth.getCurrentUser();

    if (user?.perfil) {
      roles.add(user.perfil.toUpperCase());
    }

    this.keycloak.getRealmRoles().forEach(r => roles.add(r.toUpperCase()));
    this.keycloak.getClientRoles().forEach(r => roles.add(r.toUpperCase()));
    this.decodeTokenRoles().forEach(r => roles.add(r.toUpperCase()));

    return Array.from(roles);
  }

  /** Apenas roles “de negócio” (ignora roles padrão do Keycloak) */
  private getBusinessRoles(allRoles?: string[]): string[] {
    const roles = (allRoles ?? this.getUserRoles()).map(r => r.toUpperCase());
    return roles.filter(r => PermissionService.BUSINESS_ROLES.has(r));
  }

  private decodeTokenRoles(): string[] {
    const token = this.auth.getToken();
    if (!token) return [];

    try {
      const payloadSegment = token.split('.')[1];
      if (!payloadSegment) return [];

      const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64 + '==='.slice((base64.length + 3) % 4);
      const payload = JSON.parse(atob(padded));

      const roles = new Set<string>();
      payload?.realm_access?.roles?.forEach((r: string) => roles.add(r));
      const resourceAccess = payload?.resource_access ?? {};
      Object.values(resourceAccess).forEach((access: any) => {
        access?.roles?.forEach((r: string) => roles.add(r));
      });

      return Array.from(roles);
    } catch (err) {
      console.warn('Não foi possível decodificar roles do token.', err);
      return [];
    }
  }

  hasAnyRole(required: string[], allRoles?: string[]): boolean {
    if (!required.length) return true;
    const normalized = required.map(r => r.toUpperCase());
    const userRoles = this.getBusinessRoles(allRoles);
    return normalized.some(r => userRoles.includes(r));
  }

  canAccess(required: string[] = []): boolean {
    if (!this.auth.isLoggedIn()) return false;

    // evita chamadas repetidas a getUserRoles
    const allRoles = this.getUserRoles();

    if (!required.length) {
      return true;
    }

    return this.hasAnyRole(required, allRoles);
  }
}

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../services/permission.service';
import { AlertService } from '../services/alert.service';
import { AuthService } from '../services/auth.service';

export const RoleGuard: CanActivateFn = (route, _state) => {
  const permissionService = inject(PermissionService);
  const alertService = inject(AlertService);
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data?.['roles'] ?? [];

  if (!authService.isLoggedIn()) {
    return true;
  }

  if (!requiredRoles.length) {
    return true;
  }

  const userRoles = permissionService.getUserRoles();

  if (permissionService.hasAnyRole(requiredRoles, userRoles)) {
    return true;
  }

  alertService.error('Acesso negado');
  return router.parseUrl('/');
};

import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { LogoComponent } from '../../shared/general/logo/logo.component';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { Usuario } from '../../models/interfaces';
import { AuthService } from '../../services/auth.service';
import { PermissionService } from '../../services/permission.service';

type MenuItem = {
  label: string;
  icon: string;
  link: string;
  roles?: string[];
  exact?: boolean;
};

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LogoComponent, RouterLink, RouterLinkActive, NgIf, NgFor, ButtonComponent],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  currentUser: Usuario | null = null;
  isLoggedIn = false;
  private readonly menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'fas fa-tachometer-alt', link: '/', roles: ['ADMIN', 'AGENTE'], exact: true },
    { label: 'Carteirinha', icon: 'fas fa-id-badge', link: '/carteirinha', roles: ['AGENTE'] },
    { label: 'Agentes Voluntários', icon: 'fas fa-users', link: '/agentes', roles: ['ADMIN'] },
    { label: 'Impressão Carteirinhas', icon: 'fas fa-id-badge', link: '/carteirinha-agentes', roles: ['ADMIN'] },
    { label: 'Cadastrar Agente', icon: 'fas fa-user-plus', link: '/agentes/cadastro', roles: ['ADMIN'] },
    { label: 'Emissão de Credencial', icon: 'fas fa-id-card', link: '/credenciais', roles: ['ADMIN'] },
    { label: 'Situação Cadastral', icon: 'fas fa-user-check', link: '/situacao-cadastral', roles: ['ADMIN'] },
    { label: 'Autos de Infração', icon: 'fas fa-file-alt', link: '/autos', roles: ['ADMIN'] },
    { label: 'Cadastrar Auto', icon: 'fas fa-plus-circle', link: '/autos/cadastro', roles: ['ADMIN'] },
    { label: 'Consulta Pública', icon: 'fas fa-search', link: '/consulta-publica', roles: ['ADMIN', 'AGENTE'] }
  ];

  constructor(
    private authService: AuthService,
    private permissionService: PermissionService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = user !== null;
    });
  }

  get visibleMenuItems(): MenuItem[] {
    const items = this.menuItems.filter(item => this.canShow(item));
    // Reordena especificamente para ADMIN
    if (this.permissionService.hasAnyRole(['ADMIN'])) {
      const weight: Record<string, number> = {
        '/': 10,
        '/agentes': 20,
        '/agentes/cadastro': 30,
        '/credenciais': 40,
        '/situacao-cadastral': 45,
        '/carteirinha-agentes': 50,
        '/autos': 60,
        '/autos/cadastro': 70,
        '/consulta-publica': 80,
      };
      return items.slice().sort((a, b) => (weight[a.link] ?? 1000) - (weight[b.link] ?? 1000));
    }
    return items;
  }

  private canShow(item: MenuItem): boolean {
    return this.permissionService.canAccess(item.roles ?? []);
  }

  closeSidebar() {
    document.body.classList.remove('sidebar-open');
  }
}

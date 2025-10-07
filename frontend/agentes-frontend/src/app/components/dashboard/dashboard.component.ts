import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { ApiService } from '../../services/api.service';
import { DashboardOverview } from '../../models/interfaces';
import { PermissionService } from '../../services/permission.service';

type MetricColor = 'primary' | 'success' | 'warning' | 'info';

type BadgeVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'dark';

interface MetricCard {
  icon: string;
  value: number | string;
  label: string;
  color: MetricColor;
}

interface RecentActivity {
  title: string;
  description: string;
  time: string;
  status: string;
  badgeVariant: BadgeVariant;
}

interface StatusSummary {
  label: string;
  count: number;
  badgeVariant: BadgeVariant;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  refreshing = false;

  // Perfil de gestão (Corregedoria/Comarca) controla cards e textos
  isAdmin = false;
  isAgente = false;
  statusPanelTitle = 'Status';

  metrics: MetricCard[] = [];

  activities: RecentActivity[] = [];

  statusSummary: StatusSummary[] = [];

  constructor(private api: ApiService, private permission: PermissionService) {}

  ngOnInit(): void {
    const roles = this.permission.getUserRoles().map(r => r.toUpperCase());
    this.isAdmin = roles.includes('CORREGEDORIA') || roles.includes('COMARCA');
    this.isAgente = roles.includes('AGENTE') && !this.isAdmin;
    this.statusPanelTitle = this.isAdmin ? 'Status dos Agentes' : 'Status dos Meus Autos';
    this.load();
  }

  private load(): void {
    this.api.getDashboardOverview().subscribe({
      next: (data: DashboardOverview) => {
        if (this.isAdmin) {
          this.metrics = [
            { icon: 'fas fa-users', value: data.totalAgentes, label: 'Total de Agentes', color: 'primary' },
            { icon: 'fas fa-user-check', value: data.agentesAtivos, label: 'Agentes Ativos', color: 'success' },
            { icon: 'fas fa-file-alt', value: data.autosTotal, label: 'Autos de Infração', color: 'warning' },
            { icon: 'fas fa-map-marker-alt', value: data.comarcasTotal, label: 'Comarcas MG', color: 'info' }
          ];
        } else {
          this.metrics = [
            { icon: 'fas fa-file-alt', value: data.autosTotal, label: 'Meus Autos', color: 'primary' }
          ];
        }
        this.activities = (data.activities || []).map(a => ({
          title: a.title,
          description: a.description,
          time: a.time,
          status: a.status,
          badgeVariant: a.badgeVariant as BadgeVariant
        }));
        this.statusSummary = (data.statusSummary || []).map(s => ({
          label: s.label,
          count: s.count,
          badgeVariant: s.badgeVariant as BadgeVariant
        }));
      },
      error: () => {
        // mantém silencioso; a UI já tem estados vazios.
      }
    });
  }

  refreshDashboard(): void {
    if (this.refreshing) {
      return;
    }
    this.refreshing = true;
    this.api.getDashboardOverview().subscribe({
      next: (data) => {
        if (this.isAdmin) {
          this.metrics = [
            { icon: 'fas fa-users', value: data.totalAgentes, label: 'Total de Agentes', color: 'primary' },
            { icon: 'fas fa-user-check', value: data.agentesAtivos, label: 'Agentes Ativos', color: 'success' },
            { icon: 'fas fa-file-alt', value: data.autosTotal, label: 'Autos de Infração', color: 'warning' },
            { icon: 'fas fa-map-marker-alt', value: data.comarcasTotal, label: 'Comarcas MG', color: 'info' }
          ];
        } else {
          this.metrics = [
            { icon: 'fas fa-file-alt', value: data.autosTotal, label: 'Meus Autos', color: 'primary' }
          ];
        }
        this.activities = (data.activities || []) as any;
        this.statusSummary = (data.statusSummary || []) as any;
        this.refreshing = false;
      },
      error: () => {
        this.refreshing = false;
      }
    });
  }
}

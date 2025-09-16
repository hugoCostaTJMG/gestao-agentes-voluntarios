import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

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
export class DashboardComponent {
  refreshing = false;

  metrics: MetricCard[] = [
    { icon: 'fas fa-users', value: 3, label: 'Total de Agentes', color: 'primary' },
    { icon: 'fas fa-user-check', value: 2, label: 'Agentes Ativos', color: 'success' },
    { icon: 'fas fa-file-alt', value: 2, label: 'Autos de Infração', color: 'warning' },
    { icon: 'fas fa-map-marker-alt', value: 298, label: 'Comarcas MG', color: 'info' }
  ];

  activities: RecentActivity[] = [
    {
      title: 'Maria Silva Santos',
      description: 'Credencial emitida',
      time: 'Hoje às 14:30',
      status: 'Concluído',
      badgeVariant: 'success'
    },
    {
      title: 'João Carlos Oliveira',
      description: 'Cadastro em análise',
      time: 'Ontem às 16:45',
      status: 'Em Análise',
      badgeVariant: 'warning'
    },
    {
      title: 'Auto AI-2024-001',
      description: 'Registrado',
      time: '15/06/2024 às 10:20',
      status: 'Registrado',
      badgeVariant: 'primary'
    }
  ];

  statusSummary: StatusSummary[] = [
    { label: 'Ativos', count: 2, badgeVariant: 'success' },
    { label: 'Em Análise', count: 1, badgeVariant: 'warning' },
    { label: 'Inativos', count: 0, badgeVariant: 'danger' }
  ];

  refreshDashboard(): void {
    if (this.refreshing) {
      return;
    }
    this.refreshing = true;
    window.setTimeout(() => {
      this.refreshing = false;
    }, 800);
  }
}

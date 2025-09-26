import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'AGENTE'] } // dashboard já tem cabeçalho próprio
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'carteirinha',
    loadComponent: () =>
      import('./components/carteirinha/carteirinha.component').then(m => m.CarteirinhaComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['AGENTE'] }
  },
  {
    path: 'carteirinha-agentes',
    loadComponent: () =>
      import('./components/carteirinha-agentes/carteirinha-agentes.component').then(m => m.CarteirinhaAgentesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'], title: 'Impressão de Carteirinhas', icon: 'fas fa-id-card', showBack: true }
  },
  {
    path: 'carteirinhas/:id',
    loadComponent: () =>
      import('./components/impressao-carteirinha/impressao-carteirinha.component').then(m => m.ImpressaoCarteirinhaComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'agentes',
    loadComponent: () =>
      import('./components/painel-agentes/painel-agentes.component').then(m => m.PainelAgentesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'], title: 'Painel de Agentes', icon: 'fas fa-users' }
  },
  {
    path: 'agentes/cadastro',
    loadComponent: () =>
      import('./components/agente-cadastro/agente-cadastro.component').then(m => m.AgenteCadastroComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'], title: 'Cadastro de Agente', icon: 'fas fa-user-plus' }
  },
  {
    path: 'agentes/:id/editar',
    loadComponent: () =>
      import('./components/agente-cadastro/agente-cadastro.component').then(m => m.AgenteCadastroComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'], title: 'Editar Agente', icon: 'fas fa-user-edit' }
  },
  {
    path: 'credenciais',
    loadComponent: () =>
      import('./components/credencial-emissao/credencial-emissao.component').then(m => m.CredencialEmissaoComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COFIJ'], title: 'Emissão de Credencial', icon: 'fas fa-id-card' }
  },
  {
    path: 'situacao-cadastral',
    loadComponent: () =>
      import('./components/situacao-cadastral/situacao-cadastral.component').then(m => m.SituacaoCadastralComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'], title: 'Atualização da Situação Cadastral', icon: 'fas fa-user-check', showBack: true }
  },
  {
    path: 'autos',
    loadComponent: () =>
      import('./components/auto-infracao-lista/auto-infracao-lista.component').then(m => m.AutoInfracaoListaComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'], title: 'Autos de Infração', icon: 'fas fa-file-alt' }
  },
  {
    path: 'autos/cadastro',
    loadComponent: () =>
      import('./components/auto-infracao-cadastro/auto-infracao-cadastro.component').then(m => m.AutoInfracaoCadastroComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'], title: 'Novo Auto de Infração', icon: 'fas fa-file-alt' }
  },
  {
    path: 'autos/:id',
    loadComponent: () =>
      import('./components/auto-infracao-detalhe/auto-infracao-detalhe.component').then(m => m.AutoInfracaoDetalheComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'], title: 'Detalhe do Auto de Infração', icon: 'fas fa-file-alt' }
  },
  {
    path: 'consulta-publica',
    loadComponent: () =>
      import('./components/consulta-publica/consulta-publica.component').then(m => m.ConsultaPublicaComponent),
    // Página pública – sem guards
    data: { title: 'Consulta Pública', icon: 'fas fa-search', showBack: true }
  },
  { path: '**', redirectTo: '' }
];

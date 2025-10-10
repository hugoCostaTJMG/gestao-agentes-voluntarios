import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CORREGEDORIA', 'COMARCA', 'AGENTE'] } // dashboard já tem cabeçalho próprio
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
    path: 'perfil',
    loadComponent: () =>
      import('./components/perfil/perfil.component').then(m => m.PerfilComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CORREGEDORIA', 'COMARCA', 'AGENTE'], title: 'Meu Perfil', icon: 'fas fa-user', showBack: false }
  },
  {
    path: 'carteirinha-agentes',
    loadComponent: () =>
      import('./components/carteirinha-agentes/carteirinha-agentes.component').then(m => m.CarteirinhaAgentesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CORREGEDORIA'], title: 'Impressão de Carteirinhas', icon: 'fas fa-id-card', showBack: false }
  },
  {
    path: 'carteirinhas/:id',
    loadComponent: () =>
      import('./components/impressao-carteirinha/impressao-carteirinha.component').then(m => m.ImpressaoCarteirinhaComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CORREGEDORIA'], title: 'Impressão de Carteirinha', icon: 'fas fa-id-card', showBack: true }
  },
  {
    path: 'agentes',
    loadComponent: () =>
      import('./components/painel-agentes/painel-agentes.component').then(m => m.PainelAgentesComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CORREGEDORIA', 'COMARCA'], title: 'Painel de Agentes', icon: 'fas fa-users' }
  },
  {
    path: 'agentes/cadastro',
    loadComponent: () =>
      import('./components/agente-cadastro/agente-cadastro.component').then(m => m.AgenteCadastroComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CORREGEDORIA', 'COMARCA'], title: 'Cadastro de Agente', icon: 'fas fa-user-plus' }
  },
  {
    path: 'agentes/:id/editar',
    loadComponent: () =>
      import('./components/agente-cadastro/agente-cadastro.component').then(m => m.AgenteCadastroComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CORREGEDORIA'], title: 'Editar Agente', icon: 'fas fa-user-edit' }
  },
  {
    path: 'credenciais',
    loadComponent: () =>
      import('./components/credencial-emissao/credencial-emissao.component').then(m => m.CredencialEmissaoComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CORREGEDORIA'], title: 'Emissão de Credencial', icon: 'fas fa-id-card' }
  },
  {
    path: 'situacao-cadastral',
    loadComponent: () =>
      import('./components/situacao-cadastral/situacao-cadastral.component').then(m => m.SituacaoCadastralComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CORREGEDORIA'], title: 'Atualização da Situação Cadastral', icon: 'fas fa-user-check', showBack: false }
  },
  {
    path: 'perfil',
    loadComponent: () =>
      import('./components/user-profile/user-profile.component').then(m => m.UserProfileComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CORREGEDORIA', 'COMARCA', 'Agente'], title: 'Perfil', icon: 'fas fa-user-check', showBack: false }
  },
  // {
  //   path: 'autos',
  //   loadComponent: () =>
  //     import('./components/auto-infracao-lista/auto-infracao-lista.component').then(m => m.AutoInfracaoListaComponent),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: { roles: ['ADMIN'], title: 'Autos de Infração', icon: 'fas fa-file-alt' }
  // },
  // {
  //   path: 'autos/cadastro',
  //   loadComponent: () =>
  //     import('./components/auto-infracao-cadastro/auto-infracao-cadastro.component').then(m => m.AutoInfracaoCadastroComponent),
  //   canActivate: [AuthGuard, RoleGuard],
  //   data: { roles: ['ADMIN'], title: 'Novo Auto de Infração', icon: 'fas fa-file-alt' }
  // },
  {
    path: 'autos/:id',
    loadComponent: () =>
      import('./components/auto-infracao-detalhe/auto-infracao-detalhe.component').then(m => m.AutoInfracaoDetalheComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['CORREGEDORIA', 'AGENTE'], title: 'Detalhe do Auto de Infração', icon: 'fas fa-file-alt' }
  },
  {
    path: 'public/verificar/:id',
    loadComponent: () =>
      import('./components/consulta-publica/consulta-publica.component').then(m => m.ConsultaPublicaComponent),
    // pública
    data: { title: 'Consulta Pública', icon: 'fas fa-search', showBack: false }
  },
  {
    path: 'consulta-publica',
    loadComponent: () =>
      import('./components/consulta-publica/consulta-publica.component').then(m => m.ConsultaPublicaComponent),
    // Página pública – sem guards
    data: { title: 'Consulta Pública', icon: 'fas fa-search', showBack: false }
  },
  { path: '**', redirectTo: '' }
];

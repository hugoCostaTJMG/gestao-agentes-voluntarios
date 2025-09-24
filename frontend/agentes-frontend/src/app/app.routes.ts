import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'AGENTE'] }
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
      import('./components/carteirinha/carteirinha.component').then(m => m.CarteirinhaComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['AGENTE'] }
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
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'agentes/cadastro',
    loadComponent: () =>
      import('./components/agente-cadastro/agente-cadastro.component').then(m => m.AgenteCadastroComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'agentes/:id/editar',
    loadComponent: () =>
      import('./components/agente-cadastro/agente-cadastro.component').then(m => m.AgenteCadastroComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'credenciais',
    loadComponent: () =>
      import('./components/credencial-emissao/credencial-emissao.component').then(m => m.CredencialEmissaoComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'COFIJ'] }
  },
  {
    path: 'autos',
    loadComponent: () =>
      import('./components/auto-infracao-lista/auto-infracao-lista.component').then(m => m.AutoInfracaoListaComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'autos/cadastro',
    loadComponent: () =>
      import('./components/auto-infracao-cadastro/auto-infracao-cadastro.component').then(m => m.AutoInfracaoCadastroComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'autos/:id',
    loadComponent: () =>
      import('./components/auto-infracao-detalhe/auto-infracao-detalhe.component').then(m => m.AutoInfracaoDetalheComponent),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'consulta-publica',
    loadComponent: () =>
      import('./components/consulta-publica/consulta-publica.component').then(m => m.ConsultaPublicaComponent),
    // Página pública – sem guards
  },
  { path: '**', redirectTo: '' }
];

import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AgenteCadastroComponent } from './components/agente-cadastro/agente-cadastro.component';
import { AgenteListaComponent } from './components/agente-lista/agente-lista.component';
import { PainelAgentesComponent } from './components/painel-agentes/painel-agentes.component';
import { CredencialEmissaoComponent } from './components/credencial-emissao/credencial-emissao.component';
import { ConsultaPublicaComponent } from './components/consulta-publica/consulta-publica.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: PainelAgentesComponent },
  { path: 'agentes', component: AgenteListaComponent },
  { path: 'agentes/cadastro', component: AgenteCadastroComponent },
  { path: 'credenciais', component: CredencialEmissaoComponent },
  { path: 'consulta-publica', component: ConsultaPublicaComponent },
  { path: '**', redirectTo: '/login' }
];


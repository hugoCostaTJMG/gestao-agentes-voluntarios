import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { AgenteCadastroComponent } from './components/agente-cadastro/agente-cadastro.component';
import { AgenteListaComponent } from './components/agente-lista/agente-lista.component';
import { CredencialEmissaoComponent } from './components/credencial-emissao/credencial-emissao.component';
import { ConsultaPublicaComponent } from './components/consulta-publica/consulta-publica.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    HeaderComponent,
    LoginComponent,
    AgenteCadastroComponent,
    AgenteListaComponent,
    CredencialEmissaoComponent,
    ConsultaPublicaComponent
  ],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <footer class="footer mt-auto">
      <div class="container text-center">
        <span class="text-muted">
          © 2025 Corregedoria - Sistema de Gestão de Agentes Voluntários
        </span>
      </div>
    </footer>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Sistema de Agentes Voluntários';
}



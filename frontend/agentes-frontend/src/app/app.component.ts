import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';
import { LoginComponent } from './components/login/login.component';
import { AgenteCadastroComponent } from './components/agente-cadastro/agente-cadastro.component';
import { AgenteListaComponent } from './components/agente-lista/agente-lista.component';
import { CredencialEmissaoComponent } from './components/credencial-emissao/credencial-emissao.component';
import { ConsultaPublicaComponent } from './components/consulta-publica/consulta-publica.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    HeaderComponent,
    SidebarComponent,
    LoginComponent,
    AgenteCadastroComponent,
    AgenteListaComponent,
    CredencialEmissaoComponent,
    ConsultaPublicaComponent
  ],
  templateUrl: './app.component.html', // agora usa arquivo separado
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Sistema de Agentes Voluntários';
  toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
  }

  closeSidebar() {
    document.body.classList.remove('sidebar-open');
  }
}



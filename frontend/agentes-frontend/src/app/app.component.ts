import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AlertComponent } from './shared/components/alert/alert.component';
import { AlertService, AlertMessage } from './services/alert.service';
import { PageHeaderComponent } from './shared/components/page-header/page-header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,
    AsyncPipe,
    HeaderComponent,
    SidebarComponent,
    AlertComponent,
    PageHeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Sistema de Agentes Voluntários';
  alert$ = this.alertService.message$;

  constructor(private alertService: AlertService) {}

  toggleSidebar(): void {
    document.body.classList.toggle('sidebar-open');
  }

  closeSidebar(): void {
    document.body.classList.remove('sidebar-open');
  }

  mapAlertType(type: AlertMessage['type']): 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'neutral' | 'ghost' {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'info';
    }
  }

  clearAlert(): void {
    this.alertService.clear();
  }
}

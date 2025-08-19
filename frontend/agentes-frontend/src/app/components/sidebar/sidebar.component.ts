import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LogoComponent } from '../../shared/general/logo/logo.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LogoComponent, RouterLink, RouterLinkActive, ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {

  closeSidebar() {
    document.body.classList.remove('sidebar-open');
  }
}

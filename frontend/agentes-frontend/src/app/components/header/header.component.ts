import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/interfaces';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LogoComponent } from '../../shared/general/logo/logo.component';
import { MarcaComponent } from '../../shared/general/marca/marca.component';
import { ButtonComponent } from '../../shared/components/buttons/button/button.component';
import { BehaviorSubject } from 'rxjs';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoComponent, MarcaComponent, ButtonComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  currentUser: Usuario | null = null;
  isLoggedIn = false;
  isSidebarOpen = false;

  constructor(
    private authService: AuthService,
    private keycloakService: KeycloakService,
    private router: Router
  ) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = this.currentUserSubject.value !== null;
    });
  }
  toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
    this.isSidebarOpen = document.body.classList.contains('sidebar-open');
  }

  logout(): void {
    this.authService.logout();
    this.keycloakService.logout();  
    this.router.navigate(['/login']);
  }
}

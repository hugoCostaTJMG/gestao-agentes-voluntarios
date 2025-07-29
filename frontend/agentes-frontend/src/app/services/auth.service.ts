import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuario } from '../models/interfaces';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  /** Return the logged in user or null */
  getCurrentUser(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /** Persist the authenticated user */
  setCurrentUser(user: Usuario): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  /** True if there is a logged in user */
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /** Remove stored user and token */
  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  /** Retrieve JWT token if available */
  getToken(): string | null {
    return this.currentUserSubject.value?.token || null;
  }

  /** Helper to get the user profile (role) */
  getUserProfile(): string {
    return this.currentUserSubject.value?.perfil || '';
  }
}

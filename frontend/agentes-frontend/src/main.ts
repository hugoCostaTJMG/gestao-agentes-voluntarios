import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, APP_INITIALIZER, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { KeycloakService } from './app/services/keycloak.service';
import { from, mergeMap, catchError, throwError } from 'rxjs';
import { TokenInterceptor } from './app/services/token.interceptor';

function initializeKeycloak(keycloakService: KeycloakService) {
  return () => keycloakService.init();
}

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      deps: [KeycloakService],
      multi: true,
    },
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    importProvidersFrom(
      RouterModule.forRoot(routes),
      ReactiveFormsModule,
      FormsModule,
      BrowserAnimationsModule
    ),
  ],
}).catch((err) => console.error(err));

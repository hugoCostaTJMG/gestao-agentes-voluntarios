import { bootstrapApplication } from '@angular/platform-browser';
import { importProvidersFrom, APP_INITIALIZER, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { KeycloakService } from './app/services/keycloak.service';
import { from, mergeMap } from 'rxjs';

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
    provideHttpClient(
      withInterceptors([
        (req, next) => {
          return from(inject(KeycloakService).getValidToken()).pipe(
            mergeMap((token) => {
              if (token) {
                const cloned = req.clone({
                  setHeaders: { Authorization: `Bearer ${token}` },
                });
                return next(cloned);
              }
              return next(req);
            })
          );
        },
      ])
    ),
    importProvidersFrom(
      RouterModule.forRoot(routes),
      ReactiveFormsModule,
      FormsModule,
      BrowserAnimationsModule
    ),
  ],
}).catch((err) => console.error(err));

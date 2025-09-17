import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { catchError, mergeMap } from 'rxjs/operators';
import { KeycloakService } from './keycloak.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private keycloakService: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Transformamos a Promise do getValidToken em Observable
    return from(this.keycloakService.getValidToken()).pipe(
      mergeMap(token => {
        const request = token
          ? req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            })
          : req;

        return next.handle(request).pipe(
          catchError(error => {
            if (error.status === 401) {
              this.keycloakService.handleUnauthorized();
            }
            return throwError(() => error);
          })
        );
      })
    );
  }
}

import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { KeycloakService } from './keycloak.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private keycloakService: KeycloakService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Transformamos a Promise do getValidToken em Observable
    return from(this.keycloakService.getValidToken()).pipe(
      mergeMap(token => {
        if (token) {
          // Clona a requisição adicionando o Authorization
          const cloned = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`
            }
          });
          return next.handle(cloned);
        }
        // Se não tiver token, segue a requisição normal
        return next.handle(req);
      })
    );
  }
}

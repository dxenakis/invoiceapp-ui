// src/app/core/interceptors/auth.interceptor.ts
import { Injectable, inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private auth = inject(AuthService);

  private refreshing = false;
  private queue: Array<() => void> = [];

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;

    // endpoints που ΔΕΝ θέλουν/δεν πρέπει να έχουν Authorization
    const noAuthEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      // ΠΡΟΣΟΧΗ: ΟΧΙ /auth/logout εδώ, θέλουμε να πάει με Bearer
    ];

    const isApi = req.url.startsWith(environment.apiUrl);
    const isNoAuth = noAuthEndpoints.some((path) => req.url.includes(path));

    // αν είναι API call ΚΑΙ έχουμε token ΚΑΙ ΔΕΝ είναι από τα "no-auth" → βάλε Bearer
    if (isApi && this.auth.token && !isNoAuth) {
      authReq = this.addAuth(req);
    }

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        // αν δεν είναι 401 ή είναι από τα no-auth endpoints → απλά πέτα το
        if (err.status !== 401 || isNoAuth) {
          return throwError(() => err);
        }

        // αν ήδη γίνεται refresh, βάλ' το στην ουρά
        if (this.refreshing) {
          return new Observable<HttpEvent<any>>((observer) => {
            this.queue.push(() => {
              const retried = this.addAuth(req);
              next.handle(retried).subscribe({
                next: (v) => observer.next(v),
                error: (e) => observer.error(e),
                complete: () => observer.complete(),
              });
            });
          });
        }

        // αλλιώς ξεκίνα refresh
        this.refreshing = true;

        return this.auth.refreshChain().pipe(
          switchMap(() => {
            const retried = this.addAuth(req);
            const main$ = next.handle(retried);

            this.queue.forEach((fn) => fn());
            this.queue = [];
            this.refreshing = false;

            return main$;
          }),
          catchError((refreshErr) => {
            this.refreshing = false;
            this.queue = [];
            this.auth.forceLocalLogout(); // 👈 εδώ σε πετάει στο /login
            return throwError(() => refreshErr);
          })
        );
      })
    );
  }

  private addAuth(req: HttpRequest<any>): HttpRequest<any> {
    const token = this.auth.token;
    if (!token) return req;
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
      withCredentials: true,
    });
  }
}

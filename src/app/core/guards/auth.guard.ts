// src/app/core/guards/auth.guard.ts
import { inject } from '@angular/core';
import {
  CanMatchFn,
  Route,
  UrlSegment,
  Router,
  UrlTree,
} from '@angular/router';
import { AuthService } from '../../auth/auth.service';

export const authGuard: CanMatchFn =
  async (
    route: Route,
    segments: UrlSegment[]
  ): Promise<boolean | UrlTree> => {
    const auth = inject(AuthService);
    const router = inject(Router);

   // console.log(
   //   '[authGuard] match for',
   //   segments.map((s) => s.path).join('/'),
   //   'token =',
   //   auth.token
   // );

    // 1) Αν δεν έχουμε token → δοκίμασε silent refresh
    if (!auth.token) {
      console.log('[authGuard] no token → calling refreshChain()');
      try {
        // ίδιο στιλ με το appTenantGuard
        await auth.refreshChain().toPromise();
        console.log(
          '[authGuard] after refreshChain, token =',
          auth.token
        );
      } catch (e) {
        console.log('[authGuard] refreshChain error', e);
      }
    }

    // 2) Αν ακόμα δεν έχουμε token → redirect /login
    if (!auth.token) {
      console.log('[authGuard] still no token → redirect /login');
      return router.parseUrl('/login');
    }

    // 3) Έχουμε έγκυρο token → επιτρέπουμε /companies, /companies/create
   // console.log('[authGuard] OK → allow /companies*');
    return true;
  };

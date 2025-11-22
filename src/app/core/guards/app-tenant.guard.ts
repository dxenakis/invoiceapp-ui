// src/app/core/guards/app-tenant.guard.ts
import { inject } from '@angular/core';
import { CanActivateChildFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

/**
 * Guard για ΟΛΕΣ τις /app/... routes.
 *
 * 1) Φροντίζει να υπάρχει access token (silent refresh αν χρειάζεται)
 * 2) Φροντίζει να υπάρχει activeCompanyId στο ΤΑΒ
 * 3) Αν κάτι λείπει → redirect σε /login ή /companies
 */
export const appTenantGuard: CanActivateChildFn = async (route, state): Promise<boolean | UrlTree> => {
  const auth = inject(AuthService);
  const router = inject(Router);

  //console.log('[appTenantGuard] start, state.url =', state.url, 'token =', auth.token);

  // 1) Αν δεν έχουμε token, προσπάθησε silent refresh
  if (!auth.token) {
   // console.log('[appTenantGuard] no token → calling refreshChain()');
    try {
      await auth.refreshChain().toPromise();
   //   console.log('[appTenantGuard] after refreshChain, token =', auth.token);
    } catch (e) {
   //   console.log('[appTenantGuard] refreshChain threw error', e);
    }
  }

  // 2) Αν ΚΑΙ πάλι δεν έχουμε token → /login
  if (!auth.token) {
   // console.log('[appTenantGuard] still no token → redirect /login');
    return router.parseUrl('/login');
  }

  // 3) Έλεγξε activeCompanyId στο sessionStorage του ΤΑΒ
  const actCid = auth.getActiveCompanyId();
  //console.log('[appTenantGuard] activeCompanyId =', actCid);

  if (!actCid) {
    //console.log('[appTenantGuard] NO active company → redirect /companies');
    return router.parseUrl('/companies');
  }

 // console.log('[appTenantGuard] OK (token + activeCompanyId) → allow');
  return true;
};

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  of,
  map,
  tap,
  catchError,
  firstValueFrom,switchMap,  
} from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import {  CompanyAccessItem,  LoginResponse,  RefreshResponse,  LoginPayload,  RegisterPayload,  TokenResponse, MeResponse  } from './auth.models';

export interface SimpleUser {
  username?: string;
  firstname?: string;
  lastname?: string;
  fullname?: string;
}

/** ----------------------------------------------------------- */

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private api = environment.apiUrl ?? '/api';

  /** ===== In-memory Access Token για Interceptor/Guards ===== */
  private tokenSubject = new BehaviorSubject<string | null>(null);
  get token(): string | null {
    return this.tokenSubject.value;
  }

  /** ===== Streams για Topbar/Layouts ===== */
  private userSubject = new BehaviorSubject<SimpleUser | null>(null);
  public readonly user$ = this.userSubject.asObservable();

  private companiesSubject = new BehaviorSubject<CompanyAccessItem[]>([]);
  public readonly companies$ = this.companiesSubject.asObservable();

  private activeCompanySubject = new BehaviorSubject<number | null>(null);
  public readonly activeCompany$ = this.activeCompanySubject.asObservable();

  private fiscalYearSubject = new BehaviorSubject<string | null>(null);
  public readonly fiscalYear$ = this.fiscalYearSubject.asObservable();

  /** Storage key για την «τελευταία εταιρεία» */
  private readonly ACTIVE_COMPANY_KEY = 'activeCompanyId';

  // αποθηκεύουμε μόνο helper data, ΟΧΙ tokens
  private readonly COMPANIES_KEY = 'companies';

 // NEW: αποθήκευση user για την topbar στο sessionStorage
  private readonly USER_KEY = 'user';

  get companies(): CompanyAccessItem[] {
  return this.companiesSubject.value;
}
updateCompaniesFromBackend(list: CompanyAccessItem[]): void {
  const safe = Array.isArray(list) ? list : [];
  this.companiesSubject.next(safe);
  this.saveCompaniesToStorage(safe);
  console.log("companies"+safe);
}




  /** =========================================================
   *  Public API
   *  =======================================================*/

  /**
   * Κάλεσέ το στην εκκίνηση (APP_INITIALIZER ή main bootstrap).
   * 1) Προσπαθεί pre-tenant refresh
   * 2) Αν υπάρχει αποθηκευμένη εταιρεία, δοκιμάζει tenant refresh
   */
async bootstrap(): Promise<void> {
  const savedAct = this.getActiveCompanyId();
  //console.log(savedAct);
  // 1) Γέμισε τα subjects από το sessionStorage (per tab)
  if (savedAct != null) {
    this.activeCompanySubject.next(savedAct);
  }
  this.loadCompaniesFromStorage();
  this.loadUserFromStorage(); // NEW

  // 2) Προσπάθησε να φτιάξεις access token από refresh cookie
  try {
    await firstValueFrom(
      this.refresh().pipe(catchError(() => of(void 0)))
    );

    // 3) Αν είχαμε αποθηκευμένη ενεργή εταιρεία, κάνε και tenant refresh
    if (savedAct) {
      await firstValueFrom(
        this.refresh(savedAct).pipe(catchError(() => of(void 0)))
      );
    }
  } catch {
    // αβλαβές: ο guard θα σε οδηγήσει σε /login αν δεν υπάρχει access
  }
}



  /** Login → προ-tenant access + user + companies (συνήθως) */
  login(payload: LoginPayload): Observable<void> {
  return this.http
    .post<LoginResponse>(`${this.api}/auth/login`, payload, {
      withCredentials: true,
      observe: 'body' as const, // <<
    })
    .pipe(
      tap((resp) => this.seedStateFromLogin(resp)),
      map(() => void 0)
    );
}

  /** Register (προαιρετικό) */
  register(payload: RegisterPayload): Observable<void> {
    return this.http.post<void>(`${this.api}/auth/register`, payload, {
      withCredentials: true,
    });
  }

  /**
   * Refresh access token.
   * - Χωρίς actCid → pre-tenant refresh
   * - Με actCid → tenant-bound refresh
   */

refresh(actCid?: number): Observable<void> {
  //console.log('refresh actCid:', actCid);

  // body: ή null, ή { actCid: ... }
  const body = actCid ? { actCid } : null;

  return this.http
    .post<RefreshResponse>(`${this.api}/auth/refresh`, body, {
      withCredentials: true,  // για να σταλεί το refresh cookie
      observe: 'body',
    })
    .pipe(
      tap((resp) => this.applyRefreshResponse(resp, actCid ?? null)),
      map(() => void 0)
    );
}


refreshChain(actCid?: number): Observable<void> {
  const saved = actCid ?? this.getActiveCompanyId();

  // 1) Προσπάθεια pre-tenant refresh
  return this.refresh().pipe(
    // 2) Αν υπάρχει saved actCid, κάνε και tenant refresh πάνω από αυτό
    switchMap(() => (saved ? this.refresh(saved) : of(void 0))),
    // 3) Μετατρέπουμε το stream σε Observable<void>
    map(() => void 0)
  );
}




  /** Επιλογή/αλλαγή εταιρείας → εκδίδει tenant-bound access */
 /** Επιλογή/αλλαγή εταιρείας → backend γυρνά μόνο { token } */
switchCompany(companyId: number): Observable<void> {
  return this.http
    .post<TokenResponse>(
      `${this.api}/auth/switch-company`,
      { companyId },
      { withCredentials: true, observe: 'body' as const }
    )
    .pipe(
      tap((resp) => {
        // token από backend (TokenResponse.token)
        this.tokenSubject.next(resp.token);

        // ορίζουμε ενεργή εταιρεία τοπικά
        this.setActiveCompanyId(companyId);

        // ΔΕΝ ενημερώνουμε user/companies/fiscalYear εδώ γιατί δεν έρχονται
      }),
      map(() => void 0)
    );
}

/** 
 * Καλεί /auth/me και γεμίζει user + companies στο state.
 * Χρησιμοποιείται κυρίως σε νέο tab (π.χ. όταν ανοίγεις κατευθείαν /companies)
 * αφού έχει ήδη γίνει refresh() και έχουμε access token.
 */
me(): Observable<void> {
  return this.http
    .get<MeResponse>(`${this.api}/auth/me`, {
      withCredentials: true,       // όχι απαραίτητο, αλλά ok
      observe: 'body' as const,
    })
    .pipe(
      tap((resp) => this.seedStateFromMe(resp)),
      map(() => void 0)
    );
}


/** Logout → επιστρέφει Observable<void> για να μπορείς να κάνεις .subscribe() όπου το θες */
logout(): Observable<void> {
  return this.http
    .post(`${this.api}/auth/logout`, {}, { withCredentials: true, observe: 'body' as const })
    .pipe(
   //   catchError(() => of(null)),
      tap(() => {
        this.tokenSubject.next(null);
        this.userSubject.next(null);
        this.companiesSubject.next([]);
        this.setActiveCompanyId(null);
        this.fiscalYearSubject.next(null);

        sessionStorage.removeItem(this.COMPANIES_KEY);
        sessionStorage.removeItem(this.USER_KEY); 
        this.router.navigate(['/login']).catch(() => {});
      }),
      map(() => void 0)
    );
}



  /** =========================================================
   *  Helpers (public)
   *  =======================================================*/

  setActiveCompanyId(id: number | null): void {
    this.activeCompanySubject.next(id);
    if (id == null) {
      sessionStorage.removeItem(this.ACTIVE_COMPANY_KEY);
    } else {
      sessionStorage.setItem(this.ACTIVE_COMPANY_KEY, String(id));
    }
  }


getActiveCompanyId(): number | null {
  const v = sessionStorage.getItem(this.ACTIVE_COMPANY_KEY);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

  /** =========================================================
   *  Helpers (private)
   *  =======================================================*/

  /** Προσαρμογή user object για το topbar */
private mapUser(u: any): SimpleUser | null {
  if (!u) return null;
  const fullname =
    u.fullname ??
    [u.firstname ?? u.firstName, u.lastname ?? u.lastName]
      .filter(Boolean)
      .join(' ')
      .trim();
  return {
    username: u.username ?? u.email ?? u.userName,
    firstname: u.firstname ?? u.firstName,
    lastname: u.lastname ?? u.lastName,
    fullname: fullname || undefined,
  };
}


 
  /** Γέμισμα state μετά από login (σύμφωνα με το δικό σου LoginResponse) */
private seedStateFromLogin(resp: LoginResponse): void {
  if (!resp) return;

  // 1) token από backend
  if (resp.token) {
    this.tokenSubject.next(resp.token);
  }

  // 2) User: τα πεδία είναι flat πάνω στο resp (ΟΧΙ resp.user)
  const firstname = (resp as any).fistname ?? (resp as any).firstname ?? null;

 const rawUser = {
    username: resp.username ?? undefined,
    firstname: firstname ?? undefined,
    lastname: resp.lastname ?? undefined,
  };

  const mappedUser = this.mapUser(rawUser);
  this.userSubject.next(mappedUser);
  this.saveUserToStorage(mappedUser);   // NEW

  // 3) companies
  const companies = Array.isArray(resp.companies) ? resp.companies : [];
  this.companiesSubject.next(companies);
  this.saveCompaniesToStorage(companies);

  // 4) Active company αν στο γυρίσει το backend
  if (resp.activeCompanyId != null) {
    this.setActiveCompanyId(resp.activeCompanyId);
  }
}

/** Γέμισμα state μετά από /auth/me (pre-tenant) */
private seedStateFromMe(resp: MeResponse): void {
  if (!resp) return;

  // 1) User
  // backend: username, firstname, lastname
  const rawUser = {
    username: resp.username ?? undefined,
    // έχεις υποστηρίξει και fistname typo, οπότε:
    firstname: (resp as any).fistname ?? (resp as any).firstname ?? undefined,
    lastname: resp.lastname ?? undefined,
  };

  const mappedUser = this.mapUser(rawUser);
  this.userSubject.next(mappedUser);
  this.saveUserToStorage(mappedUser);

  // 2) Companies
  const companies = Array.isArray(resp.companies) ? resp.companies : [];
  this.companiesSubject.next(companies);
  this.saveCompaniesToStorage(companies);

  // 3) ΔΕΝ πειράζουμε activeCompanyId εδώ.
  // Το νέο tab είναι pre-tenant, και activeCompanyId θα μπει ΜΟΝΟ μετά το switchCompany().
}



  /** Εφαρμογή state μετά από refresh */
/** Εφαρμογή state μετά από refresh (σύμφωνα με το δικό σου RefreshResponse: μόνο accessToken) */
private applyRefreshResponse(
  resp: RefreshResponse,
  requestedActCid: number | null
): void {
  // 1) token
  this.tokenSubject.next(resp.accessToken);

  // 2) active company: αν ζητήσαμε συγκεκριμένη (tenant refresh), αποθήκευσέ τη
  if (requestedActCid != null) {
    this.setActiveCompanyId(requestedActCid);
  }

  // 3) fiscal year: δεν έρχεται στο δικό σου RefreshResponse → μην κάνεις τίποτα
  // 4) user/companies: επίσης δεν έρχονται εδώ → μην κάνεις τίποτα
}

private saveCompaniesToStorage(list: CompanyAccessItem[]): void {
  try {
    sessionStorage.setItem(this.COMPANIES_KEY, JSON.stringify(list ?? []));
  } catch {
    // αν για κάποιο λόγο αποτύχει (π.χ. quota), απλά το αγνοούμε
  }
}

private loadCompaniesFromStorage(): void {
  try {
    const raw = sessionStorage.getItem(this.COMPANIES_KEY);
    if (!raw) {
      this.companiesSubject.next([]);
      return;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      this.companiesSubject.next(parsed as CompanyAccessItem[]);
    } else {
      this.companiesSubject.next([]);
    }
  } catch {
    // αν κάτι πάει στραβά στο parse, καθάρισε το key και ξεκίνα από άδειο
    sessionStorage.removeItem(this.COMPANIES_KEY);
    this.companiesSubject.next([]);
  }
}

private saveUserToStorage(user: SimpleUser | null): void {
  try {
    if (!user) {
      sessionStorage.removeItem(this.USER_KEY);
    } else {
      sessionStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  } catch {
    // αγνόησέ το αν κάτι πάει στραβά
  }
}

private loadUserFromStorage(): void {
  try {
    const raw = sessionStorage.getItem(this.USER_KEY);
    if (!raw) {
      this.userSubject.next(null);
      return;
    }

    const parsed = JSON.parse(raw) as SimpleUser;
    this.userSubject.next(parsed);
  } catch {
    sessionStorage.removeItem(this.USER_KEY);
    this.userSubject.next(null);
  }
}

/** 
 * Force local logout WITHOUT calling backend.
 * Χρησιμοποιείται όταν:
 * - αποτυγχάνει το refresh στο interceptor
 * - θέλουμε να καθαρίσουμε ΟΛΟ το state άμεσα
 * - το access token είναι άκυρο και δεν εμπιστευόμαστε backend logout
 */
forceLocalLogout(): void {
  // Καθαρισμός όλων των RXJS subjects
  this.tokenSubject.next(null);
  this.userSubject.next(null);
  this.companiesSubject.next([]);
  this.fiscalYearSubject.next(null);

  // Καθαρισμός sessionStorage per-tab
  sessionStorage.removeItem(this.COMPANIES_KEY);
  sessionStorage.removeItem(this.USER_KEY);
  sessionStorage.removeItem(this.ACTIVE_COMPANY_KEY);

  // Full logout θεωρείται → redirect άμεσα σε /login
  this.router.navigateByUrl('/login').catch(() => {});
}


}
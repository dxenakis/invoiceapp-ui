# context.md — Επισκόπηση κώδικα & αρχιτεκτονικής

## Σκοπός
Front‑end Angular εφαρμογή (standalone components) για αυθεντικοποίηση/εγγραφή χρηστών και επιλογή/ενεργοποίηση εταιρείας. Καταναλώνει REST API μέσω `HttpClient` και βασίζεται σε access token στη μνήμη και HttpOnly refresh cookie για silent refresh.
# context.md — Επισκόπηση κώδικα & αρχιτεκτονικής

## Σκοπός
Angular front-end (standalone components) για:
1. αυθεντικοποίηση (login/register) με access token στη μνήμη,
2. silent refresh με HttpOnly refresh cookie,
3. επιλογή/δημιουργία εταιρείας πριν μπει ο χρήστης στο “πραγματικό” κομμάτι της εφαρμογής.

Η εφαρμογή μιλάει με backend REST API (βάση από `environment.apiUrl`).

---

## Τεχνολογίες / βασικές επιλογές
- **Angular (standalone)**: `bootstrapApplication` + `provideRouter`.
- **HttpClient** με interceptor για `Authorization: Bearer ...`.
- **RxJS** (`BehaviorSubject`, observable state) μέσα στο `AuthService`.
- **TypeScript**.
- **Custom CSS** (`styles.css` + css ανά component).
- **Environments** (`src/environments/*.ts`) με `apiUrl`.

---

## Δομή φακέλων (όπως είναι τώρα)

```text
src/
├─ main.ts
├─ index.html
├─ styles.css
├─ environments/
│  ├─ environment.ts
│  └─ environment.production.ts
└─ app/
   ├─ app.component.*          ← root component (έχει RouterOutlet)
   ├─ app.config.ts            ← providers, APP_INITIALIZER για auth bootstrap
   ├─ app.routes.ts            ← δηλώσεις routes (login, register, companies, companies/create, ...)

   ├─ core/
   │  ├─ guards/
   │  │  └─ auth.guard.ts      ← ελέγχει αν έχουμε token, αλλιώς κάνει redirect στο /login
   │  └─ interceptors/
   │     ├─ auth.interceptor.ts   ← βάζει Authorization header, κάνει queue refresh σε 401
   │     └─ auth.interceptor.spec.ts

   ├─ auth/
   │  ├─ auth.models.ts        ← LoginPayload, LoginResponse, CompanyAccessItem, κ.λπ.
   │  ├─ auth.service.ts       ← login, logout, refresh, αποθήκευση εταιρειών, ενεργή εταιρεία
   │  ├─ auth.service.spec.ts
   │  ├─ login/
   │  │  ├─ login.component.ts/.html/.css/.spec.ts
   │  │  └─ φόρμα με username/password, καλεί auth.login, σε επιτυχία → /companies
   │  └─ register/
   │     ├─ register.component.ts/.html/.css/.spec.ts
   │     └─ φόρμα εγγραφής, καλεί αντίστοιχο endpoint, σε επιτυχία → /login

   └─ pages/
      ├─ companies/
      │  ├─ companies.service.ts   ← GET/POST /companies προς backend (base από environment)
      │  ├─ companiesList/
      │  │  ├─ companies.component.ts/.html/.css
      │  │  └─ εμφανίζει τις εταιρείες του χρήστη & κάνει επιλογή εταιρείας μέσω auth service
      │  └─ createcompany/
      │     ├─ createcompany.component.ts/.html/.css
      │     └─ φόρμα δημιουργίας εταιρείας (POST /companies)
      └─ customer/
         └─ (placeholder για μελλοντικές σελίδες)

```

### Κύρια αρχεία
- `src/main.ts`: Bootstrap της εφαρμογής με `appConfig`.
- `src/app/app.config.ts`: Providers (router, http) + `APP_INITIALIZER` που επιχειρεί `auth.refresh()` στην εκκίνηση.
- `src/app/app.routes.ts`: Δηλώνει τις σελίδες **login**, **register**, **companies**. Η **companies** προστατεύεται με `authGuard`.
- `src/environments/*.ts`: Περιβάλλον ανάπτυξης/παραγωγής (apiUrl, flags).
- `src/index.html` & `src/styles.css`: Shell & global στυλ.

## Routing
- `/login` → `LoginComponent`
- `/register` → `RegisterComponent`
- `/companies` → `CompaniesComponent` (guarded)
- `''` & `**` → redirect σε `/login`

## Αυθεντικοποίηση (AuthService)
Το `AuthService` διαχειρίζεται:
- **Access token (in‑memory)**: αποθηκεύεται σε `BehaviorSubject` (χωρίς localStorage).
- **Refresh**: `POST /auth/refresh` με `withCredentials: true` (βασίζεται σε HttpOnly cookie που εκδίδει ο server). Επιστρέφει `{{ token }}`.
- **Login**: `POST /auth/login` με `LoginPayload` ⇒ `LoginResponse` που περιέχει `token` και πιθανές εταιρείες.
- **Logout**: καθαρισμός in‑memory κατάστασης + `POST /auth/logout`.
- **Companies state**: λίστα εταιρειών & active company id σε `sessionStorage` (keys: `companies`, `active_company_id`), με helpers `read*/write*`.
- **Switch company**: `POST /auth/switch-company` με `{{ companyId }}` ⇒ `{{ token }}` με `act_cid` claim.

**Models** (`core/models/auth.models.ts`):
- `LoginPayload`, `LoginResponse`, `RegisterManualPayload`, `RegisterGovPayload`, `RegisterResponse`.
- `CompanyAccessItem` με `companyId`, `companyName`, `Vat`, `role` (όπως έρχεται από backend).

## HTTP Interceptor
`AuthInterceptor`:
- Προσθέτει `Authorization: Bearer <token>` σε requests όταν υπάρχει token.
- Στο `401`:
  - εκτελεί **μοναδικό refresh** (με ουρά/queue για ταυτόχρονα requests),
  - επαναδοκιμάζει το αρχικό request με νέο header,
  - σε αποτυχία: αδειάζει την κατάσταση και καλεί `auth.logout()`.

## Route Guard
`authGuard`:
- Αν υπάρχει token → επιτρέπει πρόσβαση.
- Αλλιώς επιχειρεί `auth.refresh()`· σε αποτυχία κάνει `router.navigateByUrl('/login')` και **μπλοκάρει**.

## Σελίδες
### LoginComponent
- `ReactiveForms` με `username`, `password` (validation).
- Καλεί `auth.login(...)`. Σε επιτυχία → navigate `/companies`. Σε σφάλμα → `errorMsg` από `err.error.message`.
- UI: minimal φόρμα, link προς `/register`.

### RegisterComponent
- `ReactiveForms` με `username`, `email`, `password` (validation).
- Χρησιμοποιεί `auth.register(...)` (aliased σε `registerManual`). Σε επιτυχία → redirect σε `/login`.
- UI: minimal φόρμα, link προς `/login`.

### CompaniesComponent
- Παίρνει τη λίστα εταιρειών από `AuthService` (ή μέσω service κατά βούληση).
- `onSelect(company)` ⇒ `auth.switchCompany(company.companyId)` και μετά navigation (placeholder προς `/companies`).

## Υπηρεσίες
- `AuthService` (βλ. παραπάνω).
- `CompaniesService`: `GET /companies` (λίστα), `POST /companies` (δημιουργία). Η βάση URL είναι `environment.apiUrl`.

## Περιβάλλον/ρυθμίσεις
- `environment.ts` (dev): 
  ```ts
  export const environment = { production: false, apiUrl: 'http://localhost:8080', logging: true };
  ```
- `environment.production.ts`: αντίστοιχη ρύθμιση για prod.

## Ροή εκκίνησης (APP_INITIALIZER)
Κατά το bootstrap:
1. Το `APP_INITIALIZER` εκτελεί `auth.refresh()` για silent login (αν υπάρχει έγκυρο refresh cookie).
2. Αν αποτύχει, η εφαρμογή ξεκινά ως μη‑authenticated· οι protected σελίδες θα ανακατευθύνουν σε `/login`.

## API endpoints που αναμένονται από backend
- `POST /auth/login` ⇒ `{{ token, companies? }}`
- `POST /auth/refresh` ⇒ `{{ token }}` (χρήση HttpOnly cookie)
- `POST /auth/logout` ⇒ 204/200
- `POST /auth/register/manual` ⇒ `{{ token?, companies? }}` (ή μόνο 200)
- `POST /auth/register/gov` ⇒ `{{ token?, companies? }}` (προαιρετικό)
- `POST /auth/switch-company` ⇒ `{{ token }}` με ενεργό `companyId`
- `GET /companies`, `POST /companies`

> Σημείωση: Τα ονόματα πεδίων/τύπων είναι ευθυγραμμισμένα με τα interfaces στα models. Το backend οφείλει να ορίζει/εκδίδει το refresh cookie και να επιστρέφει το νέο access token στις παραπάνω κλήσεις.

## Testing
Υπάρχουν αρχεία `*.spec.ts` για `app.component`, `auth.interceptor`, `auth.service`, `login/register.component` (skeletons).

## To‑do / Σημεία προσοχής
- Συμπλήρωση των τμημάτων που έχουν αποσιωπητικά (`...`) στο repo για πλήρη λειτουργικότητα.
- Επιβεβαίωση claims του JWT (π.χ. `act_cid`) και mapping σε UI.
- Προσθήκη πραγματικού **dashboard** μετά την ενεργοποίηση εταιρείας (τώρα redirectάρει ξανά στο `/companies`).
- Error handling/UX: loading indicators, guard για διπλά clicks, global error toaster.
- Προστασία routes σε βάθος (π.χ. child routes) αν προστεθούν.
- Ενοποίηση λίστας εταιρειών: τρέχουσα αποθήκευση σε `sessionStorage`· εναλλακτικά fetch fresh από backend με `CompaniesService`.

## Οδηγίες εκτέλεσης (γενικές)
- Απαραίτητο Angular CLI & node environment.
- Ρύθμισε `apiUrl` στα environments.
- Εκκίνηση dev server: `ng serve` (ή σύμφωνα με το workspace).
- Το backend πρέπει να σερβίρει CORS με `credentials` και να διαχειρίζεται το refresh cookie.

---

_Το έγγραφο αυτό συνοψίζει την παρούσα δομή και τη ροή αυθεντικοποίησης όπως προκύπτει από τα αρχεία του φακέλου `src/`._

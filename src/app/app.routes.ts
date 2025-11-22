// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { appTenantGuard } from './core/guards/app-tenant.guard';
import { authGuard } from './core/guards/auth.guard';


export const routes: Routes = [
  // PUBLIC SHELL → login / register
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell-public/shell-public.component').then(
        (m) => m.ShellPublicComponent
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        loadComponent: () =>
          import('./auth/login/login.component').then(
            (m) => m.LoginComponent
          ),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./auth/register/register.component').then(
            (m) => m.RegisterComponent
          ),
      },
    ],
  },

  // PRE-TENANT SHELL → /companies, /companies/create
  {
    path: '',
    loadComponent: () =>
      import('./layout/shell-pretenant/shell-pretenant.component').then(
        (m) => m.ShellPretenantComponent
      ),
    canMatch: [authGuard],           // 👈 εδώ μπαίνει ο authGuard
    children: [
      {
        path: 'companies',
        loadComponent: () =>
          import(
            './pages/companies/companiesList/companies.component'
          ).then((m) => m.CompaniesComponent),
      },
      {
        path: 'companies/create',
        loadComponent: () =>
          import(
            './pages/companies/createcompany/createcompany.component'
          ).then((m) => m.CreatecompanyComponent),
      },
    ],
  },
  // TENANT SHELL → /app/...
 {
  path: 'app',
  loadComponent: () =>
    import('./layout/shell-tenant/shell-tenant.component').then(
      (m) => m.ShellTenantComponent
    ),
  canActivateChild: [appTenantGuard],
  children: [
    {
      path: 'dashboard',
      loadComponent: () =>
        import('./pages/dashboard/dashboard.component').then(
          (m) => m.DashboardComponent
        ),
    },
    
    
    // --------- ΕΙΔΗ (ITEMS) ---------
    {
      path: 'items',
      loadComponent: () =>
        import('./pages/items/items-list/items-list.component').then(
          (m) => m.ItemsListComponent
        ),
    },
    {
      path: 'items/new',
      loadComponent: () =>
        import('./pages/items/items-edit/items-edit.component').then(
          (m) => m.ItemsEditComponent
        ),
    },
    {
      path: 'items/:id',
      loadComponent: () =>
        import('./pages/items/items-edit/items-edit.component').then(
          (m) => m.ItemsEditComponent
        ),
    },

    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  ],
},

  // FALLBACK
  { path: '**', redirectTo: 'login' },
];

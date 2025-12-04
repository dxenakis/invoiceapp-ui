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
 // --------- ΠΕΛΑΤΕΣ (CUSTOMERS) ---------
    {
      path: 'customers',
      loadComponent: () =>
        import('./pages/customer/customers-list/customers-list.component').then(
          (m) => m.CustomersListComponent
        ),
    },
    {
      path: 'customers/new',
      loadComponent: () =>
        import('./pages/customer/customers-edit/customers-edit.component').then(
          (m) => m.CustomersEditComponent
        ),
    },
    {
      path: 'customers/:id',
      loadComponent: () =>
        import('./pages/customer/customers-edit/customers-edit.component').then(
          (m) => m.CustomersEditComponent
        ),
    },

 // --------- ΠΡΟΜΗΘΕΥΤΕΣ (SUPPLIERS) ---------
{
      path: 'suppliers',
      loadComponent: () =>
        import('./pages/supplier/suppliers-list/suppliers-list.component').then(
          (m) => m.SuppliersListComponent
        ),
    },
    {
      path: 'suppliers/new',
      loadComponent: () =>
        import('./pages/supplier/suppliers-edit/suppliers-edit.component').then(
          (m) => m.SuppliersEditComponent
        ),
    },
    {
      path: 'suppliers/:id',
      loadComponent: () =>
        import('./pages/supplier/suppliers-edit/suppliers-edit.component').then(
          (m) => m.SuppliersEditComponent
        ),
    },



     // --------- ΠΑΡΑΣΤΑΤΙΚΑ ΠΩΛΗΣΕΩΝ ---------
    {
      path: 'salesdocs',
      loadComponent: () =>
        import('./pages/salesdoc/salesdoc-list/salesdoc-list.component').then(
          (m) => m.SalesdocListComponent
        ),
    },
    {
      path: 'salesdocs/new',
      loadComponent: () =>
        import('./pages/salesdoc/salesdoc-edit/salesdoc-edit.component').then(
          (m) => m.SalesdocEditComponent
        ),
    },
    {
      path: 'salesdocs/:id',
      loadComponent: () =>
        import('./pages/salesdoc/salesdoc-edit/salesdoc-edit.component').then(
          (m) => m.SalesdocEditComponent
        ),
    },



    {
  path: 'settings/company',
  loadComponent: () =>
    import('./pages/company/company-edit/company-edit.component').then(
      (m) => m.CompanyEditComponent
    ),
},
// --------- ΠΑΡΑΜΕΤΡΟΠΟΙΗΣΗ: ΥΠΟΚΑΤΑΣΤΗΜΑ / Α.Χ. ---------
{
  path: 'settings/branch',
  loadComponent: () =>
      import('./pages/branch/branch-list/branch-list.component').then(
    
      (m) => m.BranchListComponent
    ),
},

{
  path: 'settings/branch/:id',
  loadComponent: () =>
    import('./pages/branch/branch-edit/branch-edit.component').then(
      (m) => m.BranchEditComponent
    ),
},
 
{
  path: 'settings/whouse',
  loadComponent: () =>
    import('./pages/whouse/whouse-list/whouse-list.component').then(
      (m) => m.WhouseListComponent
    ),
},
{
  path: 'settings/whouse/:id',
  loadComponent: () =>
    import('./pages/whouse/whouse-edit/whouse-edit.component').then(
      (m) => m.WhouseEditComponent
    ),
},

// μέσα στα children του ShellAppComponent, στο group "settings"
{
  path: 'settings/document-types',
  loadComponent: () =>
    import('./pages/document-types/document-types-list/document-types-list.component').then(
      (m) => m.DocumentTypesListComponent
    ),
},
{
  path: 'settings/document-types/:id',
  loadComponent: () =>
    import('./pages/document-types/document-types-edit/document-types-edit.component').then(
      (m) => m.DocumentTypesEditComponent
    ),
},


    { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  ],
},

  // FALLBACK
  { path: '**', redirectTo: 'login' },
];

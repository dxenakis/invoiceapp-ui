import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent} from '../topbar/topbar.component'; // προσαρμοσε το path
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-shell-pretenant',
  imports: [CommonModule, RouterOutlet, TopbarComponent],
  template: `
    <app-topbar
      [publicMode]="false"
      [preTenantMode]="true"
      [user]="auth.user$ | async"
      [companies]="(auth.companies$ | async) ?? []"
      [activeCompanyId]="auth.activeCompany$ | async"
      [fiscalYear]="auth.fiscalYear$ | async"
      (selectCompany)="onSelectCompany($event)"
      (logout)="onLogout()"
    ></app-topbar>

    <router-outlet></router-outlet>
  `,
})
export class ShellPretenantComponent {
  auth = inject(AuthService);

  onSelectCompany(id: number) {
    this.auth.switchCompany(id).subscribe();
  }

  onLogout() {
    this.auth.logout().subscribe();
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TopbarComponent } from '../topbar/topbar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  standalone: true,
  selector: 'app-shell-tenant',
  imports: [CommonModule, RouterOutlet, TopbarComponent, SidebarComponent],
  templateUrl: './shell-tenant.component.html',
  styleUrls: ['./shell-tenant.component.css'],
})
export class ShellTenantComponent {
  private auth = inject(AuthService);

  // observables για το topbar
  user$ = this.auth.user$;
  companies$ = this.auth.companies$;
  activeCompanyId$ = this.auth.activeCompany$;
  fiscalYear$ = this.auth.fiscalYear$;

  onSelectCompany(id: number) {
    this.auth.switchCompany(id).subscribe();
  }

  onLogout() {
    this.auth.logout().subscribe();
  }
}

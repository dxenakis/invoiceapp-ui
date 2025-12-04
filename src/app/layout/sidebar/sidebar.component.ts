// src/app/layout/sidebar/sidebar.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { combineLatest, map, Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent {
  private auth = inject(AuthService);

  // streams από AuthService (αν δεν τα θες, μπορείς να τα σβήσεις)
  user$ = this.auth.user$;
  companies$ = this.auth.companies$;
  activeCompanyId$ = this.auth.activeCompany$;

  // όλο το sidebar μαζεμένο/ανοιχτό
  isCollapsed = false;

  // accordion sections
  isMasterOpen = true;
  isDocsOpen = true;
  isSettingsOpen = true;

  // εμφανίζουμε Παραμετροποίηση μόνο για ADMIN / COMPANY_ADMIN στην active εταιρεία
  canManageCompanySettings$: Observable<boolean> = combineLatest([
    this.companies$,
    this.activeCompanyId$,
  ]).pipe(
    map(([companies, activeId]) => {
      if (!activeId) return false;
      const current = companies.find((c) => c.companyId === activeId);
      if (!current) return false;

      const role = (current.role || '').toUpperCase();
      return role === 'ADMIN' || role === 'COMPANY_ADMIN';
    })
  );

  // κουμπί πάνω-αριστερά: μαζεύει/ανοίγει το sidebar
  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  // κλικ στον φάκελο: ανοιγοκλείνει την ενότητα
  toggleSection(section: 'master' | 'docs' | 'settings') {
    switch (section) {
      case 'master':
        this.isMasterOpen = !this.isMasterOpen;
        break;
      case 'docs':
        this.isDocsOpen = !this.isDocsOpen;
        break;
      case 'settings':
        this.isSettingsOpen = !this.isSettingsOpen;
        break;
    }
  }
}

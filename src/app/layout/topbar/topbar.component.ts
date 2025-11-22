import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // για ngModel
import { CompanyAccessItem } from '../../auth/auth.models'; // σωστό path
import { SimpleUser } from '../../auth/auth.service';       // ή όπου το έχεις

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.scss'],
})
export class TopbarComponent {
  @Input() publicMode = false;         // public: login/register buttons
  @Input() preTenantMode = false;      // login done, πριν την επιλογή εταιρείας
  private router = inject(Router);
  @Input() user: SimpleUser | null = null;

  // Δώσε αυστηρό default: ΠΑΝΤΑ array (όχι null/undefined)
  @Input() companies: CompanyAccessItem[] = [];

  @Input() activeCompanyId: number | null = null;

  // Αν δεν έχεις ακόμη FY, άστο string|null
  @Input() fiscalYear: string | null = null;

  @Output() selectCompany = new EventEmitter<number>();
  @Output() logout = new EventEmitter<void>();

  get displayName(): string {
    if (!this.user) return '?';
    return (
      this.user.fullname ||
      this.user.username ||
      '?'
    );
  }

  onSelectCompany(id: number) {
    if (id != null) this.selectCompany.emit(+id);
    this.router.navigateByUrl('/app/dashboard');
    
  }
}

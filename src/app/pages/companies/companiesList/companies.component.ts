// src/app/pages/companies/companies.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { CompanyAccessItem } from '../../../auth/auth.models';
import { CompaniesService } from '../companies.service'; // κρατάμε το import αν το χρειαστείς αλλού

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {
  private auth = inject(AuthService);
  private router = inject(Router);
  private companiesService = inject(CompaniesService); // προς το παρόν δεν το χρησιμοποιούμε, αλλά το κρατάς

  companies: CompanyAccessItem[] = [];
  loading = false;
  errorMsg = '';

  ngOnInit(): void {
    // 1) Πάρε ό,τι έχει ήδη ο AuthService στη μνήμη (από sessionStorage στο bootstrap)
    const cached = this.auth.companies;
    if (cached && cached.length) {
      this.companies = cached;
      return; // έχουμε ήδη εταιρείες, δεν χρειάζεται /auth/me
    }

    // 2) Νέο tab / πρώτη φορά → φέρε user + companies από /auth/me
    this.loading = true;
    this.errorMsg = '';

    this.auth.me().subscribe({
      next: () => {
        // το me() έχει ήδη γεμίσει το state στον AuthService
        this.companies = this.auth.companies;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg =
          err?.error?.message || 'Αποτυχία φόρτωσης στοιχείων χρήστη/εταιρειών';
      }
    });
  }

  onSelect(c: CompanyAccessItem): void {
    this.loading = true;
    this.errorMsg = '';

    this.auth.switchCompany(c.companyId).subscribe({
      next: () => {
        this.loading = false;
        // τώρα έχεις access token με act_cid = c.companyId
        this.router.navigateByUrl('/app/dashboard');
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMsg =
          err?.error?.message || 'Αδυναμία ενεργοποίησης εταιρείας';
      }
    });
  }
}

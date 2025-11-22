// src/app/pages/createcompany/createcompany.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  Validators,
  FormBuilder,
  NonNullableFormBuilder,
  ReactiveFormsModule
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  CompaniesService,
  CompanyCreateRequest,
  CompanyResponse
} from '../companies.service';
import { AuthService } from '../../../auth/auth.service';
import { CompanyAccessItem } from '../../../auth/auth.models';

@Component({
  selector: 'app-createcompany',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './createcompany.component.html',
  styleUrls: ['./createcompany.component.css']
})
export class CreatecompanyComponent {
  private fb: NonNullableFormBuilder = inject(FormBuilder).nonNullable;
  private router = inject(Router);
  private companiesService = inject(CompaniesService);
  private auth = inject(AuthService);

  submitting = signal(false);
  serverError = signal<string | null>(null);

  // Φόρμα με τα πεδία που περιμένει το backend
  form: FormGroup<{
    name: any;
    afm: any;
    addressLine: any;
    city: any;
    postalCode: any;
    countryCode: any;
    email: any;
    phone: any;
  }> = this.fb.group({
    name: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(2)]
    }),
    afm: this.fb.control('', {
      // ελληνικό ΑΦΜ = 9 ψηφία (προσαρμόζεις όπως θες)
      validators: [Validators.pattern(/^\d{9}$/)]
    }),
    addressLine: this.fb.control(''),
    city: this.fb.control(''),
    postalCode: this.fb.control(''),
    countryCode: this.fb.control(''),
    email: this.fb.control('', { validators: [Validators.email] }),
    phone: this.fb.control('')
  });

  get f() {
    return this.form.controls;
  }

  onSubmit() {
    this.serverError.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const payload = this.form.getRawValue() as unknown as CompanyCreateRequest;

    this.companiesService.create(payload).subscribe({
      next: (created: CompanyResponse) => {
        // map από API -> CompanyAccessItem
        const item: CompanyAccessItem = {
          companyId: (created as any).companyId ?? (created as any).id,
          companyName: (created as any).companyName ?? (created as any).name,
          Vat: (created as any).vat ?? (created as any).Vat ?? '',
          role: (created as any).role ?? 'owner'
        };

        // πάρε την τρέχουσα λίστα από τον AuthService
        const current = this.auth.companies ?? [];

        // φτιάξε καινούργια λίστα με την καινούργια εταιρεία στην αρχή
        const updated = [item, ...current];

        // ενημέρωσε το κεντρικό state
        this.auth.updateCompaniesFromBackend(updated);

        this.submitting.set(false);
        // πήγαινε στη λίστα εταιρειών
        this.router.navigate(['/companies']);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.serverError.set(
          err.error?.message || 'Αποτυχία δημιουργίας εταιρείας'
        );
      }
    });
  }

  onCancel() {
    this.router.navigate(['/companies']);
  }
}

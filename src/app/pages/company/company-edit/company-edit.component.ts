// src/app/pages/company/company-edit/company-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompanyService } from '../company.service';
import { CompanyRequest, CompanyResponse } from '../company.models';
import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';

@Component({
  standalone: true,
  selector: 'app-company-edit',
  templateUrl: './company-edit.component.html',
  styleUrls: ['./company-edit.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudFormToolbarComponent],
})
export class CompanyEditComponent implements OnInit {
  loading = false;
  saving = false;
  error: string | null = null;
  success: string | null = null;

  companyId: number | null = null;

  model: CompanyRequest = {
    afm: '',
    name: '',
    addressLine: '',
    city: '',
    postalCode: '',
    countryCode: 'GR',
    email: '',
    phone: '',
  };

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loadActiveCompany();
  }

  /** Φόρτωση ενεργής εταιρείας από το backend */
  loadActiveCompany(): void {
    this.loading = true;
    this.error = null;

    this.companyService.getActive().subscribe({
      next: (res: CompanyResponse) => {
        this.companyId = res.id;
        this.model = {
          afm: res.afm,
          name: res.name,
          addressLine: res.addressLine ?? '',
          city: res.city ?? '',
          postalCode: res.postalCode ?? '',
          countryCode: res.countryCode ?? 'GR',
          email: res.email ?? '',
          phone: res.phone ?? '',
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading company', err);
        this.error = 'Αποτυχία φόρτωσης εταιρείας.';
        this.loading = false;
      },
    });
  }

  /** Αποθήκευση αλλαγών */
  save(): void {
    this.error = null;
    this.success = null;

    if (!this.companyId) {
      this.error = 'Δεν βρέθηκε εταιρεία για επεξεργασία.';
      return;
    }

    // Λίγος basic έλεγχος
    if (!this.model.name || !this.model.afm) {
      this.error = 'Συμπλήρωσε τουλάχιστον Επωνυμία και ΑΦΜ.';
      return;
    }

    this.saving = true;
    this.companyService.update(this.companyId, this.model).subscribe({
      next: (res) => {
        this.success = 'Η εταιρεία αποθηκεύτηκε με επιτυχία.';
        this.saving = false;
        // update local model if server κάνει normalize τα data
        this.model = {
          afm: res.afm,
          name: res.name,
          addressLine: res.addressLine ?? '',
          city: res.city ?? '',
          postalCode: res.postalCode ?? '',
          countryCode: res.countryCode ?? 'GR',
          email: res.email ?? '',
          phone: res.phone ?? '',
        };
      },
      error: (err) => {
        console.error('Error saving company', err);
        this.error = 'Αποτυχία αποθήκευσης εταιρείας.';
        this.saving = false;
      },
    });
  }

  /** Ακύρωση → ξαναφορτώνουμε από server */
  cancel(): void {
    this.loadActiveCompany();
  }
}

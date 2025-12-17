// src/app/pages/supplier/suppliers-edit/suppliers-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupsService, CountryLookup } from '../../../core/services/lookups.service';
import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';
import { SuppliersService } from '../suppliers.service';
import { SupplierRequest, SupplierResponse } from '../supplier.models';

@Component({
  standalone: true,
  selector: 'app-suppliers-edit',
  templateUrl: './suppliers-edit.component.html',
  styleUrls: ['./suppliers-edit.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudFormToolbarComponent],
})
export class SuppliersEditComponent implements OnInit {
  supplierId?: number;

  model: SupplierRequest = {
    code: '',
    name: '',
    phone: '',
    cellphone: '',
    email:'',
    address: '',
    city: '',
    zip: '',
    countryId: null,
  };
  countries: CountryLookup[] = [];
  loading = false;
  saving = false;
  error?: string;

  countryName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private suppliersService: SuppliersService,
    private lookups: LookupsService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.supplierId = +idParam;
      this.loadSupplier(this.supplierId);
    }
     this.lookups.getCountries().subscribe({
    next: (countries) => {
      this.countries = countries ?? [];
    },
    error: (err) => {
      console.error('Αποτυχία φόρτωσης χωρών', err);
      this.countries = [];
    },
  });
  }

  loadSupplier(id: number): void {
    this.loading = true;
    this.suppliersService.get(id).subscribe({
      next: (res: SupplierResponse) => {
        this.model = {
          code: res.code,
          name: res.name,
          phone: res.phone ?? '',
          cellphone: res.cellphone ?? '',
          email: res.email ?? '',
          address: res.address ?? '',
          city: res.city ?? '',
          zip: res.zip ?? '',
          countryId: res.countryId ?? null,
        };

        this.countryName = res.countryName ?? null;
        this.createdAt = res.createdAt ?? null;
        this.updatedAt = res.updatedAt ?? null;

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Αποτυχία φόρτωσης προμηθευτή.';
        this.loading = false;
      },
    });
  }

  save(): void {
    this.saving = true;
    this.error = undefined;

    if (!this.model.code.trim() || !this.model.name.trim() || !this.model.countryId) {
      this.error = 'Συμπλήρωσε Κωδικό, Επωνυμία και Χώρα (ID).';
      this.saving = false;
      return;
    }

    const req: SupplierRequest = { ...this.model };

    const obs = this.supplierId
      ? this.suppliersService.update(this.supplierId, req)
      : this.suppliersService.create(req);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/suppliers']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Αποτυχία αποθήκευσης.';
        this.saving = false;
      },
    });
  }

  deleteSupplier(): void {
    if (!this.supplierId) return;

    if (!confirm('Θέλεις σίγουρα να διαγράψεις αυτόν τον προμηθευτή;')) {
      return;
    }

    this.saving = true;

    this.suppliersService.delete(this.supplierId).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/suppliers']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Αποτυχία διαγραφής.';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/suppliers']);
  }
}

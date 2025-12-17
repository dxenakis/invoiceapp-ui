// src/app/pages/customer/customers-edit/customers-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LookupsService, CountryLookup } from '../../../core/services/lookups.service';
import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';
import { CustomersService } from '../customers.service';
import { CustomerRequest, CustomerResponse } from '../customer.models';

@Component({
  standalone: true,
  selector: 'app-customers-edit',
  templateUrl: './customers-edit.component.html',
  styleUrls: ['./customers-edit.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudFormToolbarComponent],
})
export class CustomersEditComponent implements OnInit {
  customerId?: number;

  model: CustomerRequest = {
    code: '',
    name: '',
    phone: '',
    cellphone: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    countryId: null,
  };  
  countries: CountryLookup[] = [];
  loading = false;
  saving = false;
  error?: string;

  // μόνο για εμφάνιση
  countryName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customersService: CustomersService,
    private lookups: LookupsService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.customerId = +idParam;
      this.loadCustomer(this.customerId);
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

  loadCustomer(id: number): void {
    this.loading = true;
    this.customersService.get(id).subscribe({
      next: (res: CustomerResponse) => {
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
        this.error = 'Αποτυχία φόρτωσης πελάτη.';
        this.loading = false;
      },
    });
  }

  save(): void {
    this.saving = true;
    this.error = undefined;

    // basic client-side validation για τα required του backend
    if (!this.model.code.trim() || !this.model.name.trim() || !this.model.countryId) {
      this.error = 'Συμπλήρωσε Κωδικό, Επωνυμία και Χώρα (ID).';
      this.saving = false;
      return;
    }

    const req: CustomerRequest = { ...this.model };

    const obs = this.customerId
      ? this.customersService.update(this.customerId, req)
      
      : this.customersService.create(req);
   
     console.log(req)
   
      obs.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/customers']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Αποτυχία αποθήκευσης.';
        this.saving = false;
      },
    });
  }

  deleteCustomer(): void {
    if (!this.customerId) {
      return;
    }

    if (!confirm('Θέλεις σίγουρα να διαγράψεις αυτόν τον πελάτη;')) {
      return;
    }

    this.saving = true;

    this.customersService.delete(this.customerId).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/customers']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Αποτυχία διαγραφής.';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/customers']);
  }
}

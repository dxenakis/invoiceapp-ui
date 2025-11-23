// src/app/pages/customer/customers-list/customers-list.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrudToolbarComponent } from '../../../layout/crud-toolbar/crud-toolbar.component';
import { CustomersService } from '../customers.service';
import { CustomerResponse, Page } from '../customer.models';

@Component({
  standalone: true,
  selector: 'app-customers-list',
  templateUrl: './customers-list.component.html',
  styleUrls: ['./customers-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudToolbarComponent],
})
export class CustomersListComponent implements OnInit {
  page?: Page<CustomerResponse>;
  loading = false;
  error?: string;
  searchTerm = '';

  // για επιλογή γραμμής (softone-like)
  selectedCustomer: CustomerResponse | null = null;

  constructor(
    private customersService: CustomersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    this.loading = true;
    this.error = undefined;

    this.customersService.list(pageIndex, 20).subscribe({
      next: (res) => {
        this.page = res;
        this.loading = false;

        // αν υπάρχει ήδη επιλεγμένος πελάτης, προσπαθούμε να τον κρατήσουμε
        if (this.selectedCustomer && this.page) {
          const found = this.page.content.find(
            (c) => c.id === this.selectedCustomer!.id
          );
          this.selectedCustomer = found ?? null;
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Κάτι πήγε στραβά κατά την ανάκτηση των πελατών.';
        this.loading = false;
      },
    });
  }

  get filteredCustomers(): CustomerResponse[] {
    if (!this.page) return [];
    if (!this.searchTerm.trim()) return this.page.content;

    const term = this.searchTerm.toLowerCase();
    return this.page.content.filter((c) => {
      return (
        c.code.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        (c.phone && c.phone.toLowerCase().includes(term)) ||
        (c.city && c.city.toLowerCase().includes(term)) ||
        (c.countryName && c.countryName.toLowerCase().includes(term))
      );
    });
  }

  newCustomer(): void {
    this.router.navigate(['/app/customers/new']);
  }

  editCustomer(customer: CustomerResponse): void {
    this.router.navigate(['/app/customers', customer.id]);
  }

  deleteCustomer(customer: CustomerResponse): void {
    if (
      !confirm(
        `Θέλεις σίγουρα να διαγράψεις τον πελάτη "${customer.name}" ;`
      )
    ) {
      return;
    }

    this.customersService.delete(customer.id).subscribe({
      next: () => {
        this.loadPage(this.page?.number ?? 0);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Αποτυχία διαγραφής.';
      },
    });
  }

  // single-click: μόνο επιλογή γραμμής
  selectCustomer(customer: CustomerResponse): void {
    this.selectedCustomer = customer;
  }

  printCustomers(): void {
    // TODO: πραγματική εκτύπωση
    console.log('Print customers');
  }

  exportCustomers(): void {
    // TODO: export σε Excel
    console.log('Export customers to Excel');
  }
}

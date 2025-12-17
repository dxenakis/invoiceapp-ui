// src/app/pages/supplier/suppliers-list/suppliers-list.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrudToolbarComponent } from '../../../layout/crud-toolbar/crud-toolbar.component';
import { SuppliersService } from '../suppliers.service';
import { SupplierResponse, Page } from '../supplier.models';

@Component({
  standalone: true,
  selector: 'app-suppliers-list',
  templateUrl: './suppliers-list.component.html',
  styleUrls: ['./suppliers-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudToolbarComponent],
})
export class SuppliersListComponent implements OnInit {
  page?: Page<SupplierResponse>;
  loading = false;
  error?: string;
  searchTerm = '';

  selectedSupplier: SupplierResponse | null = null;

  constructor(
    private suppliersService: SuppliersService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    this.loading = true;
    this.error = undefined;

    this.suppliersService.list(pageIndex, 20).subscribe({
      next: (res) => {
        this.page = res;
        this.loading = false;

        if (this.selectedSupplier && this.page) {
          const found = this.page.content.find(
            (c) => c.id === this.selectedSupplier!.id
          );
          this.selectedSupplier = found ?? null;
        }
      },
      error: (err) => {
        console.error(err);
        this.error = 'Κάτι πήγε στραβά κατά την ανάκτηση των προμηθευτών.';
        this.loading = false;
      },
    });
  }

  get filteredSuppliers(): SupplierResponse[] {
    if (!this.page) return [];
    if (!this.searchTerm.trim()) return this.page.content;

    const term = this.searchTerm.toLowerCase();
    return this.page.content.filter((c) => {
      return (
        c.code.toLowerCase().includes(term) ||
        c.name.toLowerCase().includes(term) ||
        (c.phone && c.phone.toLowerCase().includes(term)) ||
        (c.cellphone && c.cellphone.toLowerCase().includes(term)) ||
        (c.city && c.city.toLowerCase().includes(term)) ||
        (c.countryName && c.countryName.toLowerCase().includes(term))
      );
    });
  }

  newSupplier(): void {
    this.router.navigate(['/app/suppliers/new']);
  }

  editSupplier(supplier: SupplierResponse): void {
    this.router.navigate(['/app/suppliers', supplier.id]);
  }

  deleteSupplier(supplier: SupplierResponse): void {
    if (
      !confirm(
        `Θέλεις σίγουρα να διαγράψεις τον προμηθευτή "${supplier.name}" ;`
      )
    ) {
      return;
    }

    this.suppliersService.delete(supplier.id).subscribe({
      next: () => {
        this.loadPage(this.page?.number ?? 0);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Αποτυχία διαγραφής.';
      },
    });
  }

  selectSupplier(supplier: SupplierResponse): void {
    this.selectedSupplier = supplier;
  }

  printSuppliers(): void {
    console.log('Print suppliers');
  }

  exportSuppliers(): void {
    console.log('Export suppliers to Excel');
  }
}

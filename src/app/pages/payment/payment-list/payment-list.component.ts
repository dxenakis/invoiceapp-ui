// src/app/pages/payment/payment-list/payment-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrudToolbarComponent } from '../../../layout/crud-toolbar/crud-toolbar.component';
import { PaymentService } from '../payment.service';
import {
  Page,
  PaymentMethodResponse,
  mydataPaymentLabel,
} from '../payment.models';

@Component({
  standalone: true,
  selector: 'app-payment-list',
  templateUrl: './payment-list.component.html',
  styleUrls: ['./payment-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudToolbarComponent],
})
export class PaymentListComponent implements OnInit {
  page: Page<PaymentMethodResponse> | null = null;
  loading = false;
  error: string | null = null;

  pageSize = 20;
  searchTerm = '';
  selectedPayment: PaymentMethodResponse | null = null;

  constructor(
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    this.loading = true;
    this.error = null;

    this.paymentService.list(pageIndex, this.pageSize, null).subscribe({
      next: (res) => {
        this.page = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payment methods', err);
        this.error = 'Αποτυχία φόρτωσης τρόπων πληρωμής.';
        this.loading = false;
      },
    });
  }

  get filteredPayments(): PaymentMethodResponse[] {
    if (!this.page) return [];
    if (!this.searchTerm.trim()) return this.page.content;

    const term = this.searchTerm.toLowerCase();
    return this.page.content.filter((p) => {
      const label = mydataPaymentLabel(p.mydataMethodCode).toLowerCase();
      return (
        (p.code && p.code.toLowerCase().includes(term)) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        label.includes(term)
      );
    });
  }

  newPayment(): void {
    this.router.navigate(['/app/settings/payments', 'new']);
  }

  editPayment(p: PaymentMethodResponse): void {
    this.router.navigate(['/app/settings/payments', p.id]);
  }

  selectPayment(p: PaymentMethodResponse): void {
    this.selectedPayment = p;
  }

  // placeholder για μελλοντική υλοποίηση
  printPayments(): void {
    console.log('Print payments');
  }

  exportPayments(): void {
    console.log('Export payments');
  }

  mydataLabel(code: number | null): string {
    return mydataPaymentLabel(code);
  }
}

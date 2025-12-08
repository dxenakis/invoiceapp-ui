// src/app/pages/payment/payment-edit/payment-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';
import {
  MYDATA_PAYMENT_METHODS,
  MydataPaymentMethodLookup,
  PaymentMethodRequest,
  PaymentMethodResponse,
} from '../payment.models';
import { PaymentService } from '../payment.service';

@Component({
  standalone: true,
  selector: 'app-payment-edit',
  templateUrl: './payment-edit.component.html',
  styleUrls: ['./payment-edit.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudFormToolbarComponent],
})
export class PaymentEditComponent implements OnInit {
  paymentId: number | null = null;
  model: PaymentMethodRequest = {
    code: '',
    description: '',
    mydataMethodCode: null,
    active: true,
  };

  saving = false;
  loading = false;
  error: string | null = null;

  mydataOptions: MydataPaymentMethodLookup[] = MYDATA_PAYMENT_METHODS;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.paymentId = Number(idParam);
      this.loadPayment(this.paymentId);
    }
  }

  private loadPayment(id: number): void {
    this.loading = true;
    this.error = null;

    this.paymentService.get(id).subscribe({
      next: (res: PaymentMethodResponse) => {
        this.model = {
          code: res.code,
          description: res.description,
          mydataMethodCode: res.mydataMethodCode,
          active: res.active,
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading payment method', err);
        this.error = 'Αποτυχία φόρτωσης τρόπου πληρωμής.';
        this.loading = false;
      },
    });
  }

  save(): void {
    if (!this.model.code || !this.model.code.trim()) {
      this.error = 'Ο κωδικός είναι υποχρεωτικός.';
      return;
    }

    this.saving = true;
    this.error = null;

    const payload: PaymentMethodRequest = {
      ...this.model,
      code: this.model.code.trim(),
    };

    const request$ = this.paymentId
      ? this.paymentService.update(this.paymentId, payload)
      : this.paymentService.create(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/settings/payments']);
      },
      error: (err) => {
        console.error('Error saving payment method', err);
        this.error = 'Αποτυχία αποθήκευσης.';
        this.saving = false;
      },
    });
  }

  delete(): void {
    if (!this.paymentId) return;
    if (!confirm('Σίγουρα θέλεις να διαγράψεις τον τρόπο πληρωμής;')) return;

    this.saving = true;
    this.error = null;

    this.paymentService.delete(this.paymentId).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/settings/payments']);
      },
      error: (err) => {
        console.error('Error deleting payment method', err);
        this.error = 'Αποτυχία διαγραφής.';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/settings/payments']);
  }
}

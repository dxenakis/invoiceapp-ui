// src/app/pages/payment/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Page,
  PaymentMethodRequest,
  PaymentMethodResponse,
} from './payment.models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly baseUrl = `${environment.apiUrl}/payment-methods`;

  constructor(private http: HttpClient) {}

  list(
    page = 0,
    size = 20,
    activeOnly: boolean | null = null
  ): Observable<Page<PaymentMethodResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (activeOnly !== null) {
      params = params.set('activeOnly', activeOnly);
    }

    return this.http.get<Page<PaymentMethodResponse>>(this.baseUrl, {
      params,
    });
  }

  get(id: number): Observable<PaymentMethodResponse> {
    return this.http.get<PaymentMethodResponse>(`${this.baseUrl}/${id}`);
  }

  create(req: PaymentMethodRequest): Observable<PaymentMethodResponse> {
    const payload: PaymentMethodRequest = { ...req };
    return this.http.post<PaymentMethodResponse>(this.baseUrl, payload);
  }

  update(
    id: number,
    req: PaymentMethodRequest
  ): Observable<PaymentMethodResponse> {
    const payload: PaymentMethodRequest = { ...req };
    return this.http.put<PaymentMethodResponse>(
      `${this.baseUrl}/${id}`,
      payload
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // optional endpoint από backend: /payment-methods/seed-defaults
  seedDefaults(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/seed-defaults`, {});
  }
}

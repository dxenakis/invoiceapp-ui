// src/app/pages/customer/customers.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerRequest, CustomerResponse, Page } from './customer.models';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly baseUrl = `${environment.apiUrl}/api/customers`;

  constructor(private http: HttpClient) {}

  list(page = 0, size = 20): Observable<Page<CustomerResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    // Αν θελήσεις server-side search, μπορείς να κάνεις:
    // if (search) { params = params.set('search', search); }
    return this.http.get<Page<CustomerResponse>>(this.baseUrl, { params });
  }

  get(id: number): Observable<CustomerResponse> {
    return this.http.get<CustomerResponse>(`${this.baseUrl}/${id}`);
  }

  create(req: CustomerRequest): Observable<CustomerResponse> {
    // στο TraderRequestDto δεν υπάρχουν createdAt/updatedAt, τα διαχειρίζεται ο server
    const payload: CustomerRequest = { ...req };
    return this.http.post<CustomerResponse>(this.baseUrl, payload);
  }

  update(id: number, req: CustomerRequest): Observable<CustomerResponse> {
    const payload: CustomerRequest = { ...req };
    return this.http.put<CustomerResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

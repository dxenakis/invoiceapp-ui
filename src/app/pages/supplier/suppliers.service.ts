// src/app/pages/supplier/suppliers.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupplierRequest, SupplierResponse, Page } from './supplier.models';

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private readonly baseUrl = `${environment.apiUrl}/api/suppliers`;

  constructor(private http: HttpClient) {}

  list(page = 0, size = 20): Observable<Page<SupplierResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<SupplierResponse>>(this.baseUrl, { params });
  }

  get(id: number): Observable<SupplierResponse> {
    return this.http.get<SupplierResponse>(`${this.baseUrl}/${id}`);
  }

  create(req: SupplierRequest): Observable<SupplierResponse> {
    const payload: SupplierRequest = { ...req };
    return this.http.post<SupplierResponse>(this.baseUrl, payload);
  }

  update(id: number, req: SupplierRequest): Observable<SupplierResponse> {
    const payload: SupplierRequest = { ...req };
    return this.http.put<SupplierResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

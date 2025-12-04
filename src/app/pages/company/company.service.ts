// src/app/pages/company/company.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { CompanyRequest, CompanyResponse } from './company.models';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  // Για το CompanyController που είναι στο /companies (χωρίς /api)
  private readonly baseUrl = `${environment.apiUrl}/companies`;

  constructor(private http: HttpClient) {}

  /** Επιστρέφει την ενεργή εταιρεία του χρήστη (backend: GET /companies/active) */
  getActive(): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.baseUrl}/active`);
  }

  /** Ενημέρωση εταιρείας (θα χρειαστεί PUT /companies/{id} στο backend) */
  update(id: number, req: CompanyRequest): Observable<CompanyResponse> {
    return this.http.put<CompanyResponse>(`${this.baseUrl}/${id}`, req);
  }
}

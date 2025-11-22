// src/app/services/companies.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export type CompanyCreateRequest = {
  name: string;
  afm?: string;
  addressLine?: string;
  city?: string;
  postalCode?: string;
  countryCode?: string;
  email?: string;
  phone?: string;
};

export type CompanyResponse = {
  id: number;         // ή companyId
  name: string;       // ή companyName
  vatNumber?: string;       // ή Vat
  role?: string;
};

@Injectable({ providedIn: 'root' })
export class CompaniesService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;


  // [ΝΕΟ] Λίστα εταιρειών
  list(): Observable<CompanyResponse[]> {
    return this.http.get<CompanyResponse[]>(`${this.base}/companies`, { withCredentials: true });
  }

// [ΥΠΑΡΧΟΝ] Δημιουργία (φέρε το σε πλήρη μορφή)
  create(payload: CompanyCreateRequest): Observable<CompanyResponse> {
    return this.http.post<CompanyResponse>(`${this.base}/companies`, payload, { withCredentials: true });
  }

  // (προαιρετικά, αν τα χρειαστείς στο μέλλον)
  // get(id: number): Observable<CompanyResponse> {
  //   return this.http.get<CompanyResponse>(`${this.base}/companies/${id}`);
  // }
  // update(id: number, payload: Partial<CompanyCreateRequest>): Observable<CompanyResponse> {
  //   return this.http.put<CompanyResponse>(`${this.base}/companies/${id}`, payload);
  // }
  // delete(id: number): Observable<void> {
  //   return this.http.delete<void>(`${this.base}/companies/${id}`);
  // }
}

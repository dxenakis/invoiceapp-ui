// src/app/pages/document-types/document-types.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DocumentTypeRequest,
  DocumentTypeResponse,
  Page,
} from './document-types.models';

@Injectable({ providedIn: 'root' })
export class DocumentTypesService {
  private readonly baseUrl = `${environment.apiUrl}/documenttypes`;

  constructor(private http: HttpClient) {}

  list(page = 0, size = 20): Observable<Page<DocumentTypeResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    // Αν αργότερα θέλεις filter by domain, μπορούμε να το προσθέσουμε εδώ.
    return this.http.get<Page<DocumentTypeResponse>>(this.baseUrl, { params });
  }

  getById(id: number): Observable<DocumentTypeResponse> {
    return this.http.get<DocumentTypeResponse>(`${this.baseUrl}/${id}`);
  }

  create(req: DocumentTypeRequest): Observable<DocumentTypeResponse> {
    const payload: DocumentTypeRequest = { ...req };
    return this.http.post<DocumentTypeResponse>(this.baseUrl, payload);
  }

  update(id: number, req: DocumentTypeRequest): Observable<DocumentTypeResponse> {
    const payload: DocumentTypeRequest = { ...req };
    return this.http.put<DocumentTypeResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

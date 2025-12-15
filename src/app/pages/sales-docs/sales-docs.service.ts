// src/app/pages/sales-docs/sales-docs.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

import {
  FindocResponse,
  FindocSaveRequest,
  Page,
} from './sales-docs.models';

@Injectable({ providedIn: 'root' })
export class SalesDocsService {
  // Backend: @RequestMapping("/api/findocs")  ->  εδώ θα πάμε στο /api/findocs
  private readonly baseUrl = `${environment.apiUrl}/findocs`;

  constructor(private http: HttpClient) {}

  /**
   * Λίστα παραστατικών με σελιδοποίηση.
   * GET /api/findocs?page=0&size=20
   */
  list(page = 0, size = 20): Observable<Page<FindocResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<FindocResponse>>(this.baseUrl, { params });
  }

  /**
   * Ανάγνωση παραστατικού.
   * GET /api/findocs/{id}
   */
  getById(id: number): Observable<FindocResponse> {
    return this.http.get<FindocResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Μαζική καταχώρηση παραστατικού (header + mtrdoc + mtrlines).
   *
   * Backend:
   *   @PostMapping("/full")
   *   public ResponseEntity<FindocResponse> save(@RequestBody FindocSaveRequest req)
   *
   * Αν req.id == null  -> νέο παραστατικό
   * Αν req.id != null  -> update υπάρχοντος (σύμφωνα με τη λογική σου στο service)
   */
  save(req: FindocSaveRequest): Observable<FindocResponse> {
    return this.http.post<FindocResponse>(`${this.baseUrl}/full`, req);
  }
}

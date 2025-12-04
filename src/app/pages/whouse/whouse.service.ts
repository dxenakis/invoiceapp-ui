// src/app/pages/whouse/whouse.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page, WhouseRequest, WhouseResponse } from './whouse.models';

@Injectable({ providedIn: 'root' })
export class WhouseService {
  private readonly baseUrl = `${environment.apiUrl}/whouses`;

  constructor(private http: HttpClient) {}

  list(
    page = 0,
    size = 20,
    onlyActive: boolean | null = null,
    branchId: number | null = null
  ): Observable<Page<WhouseResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (onlyActive === true) {
      params = params.set('onlyActive', 'true');
    }
    if (branchId != null) {
      params = params.set('branchId', branchId);
    }

    return this.http.get<Page<WhouseResponse>>(this.baseUrl, { params });
  }

  get(id: number): Observable<WhouseResponse> {
    return this.http.get<WhouseResponse>(`${this.baseUrl}/${id}`);
  }

  create(req: WhouseRequest): Observable<WhouseResponse> {
    const payload: WhouseRequest = { ...req };
    return this.http.post<WhouseResponse>(this.baseUrl, payload);
  }

  update(id: number, req: WhouseRequest): Observable<WhouseResponse> {
    const payload: WhouseRequest = { ...req };
    return this.http.put<WhouseResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

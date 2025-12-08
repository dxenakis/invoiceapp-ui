// src/app/pages/series/series.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page, SeriesRequest, SeriesResponse } from './series.models';

@Injectable({ providedIn: 'root' })
export class SeriesService {
  private readonly baseUrl = `${environment.apiUrl}/series`;

  constructor(private http: HttpClient) {}

  list(page = 0, size = 20): Observable<Page<SeriesResponse>> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<SeriesResponse>>(this.baseUrl, { params });
  }

  get(id: number): Observable<SeriesResponse> {
    return this.http.get<SeriesResponse>(`${this.baseUrl}/${id}`);
  }

  create(req: SeriesRequest): Observable<SeriesResponse> {
    const payload: SeriesRequest = { ...req };
    return this.http.post<SeriesResponse>(this.baseUrl, payload);
  }

  update(id: number, req: SeriesRequest): Observable<SeriesResponse> {
    const payload: SeriesRequest = { ...req };
    return this.http.put<SeriesResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

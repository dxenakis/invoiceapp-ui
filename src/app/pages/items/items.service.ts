import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MtrlRequest, MtrlResponse, Page } from './items.models';

@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly baseUrl = `${environment.apiUrl}/items`;

  constructor(private http: HttpClient) {}

  list(page = 0, size = 20): Observable<Page<MtrlResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<Page<MtrlResponse>>(this.baseUrl, { params });
  }

  get(id: number): Observable<MtrlResponse> {
    return this.http.get<MtrlResponse>(`${this.baseUrl}/${id}`);
  }

  create(req: MtrlRequest): Observable<MtrlResponse> {
    const now = new Date();
    const ts = now.toISOString().slice(0, 19);
    const payload: MtrlRequest = { ...req, createdAt: ts, updatedAt: ts };
    return this.http.post<MtrlResponse>(this.baseUrl, payload);
  }

  update(id: number, req: MtrlRequest): Observable<MtrlResponse> {
    const now = new Date();
    const ts = now.toISOString().slice(0, 19);
    const payload: MtrlRequest = { ...req, updatedAt: ts };
    //console.log(`${this.baseUrl}/${id}`);
    return this.http.put<MtrlResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

// src/app/pages/branch/branch.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BranchRequest, BranchResponse, Page } from './branch.models';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private readonly baseUrl = `${environment.apiUrl}/branches`;

  constructor(private http: HttpClient) {}

  list(page = 0, size = 20, onlyActive: boolean | null = null): Observable<Page<BranchResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (onlyActive === true) {
      params = params.set('onlyActive', 'true');
    }

    return this.http.get<Page<BranchResponse>>(this.baseUrl, { params });
  }

  get(id: number): Observable<BranchResponse> {
    return this.http.get<BranchResponse>(`${this.baseUrl}/${id}`);
  }

  create(req: BranchRequest): Observable<BranchResponse> {
    const payload: BranchRequest = { ...req };
    return this.http.post<BranchResponse>(this.baseUrl, payload);
  }

  update(id: number, req: BranchRequest): Observable<BranchResponse> {
    const payload: BranchRequest = { ...req };
    return this.http.put<BranchResponse>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TprmsResponse, IteprmsResponse } from './document-types-lookups.models';

@Injectable({ providedIn: 'root' })
export class DocumentTypesLookupsService {
  private readonly tprmsUrl = `${environment.apiUrl}/tprms`;
  private readonly iteprmsUrl = `${environment.apiUrl}/iteprms`;

  constructor(private http: HttpClient) {}

  getTprmsByDomain(domain: number): Observable<TprmsResponse[]> {
    const params = new HttpParams().set('domain', domain);
    return this.http.get<TprmsResponse[]>(this.tprmsUrl, { params });
  }

  getIteprmsByDomain(domain: number): Observable<IteprmsResponse[]> {
    const params = new HttpParams().set('domain', domain);
    return this.http.get<IteprmsResponse[]>(this.iteprmsUrl, { params });
  }
}

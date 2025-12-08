import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { TprmsResponse, IteprmsResponse, Page } from './document-types-lookups.models';
import { getBackendDomain} from '../../core/models/domain.model'

@Injectable({ providedIn: 'root' })
export class DocumentTypesLookupsService {
  private readonly tprmsUrl = `${environment.apiUrl}/api/tprms/domain`;
  private readonly iteprmsUrl = `${environment.apiUrl}/api/iteprms/domain`;

  constructor(private http: HttpClient) {}

  getTprmsByDomain(domain: number): Observable<TprmsResponse[]> {
    const strDomain = getBackendDomain(domain);
     if (!strDomain) {
      // optional: γύρνα κενό array ή ρίξε error
      return new Observable<TprmsResponse[]>(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }
    
     const url = `${this.tprmsUrl}/${encodeURIComponent(strDomain)}`;
     const params = new HttpParams().set('size', 100);
     return this.http.get<TprmsResponse[]>(url, { params });
  }

  

  getIteprmsByDomain(domain: number): Observable<IteprmsResponse[]> {
    const strDomain = getBackendDomain(domain);    
    if (!strDomain) {
      return new Observable<IteprmsResponse[]>(subscriber => {
        subscriber.next([]);
        subscriber.complete();
      });
    }
    const url = `${this.iteprmsUrl}/${encodeURIComponent(strDomain)}`;
    const params = new HttpParams().set('size', 100);
    return this.http.get<IteprmsResponse[]>(url, { params });

    
  }


}


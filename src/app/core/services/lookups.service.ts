import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, shareReplay } from 'rxjs';

export interface CountryLookup {
  id: number;
  isoCode: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class LookupsService {
  private readonly baseUrl = `${environment.apiUrl}/api/countries`;

  // cache-αρισμένο observable για να μη χτυπάμε συνέχεια το backend
  private countries$?: Observable<CountryLookup[]>;

  constructor(private http: HttpClient) {}

  getCountries(): Observable<CountryLookup[]> {
    if (!this.countries$) {
      this.countries$ = this.http
        .get<CountryLookup[]>(`${this.baseUrl}/list`)
        .pipe(shareReplay(1));
    }
    return this.countries$;
  }
}
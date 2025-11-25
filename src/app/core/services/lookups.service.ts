import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, map, shareReplay } from 'rxjs';

export interface CountryLookup {
  id: number;
  isoCode: string;
  name: string;
}

// === ΝΕΑ LOOKUP INTERFACES ===
export interface MtrUnitLookup {
  id: number;
  code: string;
  name: string;
  name1: string | null;
  isoCode: string | null;
  mydataCode?: number | null;
  mydataLabel?: string | null;
  active: boolean;
}

export interface VatLookup {
  id: number;
  code: string;
  description: string;
  rate: number;
  mydataVatCode?: number | null;
  mydataVatLabel?: string | null;
  mydataVatPercent?: number | null;
  active: boolean;
}

// Μικρό generic για σελιδοποιημένα responses (/mtrunit, /vat)
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({ providedIn: 'root' })
export class LookupsService {
  // Χώρες
  private readonly countriesUrl = `${environment.apiUrl}/api/countries`;

  // Νέα endpoints για lookups
  private readonly mtrUnitUrl = `${environment.apiUrl}/mtrunit`;
  private readonly vatUrl = `${environment.apiUrl}/vat`;

  // cache-αρισμένα observables
  private countries$?: Observable<CountryLookup[]>;
  private mtrUnits$?: Observable<MtrUnitLookup[]>;
  private vats$?: Observable<VatLookup[]>;

  constructor(private http: HttpClient) {}

  getCountries(): Observable<CountryLookup[]> {
    if (!this.countries$) {
      this.countries$ = this.http
        .get<CountryLookup[]>(`${this.countriesUrl}/list`)
        .pipe(shareReplay(1));
    }
    return this.countries$;
  }

  // === ΝΕΟ: lookups για Μονάδες Μέτρησης ===
  getMtrUnits(onlyActive = true): Observable<MtrUnitLookup[]> {
    if (!this.mtrUnits$) {
      let params = new HttpParams().set('page', 0).set('size', 1000);
      if (onlyActive) {
        params = params.set('onlyActive', 'true');
      }

      this.mtrUnits$ = this.http
        .get<PageResponse<MtrUnitLookup>>(this.mtrUnitUrl, { params })
        .pipe(
          map((res) => res.content),
          shareReplay(1)
        );
    }
    return this.mtrUnits$;
  }

  // === ΝΕΟ: lookups για ΦΠΑ ===
  getVats(onlyActive = true): Observable<VatLookup[]> {
    if (!this.vats$) {
      let params = new HttpParams().set('page', 0).set('size', 1000);
      if (onlyActive) {
        params = params.set('onlyActive', 'true');
      }

      this.vats$ = this.http
        .get<PageResponse<VatLookup>>(this.vatUrl, { params })
        .pipe(
          map((res) => res.content),
          shareReplay(1)
        );
    }
    return this.vats$;
  }
}

// src/app/pages/sales-docs/sales-docs-lookups.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, shareReplay, map,distinctUntilChanged  } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../auth/auth.service';
// Γενικό Page<T> όπως το Spring Page
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ======================
//  Lookup interfaces
// ======================

export interface BranchLookup {
  id: number;
  code: string;
  name: string;
}

export interface SeriesLookup {
  id: number;
  code: string;
  description: string | null;
  branch: BranchLookup | null;
  documentType: DocumentTypeLookup | null;
}

export interface PaymentMethodLookup {
  id: number;
  code: string;
  description: string | null;
}

export interface ShipKindLookup {
  id: number;
  code: string;
  name: string;
}

export interface WhouseLookup {
  id: number;
  code: string;
  name: string;
  branchId:number;
}

export interface DocumentTypeLookup {
  id: number;
  code: string;
  description: string | null;
}

// ======================
//  Service
// ======================

@Injectable({ providedIn: 'root' })
export class SalesDocsLookupsService {
  // Προσαρμόζεις τα paths ανάλογα με τα controllers σου στο backend.
  // Υποθέτω ότι έχεις:
  //  - @RequestMapping("/api/branches")
  //  - @RequestMapping("/api/series")
  //  - @RequestMapping("/api/payment-methods")
  //  - @RequestMapping("/api/shipkind")
  //  - @RequestMapping("/api/whouses")
  //  - @RequestMapping("/api/documenttypes")

  private readonly branchesUrl = `${environment.apiUrl}/branches`;
  private readonly seriesUrl = `${environment.apiUrl}/series`;
  private readonly paymentsUrl = `${environment.apiUrl}/payment-methods`;
  private readonly shipKindsUrl = `${environment.apiUrl}/shipkind`;
  private readonly whousesUrl = `${environment.apiUrl}/whouses`;
  private readonly documentTypesUrl = `${environment.apiUrl}/documenttypes/by-domain`;

  // Cache observables (shareReplay) για να μην ξανακάνουμε τις ίδιες κλήσεις
  private branches$?: Observable<BranchLookup[]>;
  private series$?: Observable<SeriesLookup[]>;
  private payments$?: Observable<PaymentMethodLookup[]>;
  private shipKinds$?: Observable<ShipKindLookup[]>;
  private whouses$?: Observable<WhouseLookup[]>;
  private docTypes$?: Observable<DocumentTypeLookup[]>;

  constructor(private http: HttpClient,
              private auth: AuthService
  ) {
     this.auth.activeCompany$
      .pipe(distinctUntilChanged())
      .subscribe(() => this.clearCache());
  }

    private clearCache(): void {
    this.branches$ = undefined;
    this.series$ = undefined;
    this.payments$ = undefined;
    this.shipKinds$ = undefined;
    this.whouses$ = undefined;
    this.docTypes$ = undefined;
  }
  /**
   * Φέρνει όλα τα υποκαταστήματα (Branch) σε μία λίστα.
   * GET /api/branches?page=0&size=200
   */
  getBranches(): Observable<BranchLookup[]> {
    if (!this.branches$) {
      const params = new HttpParams().set('page', 0).set('size', 200);

      this.branches$ = this.http
        .get<PageResponse<BranchLookup>>(this.branchesUrl, { params })
        .pipe(
          map((res) => res.content),
          shareReplay(1)
        );
    }

    return this.branches$;
  }

  

  /**
   * Φέρνει τρόπους πληρωμής (PaymentMethod).
   * GET /api/payment-methods?page=0&size=200
   */
  getPaymentMethods(): Observable<PaymentMethodLookup[]> {
    if (!this.payments$) {
      const params = new HttpParams().set('page', 0).set('size', 200);

      this.payments$ = this.http
        .get<PageResponse<PaymentMethodLookup>>(this.paymentsUrl, { params })
        .pipe(
          map((res) => res.content),
          shareReplay(1)
        );
    }

    return this.payments$;
  }

  /**
   * Φέρνει τρόπους αποστολής (ShipKind).
   * GET /api/shipkind?page=0&size=200
   */
  getShipKinds(): Observable<ShipKindLookup[]> {
    if (!this.shipKinds$) {
      const params = new HttpParams().set('page', 0).set('size', 200);

      this.shipKinds$ = this.http
        .get<PageResponse<ShipKindLookup>>(this.shipKindsUrl, { params })
        .pipe(
          map((res) => res.content),
          shareReplay(1)
        );
    }

    return this.shipKinds$;
  }

  /**
   * Φέρνει αποθήκες (Whouse).
   * GET /api/whouses?page=0&size=200
   */
  getWhouses(): Observable<WhouseLookup[]> {
    if (!this.whouses$) {
      const params = new HttpParams().set('page', 0).set('size', 200);

      this.whouses$ = this.http
        .get<PageResponse<WhouseLookup>>(this.whousesUrl, { params })
        .pipe(
          map((res) => res.content),          
          shareReplay(1)
        );
    }

    return this.whouses$;
  }

/**
   * Φέρνει όλες τις σειρές (Series).
   * GET /api/series?page=0&size=200
   */
  getSeries(): Observable<SeriesLookup[]> {
    if (!this.series$) {
      const params = new HttpParams()
      .set('page', 0).set('size', 200)
      .set('domain',"SALES");

      this.series$ = this.http
        .get<PageResponse<SeriesLookup>>(this.seriesUrl, { params })
        .pipe(
          map((res) => res.content),
          shareReplay(1)
        );
    }

    return this.series$;
  }

  /**
   * Φέρνει τύπους παραστατικών (DocumentType).
   * GET /api/documenttypes?page=0&size=200
   */
  getDocumentTypes(): Observable<DocumentTypeLookup[]> {
    if (!this.docTypes$) {
      const params = new HttpParams()
            .set('page', 0).set('size', 200)
            .set('domain',"SALES");

      this.docTypes$ = this.http
        .get<PageResponse<DocumentTypeLookup>>(this.documentTypesUrl, { params })
        .pipe(
          map((res) => res.content),
          shareReplay(1)
        );
    }

    return this.docTypes$;
  }
}

// src/app/pages/salesdoc/salesdoc.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

import {
  Page,
  FindocCreateRequest,
  FindocResponse,
  MtrLineRequest,
  MtrdocResponse,
  BranchLookup,
  SeriesLookup,
  PaymentMethodLookup,
  ShipKindLookup,
  WhouseLookup,
  SalesdocDeliveryForm,
  DocumentStatusFilter,
} from './salesdoc.models';

@Injectable({ providedIn: 'root' })
export class SalesdocService {
  private readonly baseUrl = `${environment.apiUrl}/api/findocs`;
  private readonly branchesUrl = `${environment.apiUrl}/branches`;
  private readonly seriesUrl = `${environment.apiUrl}/series`;
  private readonly paymentMethodsUrl = `${environment.apiUrl}/payment-methods`;
  private readonly shipKindsUrl = `${environment.apiUrl}/shipkind`;
  private readonly whousesUrl = `${environment.apiUrl}/whouses`;

  constructor(private http: HttpClient) {}

  // ====== LIST & GET ======

  list(
    page = 0,
    size = 20,
    statusFilter: DocumentStatusFilter = 'ALL'
  ): Observable<Page<FindocResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);

    if (statusFilter !== 'ALL') {
      params = params.set('status', statusFilter); // DocumentStatus enum στο backend
    }

    return this.http.get<Page<FindocResponse>>(this.baseUrl, { params });
  }

  get(id: number): Observable<FindocResponse> {
    return this.http.get<FindocResponse>(`${this.baseUrl}/${id}`);
  }

  // ====== HEADER ======

  createHeader(req: FindocCreateRequest): Observable<FindocResponse> {
    return this.http.post<FindocResponse>(this.baseUrl, req);
  }

  // (optional) μελλοντικά θα μπορούσε να υπάρχει updateHeader, προς το παρόν αφήνω μόνο create.

  // ====== LINES ======

  upsertLine(findocId: number, line: MtrLineRequest): Observable<FindocResponse> {
    return this.http.post<FindocResponse>(`${this.baseUrl}/${findocId}/lines`, line);
  }

  deleteLine(findocId: number, lineId: number): Observable<FindocResponse> {
    return this.http.delete<FindocResponse>(
      `${this.baseUrl}/${findocId}/lines/${lineId}`
    );
  }

  // ====== DELIVERY (MTRDOC) ======

  updateDelivery(findocId: number, form: SalesdocDeliveryForm): Observable<FindocResponse> {
    const payload: Partial<MtrdocResponse> = {
      findocId,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2,
      city: form.city,
      region: form.region,
      postalCode: form.postalCode,
      countryCode: form.countryCode,
      whouseId: form.whouseId,
    };

    return this.http.put<FindocResponse>(
      `${this.baseUrl}/${findocId}/mtrdoc`,
      payload
    );
  }

  // ====== STATUS ACTIONS ======

  postDocument(id: number): Observable<FindocResponse> {
    return this.http.post<FindocResponse>(`${this.baseUrl}/${id}/post`, {});
  }

  cancelDocument(id: number): Observable<FindocResponse> {
    return this.http.post<FindocResponse>(`${this.baseUrl}/${id}/cancel`, {});
  }

  // ====== LOOKUPS ======

  getBranches(): Observable<BranchLookup[]> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 1000)
      .set('onlyActive', 'true');

    return this.http
      .get<Page<any>>(this.branchesUrl, { params })
      .pipe(
        map((p) =>
          (p.content ?? []).map(
            (b): BranchLookup => ({
              id: b.id,
              code: b.code,
              name: b.name,
              active: b.active,
            })
          )
        )
      );
  }

  getSeries(): Observable<SeriesLookup[]> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 1000);

    return this.http
      .get<Page<any>>(this.seriesUrl, { params })
      .pipe(
        map((p) =>
          (p.content ?? []).map(
            (s): SeriesLookup => ({
              id: s.id,
              documentTypeId: s.documentTypeId ?? null,
              branchId: s.branchId ?? null,
              code: s.code,
              description: s.description,
              active: s.active ?? true,
            })
          )
        )
      );
  }

  getPaymentMethods(): Observable<PaymentMethodLookup[]> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 1000);
    return this.http
      .get<Page<any>>(this.paymentMethodsUrl, { params })
      .pipe(
        map((p) =>
          (p.content ?? []).map(
            (pm): PaymentMethodLookup => ({
              id: pm.id,
              code: pm.code,
              description: pm.description,
              active: pm.active ?? true,
            })
          )
        )
      );
  }

  getShipKinds(): Observable<ShipKindLookup[]> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 1000);
    return this.http
      .get<Page<any>>(this.shipKindsUrl, { params })
      .pipe(
        map((p) =>
          (p.content ?? []).map(
            (sk): ShipKindLookup => ({
              id: sk.id,
              code: sk.code,
              name: sk.name,
              active: sk.active ?? true,
            })
          )
        )
      );
  }

  getWhousesByBranch(branchId: number): Observable<WhouseLookup[]> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 1000)
      .set('onlyActive', 'true');

    return this.http
      .get<Page<any>>(`${this.whousesUrl}/by-branch/${branchId}`, { params })
      .pipe(
        map((p) =>
          (p.content ?? []).map(
            (w): WhouseLookup => ({
              id: w.id,
              code: w.code,
              name: w.name,
              branchId: w.branchId ?? null,
              active: w.active ?? true,
            })
          )
        )
      );
  }
}

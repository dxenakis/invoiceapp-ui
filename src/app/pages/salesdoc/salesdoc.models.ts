// src/app/pages/salesdoc/salesdoc.models.ts

import { CustomerResponse } from '../customer/customer.models';
import { MtrlResponse } from '../items/items.models';

// Generic Page<T> (Spring Page)
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export type DocumentStatusFilter = 'ALL' | 'DRAFT' | 'POSTED' | 'CANCELLED';

// ===== LOOKUPS =====

export interface BranchLookup {
  id: number;
  code: string;
  name: string;
  active: boolean;
}

export interface SeriesLookup {
  id: number;
  documentTypeId: number | null;
  branchId: number | null;
  code: string;
  description: string;
  active: boolean;
}

export interface PaymentMethodLookup {
  id: number;
  code: string;
  description: string;
  active: boolean;
}

export interface ShipKindLookup {
  id: number;
  code: string;
  name: string;
  active: boolean;
}

export interface WhouseLookup {
  id: number;
  code: string;
  name: string;
  branchId: number | null;
  active: boolean;
}

// ========== BACKEND ENTITIES ==========

export interface MtrdocResponse {
  id: number;
  findocId: number;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  whouseId: number | null;
}

export interface MtrLineResponse {
  id: number;
  lineNo: number;
  mtrlId: number | null;
  mtrlCode: string | null;
  mtrlName: string | null;
  vatId: number | null;
  vatRate: number | null;
  mtrUnitId: number | null;
  whouseId: number | null;
  qty: number;
  price: number;
  discountRate: number;
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
}

export interface MtrLineRequest {
  mtrlId: number | null;
  vatId: number | null;
  mtrUnitId: number | null;
  whouseId: number | null;
  lineNo: number;
  qty: number;
  price: number;
  discountRate: number;
}

export interface FindocCreateRequest {
  documentTypeId: number | null;
  branchId: number | null;
  seriesId: number | null;
  traderId: number | null;
  documentDate: string; // yyyy-MM-dd
  documentDomain: number; // 1351 για Πωλήσεις
  paymentMethodId: number | null;
  shipKindId: number | null;
}

export interface FindocResponse {
  id: number;
  companyId: number;
  documentTypeId: number | null;
  branchId: number | null;
  seriesId: number | null;
  documentDomain: any;
  fiscalYear: number;
  number: number | null;
  printedNumber: string | null;
  documentDate: string;
  traderId: number | null;
  paymentMethodId: number | null;
  shipKindId: number | null;
  status: number | null;
  totalNet: number;
  totalVat: number;
  totalGross: number;
  createdAt: string | null;
  updatedAt: string | null;

  seriesCode?: string | null;
  seriesDescription?: string | null;
  traderCode?: string | null;
  traderName?: string | null;
  branchCode?: string | null;
  branchName?: string | null;
  paymentMethodCode?: string | null;
  paymentMethodDescription?: string | null;
  shipKindCode?: string | null;
  shipKindName?: string | null;

  mtrdoc: MtrdocResponse | null;
  mtrlines: MtrLineResponse[];
}

// ========== FRONT-END VIEW MODELS ==========

// Header form model (για δημιουργία / edit)
export interface SalesdocHeaderForm {
  seriesId: number | null;
  documentTypeId: number | null;
  branchId: number | null;
  traderId: number | null;
  traderDisplay: string;
  documentDate: string;
  paymentMethodId: number | null;
  shipKindId: number | null;
}

// Delivery form model
export interface SalesdocDeliveryForm {
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  countryCode: string;
  whouseId: number | null;
}

// Line VM (frontend)
export interface SalesdocLineForm {
  tempId: number;              // μόνο front
  backendId?: number | null;   // id από backend (αν υπάρχει)
  lineNo: number;
  mtrlId: number | null;
  code: string;
  name: string;
  vatId: number | null;
  mtrUnitId: number | null;
  whouseId: number | null;
  qty: number;
  price: number;
  discountRate: number;
}

// Ολόκληρο το ViewModel
export interface SalesdocViewModel {
  id?: number;
  status?: number | null;
  header: SalesdocHeaderForm;
  lines: SalesdocLineForm[];
  delivery: SalesdocDeliveryForm;
}

// απλά exports για ευκολία
export type Customer = CustomerResponse;
export type Item = MtrlResponse;

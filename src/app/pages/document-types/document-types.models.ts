// src/app/pages/document-types/document-types.models.ts
import {  DocumentDomainOption, DOCUMENT_DOMAINS } from '../../core/models/domain.model'
// Απόκριση backend
export interface DocumentTypeResponse {
  id: number;
  companyId: number;

  code: string;
  description: string;

  // π.χ. 1251 = Αγορές, 1351 = Πωλήσεις, κτλ.
  domain: number;

  tprmsId?: number | null;
  tprmsCode?: string | null;
  tprmsDescription?: string | null;
  iteprmsId?: number | null;
  iteprmsCode?: string | null;
  iteprmsDescription?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// Request προς backend
export interface DocumentTypeRequest {
  code: string;
  description: string;
  domain: number | null;
  tprmsId?: number | null;
  iteprmsId?: number | null;
}

// Αν δεν έχεις ήδη global Page<T>, μπορείς να το βάλεις εδώ
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}



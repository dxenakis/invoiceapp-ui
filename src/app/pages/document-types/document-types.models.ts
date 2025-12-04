// src/app/pages/document-types/document-types.models.ts

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

  iteprmsId?: number | null;
  iteprmsCode?: string | null;

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

export interface DocumentDomainOption {
  code: number;
  label: string;
}

// Βασικά domains (όπως στο enum DocumentDomain του backend)
export const DOCUMENT_DOMAINS: DocumentDomainOption[] = [
  { code: 1251, label: 'Αγορές' },
  { code: 1351, label: 'Πωλήσεις' },
  { code: 1381, label: 'Εισπράξεις' },
  { code: 1281, label: 'Πληρωμές' },
];

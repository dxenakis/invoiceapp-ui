export interface DocumentDomainOption {
  code: number;
  label: string;
  backend: string; // το enum του backend
}

export const DOCUMENT_DOMAINS: DocumentDomainOption[] = [
  { code: 1251, label: 'Αγορές',    backend: 'PURCHASES' },
  { code: 1351, label: 'Πωλήσεις',  backend: 'SALES' },
  { code: 1381, label: 'Εισπράξεις', backend: 'RECEIPTS' },  // παράδειγμα
  { code: 1281, label: 'Πληρωμές',  backend: 'PAYMENTS' },  // παράδειγμα
];

export function getDomainLabel(code: number | null): string | null {
  const match = DOCUMENT_DOMAINS.find(d => d.code === code);
  return match ? match.label : null;
}

export function getBackendDomain(code: number | null): string | null {
  const match = DOCUMENT_DOMAINS.find(d => d.code === code);
  return match ? match.backend : null;
}



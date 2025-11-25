export enum AccountingCategory {
  EMPOREVMATA = 'EMPOREVMATA',
  PROIONTA = 'PROIONTA',
  YPHRESIES = 'YPHRESIES',
  PROTES_YLES = 'PROTES_YLES',
  VOITHITIKA_YLIKA = 'VOITHITIKA_YLIKA',
  YLIKA_SYSKEVASIAS = 'YLIKA_SYSKEVASIAS',
  PAGIA = 'PAGIA',
}

export const ACCOUNTING_CATEGORY_LABELS: Record<AccountingCategory, string> = {
  [AccountingCategory.EMPOREVMATA]: 'Εμπορεύματα',
  [AccountingCategory.PROIONTA]: 'Προϊόντα',
  [AccountingCategory.YPHRESIES]: 'Υπηρεσίες',
  [AccountingCategory.PROTES_YLES]: 'Πρώτες Ύλες',
  [AccountingCategory.VOITHITIKA_YLIKA]: 'Βοηθητικά Υλικά',
  [AccountingCategory.YLIKA_SYSKEVASIAS]: 'Υλικά Συσκευασίας',
  [AccountingCategory.PAGIA]: 'Πάγια',
};

export interface MtrlResponse {
  id: number;
  companyid: number;
  code: string;
  name: string;
  name1: string | null;
  accountCategory: AccountingCategory;
  pricer: number;
  pricew: number;

  mtrunitId: number | null;
  mtrunitCode: string | null;
  vatId: number | null;
  vatCode: string | null;

  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MtrlRequest {
  code: string;
  name: string;
  name1?: string | null;
  accountCategory: AccountingCategory;
  pricer: number;
  pricew: number;
  
  mtrunitId: number | null;
  vatId: number | null;

  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

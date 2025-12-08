// src/app/pages/payment/payment.models.ts

// Αντιστοιχία με PaymentMethodResponse (backend)
export interface PaymentMethodResponse {
  id: number;
  companyId: number;
  code: string;
  description: string | null;
  mydataMethodCode: number | null;
  active: boolean;
}

// Create / Update requests — ίδια fields με PaymentMethodCreate/UpdateRequest
export interface PaymentMethodRequest {
  code: string;
  description?: string | null;
  mydataMethodCode?: number | null;
  active?: boolean | null;
}

// Γενικό Page<T> (ίδιο shape με Spring Page)
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Lookup για MyDATA payment methods.

export interface MydataPaymentMethodLookup {
  code: number;
  label: string;
}

export const MYDATA_PAYMENT_METHODS: MydataPaymentMethodLookup[] = [
  { code: 1, label: 'Μετρητά' },
  { code: 2, label: 'POS / e-POS' },
  { code: 3, label: 'Επί πιστώσει' },
  { code: 4, label: 'Web Banking' },
  { code: 5, label: 'Επιταγή' },
  { code: 6, label: 'Άμεσες Πληρωμές IRIS' },
  { code: 7, label: 'Επαγ. Λογαριασμός Πληρωμών Ημεδαπής' },
  { code: 8, label: 'Επαγ. Λογαριασμός Πληρωμών Αλλοδαπής' },
  
];

// Helper για να παίρνουμε κείμενο από το code
export function mydataPaymentLabel(
  code: number | null | undefined
): string {
  if (code == null) return '';
  const found = MYDATA_PAYMENT_METHODS.find((m) => m.code === code);
  return found ? found.label : `${code}`;
}

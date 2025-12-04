// src/app/pages/customer/customer.models.ts

// Αντίστοιχο του TraderResponseDto
export interface CustomerResponse {
  id: number;
  code: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  zip?: string | null;
  email?: string | null;
  countryId?: number | null;
  countryName?: string | null;

  // από το TraderDomain – εδώ θα είναι πάντα CUSTOMER, αλλά το αφήνουμε γενικά
  domain?: 'CUSTOMER' | 'SUPPLIER';

  createdAt?: string | null;
  updatedAt?: string | null;
}

// Αντίστοιχο του TraderRequestDto
export interface CustomerRequest {
  code: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  zip?: string | null;
  countryId: number | null; // @NotNull στο backend
}

// Γενικό Page<T> (ίδιο shape με Spring Page)
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

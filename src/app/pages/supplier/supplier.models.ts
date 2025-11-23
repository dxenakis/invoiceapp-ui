// src/app/pages/supplier/supplier.models.ts

// Αντίστοιχο του TraderResponseDto για domain SUPPLIER
export interface SupplierResponse {
  id: number;
  code: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  zip?: string | null;

  countryId?: number | null;
  countryName?: string | null;

  domain?: 'CUSTOMER' | 'SUPPLIER';

  createdAt?: string | null;
  updatedAt?: string | null;
}

// Αντίστοιχο του TraderRequestDto
export interface SupplierRequest {
  code: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  zip?: string | null;
  countryId: number | null;
}

// Γενικό Page<T> – ίδιο με αυτό που βάλαμε στους customers
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// src/app/pages/branch/branch.models.ts

// Αντιστοιχία με BranchResponse (backend)
export interface BranchResponse {
  id: number;
  companyId: number;
  code: string;
  name: string;
  description?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  email?: string | null;
  headquarters: boolean;
  active: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

// Αντιστοιχία με BranchRequest (backend)
export interface BranchRequest {
  code: string;
  name: string;
  description?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  region?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  email?: string | null;
  headquarters?: boolean | null;
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

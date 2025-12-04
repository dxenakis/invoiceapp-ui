export interface WhouseResponse {
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
  branchId: number;
  branchCode?: string | null;
  branchName?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
export interface WhouseRequest {
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
  branchId: number; // υποχρεωτικό στο backend
}

// ίδιο Page<T>
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
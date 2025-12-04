// src/app/pages/company/company.models.ts

// Αντιστοιχία με CompanyResponse (backend)
export interface CompanyResponse {
  id: number;
  afm: string;
  name: string;
  addressLine?: string | null;
  city?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  email?: string | null;
  phone?: string | null;
}

// Request που στέλνουμε στο backend (ίδιο με CompanyCreateRequest)
export interface CompanyRequest {
  afm: string;
  name: string;
  addressLine?: string | null;
  city?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  email?: string | null;
  phone?: string | null;
}

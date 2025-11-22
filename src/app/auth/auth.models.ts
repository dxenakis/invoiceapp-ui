// === AUTH MODELS (ακριβώς πάνω στα payloads του backend) ===

export interface LoginPayload {
  username: string;
  password: string;
}

export interface CompanyAccessItem {
  companyId: number;        // <-- από backend
  companyName: string;      // <-- από backend
  Vat: string;      // <-- από backend
  role: string;      // <-- από backend
}

export interface RefreshResponse {
  accessToken: string;
}
export interface LoginResponse {
  token: string;                // <-- από backend
  activeCompanyId?: number | null;     // μπορεί να είναι null
  username?: string | null;     // μπορεί να είναι null
  firstname?: string | null;     // μπορεί να είναι null
  lastname?: string | null;     // μπορεί να είναι null
  companies: CompanyAccessItem[];     // <-- από backend
}

export interface MeResponse {
  username: string | null;
  firstname?: string | null;   // backend: firstname
  lastname: string | null;
  companies: CompanyAccessItem[];
}

export interface TokenResponse {
  token: string;                // <-- από backend (refresh / switch-company)
}

export interface RegisterPayload {
  username: string;
  password: string;
  email?: string;
  firstname?: string;
  lastname?: string;
}

export interface RegisterGovPayload {
  authorizationCode: string;          // παράδειγμα, προσαρμόζεται αν χρειαστεί
}

export interface RegisterResponse {
  token?: string;               // <-- αν κάνει auto-login
  companies?: CompanyAccessItem[];    // <-- προαιρετικά
}

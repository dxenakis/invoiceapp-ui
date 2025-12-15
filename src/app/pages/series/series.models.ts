// src/app/pages/series/series.models.ts

// Γενικό Page<T> – ίδιο σχήμα με backend Spring Page
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// Αυτό είναι το response από το backend,
// με τα nested DocumentType / Branch / Whouse όπως τα ορίσαμε στο SeriesResponse (Java)
export interface SeriesResponse {
  id: number;
  companyId: number;

  code: string;
  description?: string | null;
  domain: number | null;
  active: boolean;
  prefix?: string | null;
  formatPattern?: string | null;
  paddingLength?: number | null;

  documentType?: SeriesDocumentTypeNested | null;
  branch?: SeriesBranchNested | null;
  whouse?: SeriesWhouseNested | null;
}

// Nested types – πρέπει να ταιριάζουν με τα nested records στη SeriesResponse (backend)
export interface SeriesDocumentTypeNested {
  id: number;
  code: string;
  description: string;
}

export interface SeriesBranchNested {
  id: number;
  code: string;
  name: string;
}

export interface SeriesWhouseNested {
  id: number;
  code: string;
  name: string;
}

// Request για create/update – στέλνουμε μόνο ids + βασικά πεδία.
export interface SeriesRequest {
  documentTypeId: number | null;
  branchId?: number | null;
  whouseId?: number | null;
  domain: number | null;
  code: string;
  description?: string | null;
  active?: boolean | null;

  prefix?: string | null;
  formatPattern?: string | null;
  paddingLength?: number | null;
}

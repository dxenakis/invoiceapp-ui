// src/app/pages/document-types/document-types-lookups.models.ts

// Σειρές παραστατικών (TPRMS)
export interface TprmsResponse {
  id: number;
  code: string;
  description: string;
  domain: number;
}

// Παραμετροποίηση αποθήκης (ITEPRMS)
export interface IteprmsResponse {
  id: number;
  code: string;
  description: string;
  domain: number;
}

// src/app/pages/sales-docs/sales-docs.models.ts

// Τι επιστρέφει περίπου το backend για το enum DocumentDomain
export type DocumentDomainBackend =
  | 'PURCHASES'
  | 'SALES'
  | 'COLLECTIONS'
  | 'PAYMENTS';

// =====================
//  Mtrdoc (στοιχεία παράδοσης)
// =====================

export interface MtrdocResponse {
  id: number;
  findocId: number;

  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;

  whouseId: number | null;
  whouseCode: string | null;
  whouseName: string | null;
}

// Ό,τι ζητάει το backend (δες MtrdocRequest.java)
export interface MtrdocRequest {
  findocId: number | null;       // για νέο παραστατικό μπορείς να στέλνεις null
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  postalCode: string | null;
  countryCode: string | null;
  whouseId: number | null;
}

// =====================
//  Γραμμές παραστατικού (MtrLine)
// =====================

export interface MtrLineResponse {
  id: number;
  lineNo: number;

  mtrlId: number;
  mtrlCode: string;
  mtrlName: string;

  vatId: number;
  vatRate: number;

  mtrUnitId: number;
  whouseId: number;

  qty: number;
  price: number;
  discountRate: number;

  netAmount: number;
  vatAmount: number;
  totalAmount: number;
}

// Request που στέλνουμε στο backend (ίδιο με MtrLineRequest.java)
export interface MtrLineRequest {
  mtrlId: number;
  vatId: number;
  mtrUnitId: number;
  whouseId: number;
  lineNo: number;
  qty: number;
  price: number;
  discountRate: number;
}

// =====================
//  Header παραστατικού (FindocResponse από backend)
// =====================

export interface FindocResponse {
  id: number;
  companyId: number | null;

  documentTypeId: number | null;
  branchId: number | null;
  seriesId: number | null;

  documentDomain: DocumentDomainBackend;
  fiscalYear: number;
  number: number | null;
  printedNumber: string | null;
  documentDate: string;            // LocalDate → 'YYYY-MM-DD'

  traderId: number | null;

  status: number | null;           // code του DocumentStatus enum

  totalNet: number;
  totalVat: number;
  totalGross: number;

  createdAt: string | null;        // LocalDateTime → ISO string
  updatedAt: string | null;

  // Payment (backend σου δίνει και code/description – εμείς θα χρησιμοποιούμε id)
  paymentMethodId: number | null;
  paymentMethodCode: string | null;
  paymentMethodDescription: string | null;

  // ShipKind
  shipKindId: number | null;
  shipKindCode: string | null;
  shipKindName: string | null;

  // Στοιχεία παράδοσης
  mtrdoc: MtrdocResponse | null;

  // Γραμμές
  mtrlines: MtrLineResponse[];
}

// =====================
//  Request για "μαζική" καταχώρηση (FindocSaveRequest)
// =====================

/**
 * Αυτό είναι το αντικείμενο που στέλνουμε στο /api/findocs/full
 * (ταιριάζει με FindocSaveRequest.java στο backend).
 */
export interface FindocSaveRequest {
  id?: number | null;

  documentTypeId: number;
  branchId: number;
  seriesId: number;
  traderId: number;

  documentDate: string;      // 'YYYY-MM-DD'
  documentDomain: number;    // code από DocumentDomain (π.χ. 1351 για SALES)

  paymentMethodId: number | null;
  shipKindId: number | null;

  mtrdoc: MtrdocRequest | null;
  mtrlines: MtrLineRequest[];
}

// Γενικό Page<T> (ίδιο shape με Spring Page)
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

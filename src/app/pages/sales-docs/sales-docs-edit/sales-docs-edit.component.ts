import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';

import {
  FindocResponse,
  FindocSaveRequest,
  MtrLineRequest,
  MtrdocRequest,
} from '../sales-docs.models';
import { SalesDocsService } from '../sales-docs.service';

import {
  SalesDocsLookupsService,
  BranchLookup,
  SeriesLookup,
  PaymentMethodLookup,
  ShipKindLookup,
  WhouseLookup,
  DocumentTypeLookup,
} from '../sales-docs-lookups.service';

type ActiveTab = 'doc' | 'delivery';

@Component({
  standalone: true,
  selector: 'app-sales-docs-edit',
  imports: [CommonModule, FormsModule, RouterModule, CrudFormToolbarComponent],
  templateUrl: './sales-docs-edit.component.html',
  styleUrls: ['./sales-docs-edit.component.css'],
})
export class SalesDocsEditComponent implements OnInit {
  docId: number | null = null;
  saving = false;
  loading = false;

  activeTab: ActiveTab = 'doc';

  // Header (UI fields)
  header = {
    // 1η γραμμή
    documentDate: new Date().toISOString().slice(0, 10),
    branchId: null as number | null,
    ax: '' as string, // Α.Χ (προς το παρόν UI)

    // 2η γραμμή
    seriesId: null as number | null,
    documentTypeId: null as number | null,
    docNo: '' as string, // "Παραστατικό" (θα το φτιάξεις backend)

    // 3η/4η γραμμή
    paymentMethodId: null as number | null,
    shipKindId: null as number | null,
    traderId: null as number | null,

    documentDomain: 1351, // π.χ. SALES
  };

  // Mtrdoc (delivery)
  delivery: MtrdocRequest = {
    findocId: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    region: null,
    postalCode: null,
    countryCode: null,
    whouseId: null,
  };

  // Lines
  lines: MtrLineRequest[] = [];

  // Lookups (αυτά που δείχνουμε στο UI = filtered)
  branches: BranchLookup[] = [];
  series: SeriesLookup[] = [];
  payments: PaymentMethodLookup[] = [];
  shipKinds: ShipKindLookup[] = [];
  whouses: WhouseLookup[] = [];
  documentTypes: DocumentTypeLookup[] = [];

  // Full datasets (unfiltered) για να κάνουμε φίλτρα
  private allSeries: SeriesLookup[] = [];
  private allWhouses: WhouseLookup[] = [];

  // κρατάμε το τελευταίο branch για να ξέρουμε αν είναι πραγματική αλλαγή
  private lastBranchId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: SalesDocsService,
    private lookups: SalesDocsLookupsService
  ) {}

  ngOnInit(): void {
    this.loadLookups();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.docId = +idParam;
      this.loadDocument(this.docId);
    } else {
      this.addLine();
    }
  }

  setTab(tab: ActiveTab): void {
    this.activeTab = tab;
  }

  // ========= LOOKUPS =========
  private loadLookups(): void {
    this.lookups.getBranches().subscribe({
      next: (b) => (this.branches = b),
      error: (err) => console.error('Error loading branches', err),
    });

    this.lookups.getSeries().subscribe({
      next: (s) => {
        this.allSeries = s ?? [];
        this.applyBranchFilter(false); // ΜΗΝ μηδενίζεις εδώ
      },
      error: (err) => console.error('Error loading series', err),
    });

    this.lookups.getPaymentMethods().subscribe({
      next: (p) => (this.payments = p),
      error: (err) => console.error('Error loading payments', err),
    });

    this.lookups.getShipKinds().subscribe({
      next: (s) => (this.shipKinds = s),
      error: (err) => console.error('Error loading ship kinds', err),
    });

    this.lookups.getWhouses().subscribe({
      next: (w) => {
        this.allWhouses = w ?? [];
        this.applyBranchFilter(false); // ΜΗΝ μηδενίζεις εδώ
      },
      error: (err) => console.error('Error loading whouses', err),
    });

    this.lookups.getDocumentTypes().subscribe({
      next: (d) => (this.documentTypes = d),
      error: (err) => console.error('Error loading doc types', err),
    });
  }

  // ========= DOCUMENT LOAD =========
  private loadDocument(id: number): void {
    this.loading = true;
    this.service.getById(id).subscribe({
      next: (doc: FindocResponse) => {
        this.loading = false;
        this.docId = doc.id;

        this.header = {
          documentDate: doc.documentDate,
          branchId: doc.branchId,
          ax: '',

          seriesId: doc.seriesId,
          documentTypeId: doc.documentTypeId,
          docNo: doc.printedNumber ?? (doc.number ? String(doc.number) : ''),

          paymentMethodId: doc.paymentMethodId,
          shipKindId: doc.shipKindId,
          traderId: doc.traderId,

          documentDomain: 1351,
        };

        // set lastBranchId ώστε να μην “θεωρήσει” αλλαγή branch στο αρχικό render
        this.lastBranchId = this.header.branchId;

        // φιλτράρουμε με βάση το branch, ΧΩΡΙΣ reset
        this.applyBranchFilter(false);

        if (doc.mtrdoc) {
          this.delivery = {
            findocId: doc.id,
            addressLine1: doc.mtrdoc.addressLine1,
            addressLine2: doc.mtrdoc.addressLine2,
            city: doc.mtrdoc.city,
            region: doc.mtrdoc.region,
            postalCode: doc.mtrdoc.postalCode,
            countryCode: doc.mtrdoc.countryCode,
            whouseId: doc.mtrdoc.whouseId,
          };
        }

        this.lines =
          doc.mtrlines?.map((l) => ({
            mtrlId: l.mtrlId,
            vatId: l.vatId,
            mtrUnitId: l.mtrUnitId,
            whouseId: l.whouseId,
            lineNo: l.lineNo,
            qty: l.qty,
            price: l.price,
            discountRate: l.discountRate,
          })) ?? [];

        if (this.lines.length === 0) this.addLine();
      },
      error: (err) => {
        console.error('Error loading document', err);
        this.loading = false;
      },
    });
  }

  // ========= AUTOMATIONS =========

  // Καλείται όταν αλλάζει branch από το UI
  onBranchChange(branchId: number | null): void {
  if (this.lastBranchId === branchId) return;
  this.lastBranchId = branchId;

  this.delivery.whouseId = null;
  this.header.seriesId = null;
  this.header.documentTypeId = null;

  this.applyBranchFilter(true); // 👈 user action
}

  // Καλείται όταν αλλάζει σειρά
  onSeriesChange(seriesId: number | null): void {
    if (!seriesId) {
      this.header.documentTypeId = null;
      return;
    }

    const s = this.allSeries.find((x) => x.id === this.header.seriesId);    
    this.header.documentTypeId = s?.documentType?.id ?? null;
    
    
  }

  // Φιλτράρει series/whouses βάσει branchId
private applyBranchFilter(userAction: boolean): void {
  const branchId = this.header.branchId;

  if (!branchId) {
    this.series = [...this.allSeries];
    this.whouses = [...this.allWhouses];

    // αν θες, όταν δεν υπάρχει branch μην επιλέγεις τίποτα:
    // this.delivery.whouseId = null;

    return;
  }

  // SERIES by branch object
  this.series = this.allSeries.filter(s => s.branch?.id === branchId);

  // WHOUSES by branchId (εδώ βάλε το σωστό property που έχει το WhouseLookup σου)
  this.whouses = this.allWhouses.filter(w => w.branchId === branchId);
  // Αν αντί για branchId έχει branch object, χρησιμοποίησε:
  // this.whouses = this.allWhouses.filter(w => w.branch?.id === branchId);

  // ✅ auto-select πρώτο whouse ΜΟΝΟ όταν το branch άλλαξε από τον χρήστη
  if (userAction) {
    this.delivery.whouseId = this.whouses.length ? this.whouses[0].id : null;
  }
}

  // ========= LINES =========
  addLine(): void {
    const nextNo = this.lines.length + 1;
    this.lines.push({
      mtrlId: 0,
      vatId: 0,
      mtrUnitId: 0,
      whouseId: 0,
      lineNo: nextNo,
      qty: 1,
      price: 0,
      discountRate: 0,
    });
  }

  removeLine(index: number): void {
    this.lines.splice(index, 1);
    this.lines.forEach((l, i) => (l.lineNo = i + 1));
  }

  // ========= SAVE =========
  save(): void {
    if (
      !this.header.documentTypeId ||
      !this.header.branchId ||
      !this.header.seriesId ||
      !this.header.traderId
    ) {
      alert('Συμπλήρωσε τύπο, υποκατάστημα, σειρά και πελάτη.');
      this.activeTab = 'doc';
      return;
    }

    const req: FindocSaveRequest = {
      id: this.docId ?? null,
      documentTypeId: this.header.documentTypeId!,
      branchId: this.header.branchId!,
      seriesId: this.header.seriesId!,
      traderId: this.header.traderId!,
      documentDate: this.header.documentDate,
      documentDomain: this.header.documentDomain,
      paymentMethodId: this.header.paymentMethodId,
      shipKindId: this.header.shipKindId,
      mtrdoc: this.buildMtrdocRequest(),
      mtrlines: this.lines,
    };

    this.saving = true;
    this.service.save(req).subscribe({
      next: (saved) => {
        this.saving = false;
        this.docId = saved.id;
        this.router.navigate(['/app/salesdocs']);
      },
      error: (err) => {
        console.error('Error saving document', err);
        this.saving = false;
        alert('Σφάλμα κατά την αποθήκευση παραστατικού.');
      },
    });
  }

  private buildMtrdocRequest(): MtrdocRequest | null {
    const d = this.delivery;
    const hasAny =
      d.addressLine1 ||
      d.addressLine2 ||
      d.city ||
      d.region ||
      d.postalCode ||
      d.countryCode ||
      d.whouseId;

    if (!hasAny) return null;

    return {
      findocId: this.docId ?? null,
      addressLine1: d.addressLine1,
      addressLine2: d.addressLine2,
      city: d.city,
      region: d.region,
      postalCode: d.postalCode,
      countryCode: d.countryCode,
      whouseId: d.whouseId,
    };
  }

  cancel(): void {
    this.router.navigate(['/app/salesdocs']);
  }

  delete(): void {
    alert('Η διαγραφή παραστατικού δεν έχει υλοποιηθεί ακόμα.');
  }
}

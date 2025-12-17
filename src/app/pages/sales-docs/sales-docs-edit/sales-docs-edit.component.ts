import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, switchMap, tap } from 'rxjs/operators';
import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';
import { CustomersService } from '../../customer/customers.service';
import { CustomerResponse } from '../../customer/customer.models';

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
export class SalesDocsEditComponent implements OnInit, OnDestroy {
  docId: number | null = null;
  saving = false;
  loading = false;

  activeTab: ActiveTab = 'doc';

  // Header (UI fields)
  header = {
    documentDate: new Date().toISOString().slice(0, 10),
    branchId: null as number | null,
    ax: '' as string,

    seriesId: null as number | null,
    documentTypeId: null as number | null,
    docNo: '' as string,

    paymentMethodId: null as number | null,
    shipKindId: null as number | null,
    traderId: null as number | null,

    documentDomain: 1351,
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

  // Lookups (filtered)
  branches: BranchLookup[] = [];
  series: SeriesLookup[] = [];
  payments: PaymentMethodLookup[] = [];
  shipKinds: ShipKindLookup[] = [];
  whouses: WhouseLookup[] = [];
  documentTypes: DocumentTypeLookup[] = [];

  // Full datasets
  private allSeries: SeriesLookup[] = [];
  private allWhouses: WhouseLookup[] = [];
  private lastBranchId: number | null = null;

  // ===== Customer dropdown/lookup =====
  customerResults: CustomerResponse[] = [];
  customerLoading = false;
  customerDropdownOpen = false;
  selectedCustomer: CustomerResponse | null = null;

  customerSearchText = '';
  private customerSearch$ = new Subject<string>();
  private sub = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: SalesDocsService,
    private lookups: SalesDocsLookupsService,
    private customers: CustomersService
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.setupCustomerSearch();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.docId = +idParam;
      this.loadDocument(this.docId);
    } else {
      this.addLine();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
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
        this.applyBranchFilter(false);
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
        this.applyBranchFilter(false);
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

        this.lastBranchId = this.header.branchId;
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

        // load customer label for edit
        if (this.header.traderId) {
          this.customers.get(this.header.traderId).subscribe({
            next: (c) => {
              this.selectedCustomer = c;
            },
            error: () => {
              // αν δεν βρεθεί, απλά αφήνουμε το selectedCustomer null
            },
          });
        }
      },
      error: (err) => {
        console.error('Error loading document', err);
        this.loading = false;
      },
    });
  }

  // ========= AUTOMATIONS =========
  onBranchChange(branchId: number | null): void {
    if (this.lastBranchId === branchId) return;
    this.lastBranchId = branchId;

    // reset εξαρτώμενων
    this.delivery.whouseId = null;
    this.header.seriesId = null;
    this.header.documentTypeId = null;

    this.applyBranchFilter(true); // user action -> auto first whouse
  }

  onSeriesChange(seriesId: number | null): void {
    if (!seriesId) {
      this.header.documentTypeId = null;
      return;
    }

    const s = this.allSeries.find((x) => x.id === seriesId);
    if ((s as any)?.documentTypeId !== undefined) {
      this.header.documentTypeId = (s as any).documentTypeId ?? null;
      return;
    }
    this.header.documentTypeId = (s as any)?.documentType?.id ?? null;
  }

  private applyBranchFilter(userAction: boolean): void {
    const branchId = this.header.branchId;

    if (!branchId) {
      this.series = [...this.allSeries];
      this.whouses = [...this.allWhouses];
      return;
    }

    this.series = this.allSeries.filter((s: any) => s.branch?.id === branchId);
    this.whouses = this.allWhouses.filter((w) => w.branchId === branchId);

    if (userAction) {
      this.delivery.whouseId = this.whouses.length ? this.whouses[0].id : null;
    }
  }

  // ========= CUSTOMER DROPDOWN / SEARCH =========
  private setupCustomerSearch(): void {
    const s = this.customerSearch$
      .pipe(
        debounceTime(250),
        // δεν βάζουμε distinctUntilChanged() γιατί μετά από clear+reopen μπορεί να
        // χρειαστεί να ξανακάνουμε fetch το ίδιο '' (λίστα) και να μην “κολλάει”.
        switchMap((q) => {
          const term = (q ?? '').trim();
          this.customerLoading = true;

          return this.customers.searchLookup(term, 30).pipe(
            catchError((err) => {
              console.error('Customer search error', err);
              return of([]);
            }),
            tap(() => (this.customerLoading = false))
          );
        })
      )
      .subscribe((res) => {
        this.customerResults = res ?? [];
      });

    this.sub.add(s);
  }

  toggleCustomerDropdown(): void {
    this.customerDropdownOpen = !this.customerDropdownOpen;

    if (this.customerDropdownOpen) {
      // όταν ανοίξει, φέρνουμε πάντα αρχική λίστα (χωρίς φίλτρο)
      this.customerSearchText = '';
      this.customerSearch$.next('');
    }
  }

  onCustomerSearchTextChange(v: string): void {
    this.customerSearchText = v;

    // Μόλις αρχίσει να ψάχνει, καθαρίζουμε την επιλογή (αν υπήρχε)
    if (this.selectedCustomer || this.header.traderId) {
      this.selectedCustomer = null;
      this.header.traderId = null;
    }

    this.customerSearch$.next(v);
  }

  selectCustomer(c: CustomerResponse): void {
    this.selectedCustomer = c;
    this.header.traderId = c.id;

    this.applyCustomerToDelivery(c);

    this.customerDropdownOpen = false;
    this.customerSearchText = '';
  }

  clearCustomer(): void {
    this.selectedCustomer = null;
    this.header.traderId = null;
    this.customerSearchText = '';

    // Αν είναι ανοιχτό, ξαναφόρτωσε λίστα ώστε να μη μείνει άδειο
    if (this.customerDropdownOpen) {
      this.customerSearch$.next('');
    } else {
      this.customerResults = [];
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


private applyCustomerToDelivery(customer: any): void {
  if (!customer) return;

  // Overwrite ΜΟΝΟ αυτών των πεδίων, κάθε φορά που αλλάζει ο πελάτης
  const addr = (customer.address ?? customer.adress ?? '').trim();
  const city = (customer.city ?? '').trim();
  const zip = (customer.zip ?? customer.postalCode ?? '').trim();

  this.delivery.addressLine1 = addr || null;
  this.delivery.city = city || null;
  this.delivery.region = city || null;
  this.delivery.postalCode = zip || null;
}



}

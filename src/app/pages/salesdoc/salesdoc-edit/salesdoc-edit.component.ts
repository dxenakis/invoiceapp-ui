// src/app/pages/salesdoc/salesdoc-edit/salesdoc-edit.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';
import { SalesdocService } from '../salesdoc.service';
import {
  SalesdocViewModel,
  SalesdocHeaderForm,
  SalesdocDeliveryForm,
  SalesdocLineForm,
  FindocResponse,
  SeriesLookup,
  BranchLookup,
  PaymentMethodLookup,
  ShipKindLookup,
  WhouseLookup,
  MtrLineRequest,
  FindocCreateRequest,
  Customer,
  Item,
} from '../salesdoc.models';

import { CustomersService } from '../../customer/customers.service';
import { ItemsService } from '../../items/items.service';
import { Page as CustomerPage } from '../../customer/customer.models';
import { Page as ItemsPage } from '../../items/items.models';
import { LookupsService, CountryLookup } from '../../../core/services/lookups.service';

type ActiveTab = 'document' | 'delivery';

@Component({
  standalone: true,
  selector: 'app-salesdoc-edit',
  templateUrl: './salesdoc-edit.component.html',
  styleUrls: ['./salesdoc-edit.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudFormToolbarComponent],
})
export class SalesdocEditComponent1 implements OnInit {
  activeTab: ActiveTab = 'document';

  // View model
  vm: SalesdocViewModel = {
    header: {
      seriesId: null,
      documentTypeId: null,
      branchId: null,
      traderId: null,
      traderDisplay: '',
      documentDate: new Date().toISOString().slice(0, 10),
      paymentMethodId: null,
      shipKindId: null,
    },
    lines: [],
    delivery: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      region: '',
      postalCode: '',
      countryCode: 'GR',
      whouseId: null,
    },
  };

  // lookups
  series: SeriesLookup[] = [];
  filteredSeries: SeriesLookup[] = [];
  branches: BranchLookup[] = [];
  paymentMethods: PaymentMethodLookup[] = [];
  shipKinds: ShipKindLookup[] = [];
  whouses: WhouseLookup[] = [];
  countries: CountryLookup[] = [];

  // helpers
  loading = false;
  saving = false;
  error?: string;
  docFromBackend?: FindocResponse;

  // customers / items
  customers: Customer[] = [];
  items: Item[] = [];

  customerSearchTerm = '';
  showCustomerPanel = false;

  itemSearchTerm = '';
  activeItemLineId: number | null = null; // tempId της γραμμής που έχει ανοιχτό το panel

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private salesdocService: SalesdocService,
    private customersService: CustomersService,
    private itemsService: ItemsService,
    private lookups: LookupsService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const isNew = !idParam || idParam === 'new';

    this.loadLookups();

    if (!isNew) {
      const id = Number(idParam);
      this.loadExistingDocument(id);
    } else {
      // αρχική μία κενή γραμμή
      this.addEmptyLine();
      this.loadCustomersAndItems();
    }
  }

  // ---------- Getters για template ----------

  get isExisting(): boolean {
    return !!this.vm.id;
  }

  get isDraft(): boolean {
    return !!this.docFromBackend && this.docFromBackend.status === 1;
  }

  get statusLabel(): string {
    if (!this.docFromBackend) return '';
    switch (this.docFromBackend.status) {
      case 1:
        return 'Draft';
      case 2:
        return 'Καταχωρημένο';
      case 3:
        return 'Ακυρωμένο';
      default:
        return '';
    }
  }

  // ---------- Load lookups & data ----------

  private loadLookups(): void {
    this.lookups.getCountries().subscribe({
      next: (countries) => (this.countries = countries ?? []),
      error: () => (this.countries = []),
    });

    this.salesdocService.getBranches().subscribe({
      next: (branches) => (this.branches = branches ?? []),
      error: () => (this.branches = []),
    });

    this.salesdocService.getSeries().subscribe({
      next: (series) => {
        this.series = series ?? [];
        this.filterSeriesByBranch();
      },
      error: () => (this.series = []),
    });

    this.salesdocService.getPaymentMethods().subscribe({
      next: (pm) => (this.paymentMethods = pm ?? []),
      error: () => (this.paymentMethods = []),
    });

    this.salesdocService.getShipKinds().subscribe({
      next: (sk) => (this.shipKinds = sk ?? []),
      error: () => (this.shipKinds = []),
    });
  }

  private loadCustomersAndItems(): void {
    this.customersService.list(0, 1000).subscribe({
      next: (page: CustomerPage<Customer>) => {
        this.customers = page.content ?? [];
      },
      error: () => (this.customers = []),
    });

    this.itemsService.list(0, 1000).subscribe({
      next: (page: ItemsPage<Item>) => {
        this.items = page.content ?? [];
      },
      error: () => (this.items = []),
    });
  }

  private loadExistingDocument(id: number): void {
    this.loading = true;
    this.salesdocService.get(id).subscribe({
      next: (doc) => {
        this.docFromBackend = doc;
        this.vm.id = doc.id;
        this.vm.header = {
          seriesId: doc.seriesId,
          documentTypeId: doc.documentTypeId,
          branchId: doc.branchId,
          traderId: doc.traderId,
          traderDisplay: doc.traderName || '',
          documentDate: doc.documentDate.substring(0, 10),
          paymentMethodId: doc.paymentMethodId ?? null,
          shipKindId: doc.shipKindId ?? null,
        };

        this.vm.delivery = {
          addressLine1: doc.mtrdoc?.addressLine1 || '',
          addressLine2: doc.mtrdoc?.addressLine2 || '',
          city: doc.mtrdoc?.city || '',
          region: doc.mtrdoc?.region || '',
          postalCode: doc.mtrdoc?.postalCode || '',
          countryCode: doc.mtrdoc?.countryCode || 'GR',
          whouseId: doc.mtrdoc?.whouseId ?? null,
        };

        this.vm.lines = (doc.mtrlines ?? []).map((l) => ({
          tempId: l.id, // για απλότητα
          backendId: l.id,
          lineNo: l.lineNo,
          mtrlId: l.mtrlId,
          code: l.mtrlCode || '',
          name: l.mtrlName || '',
          vatId: l.vatId,
          mtrUnitId: l.mtrUnitId,
          whouseId: l.whouseId,
          qty: l.qty,
          price: l.price,
          discountRate: l.discountRate,
        }));

        if (!this.vm.lines.length) this.addEmptyLine();

        if (doc.branchId) {
          this.loadWhouses(doc.branchId);
        }

        this.filterSeriesByBranch();
        this.loadCustomersAndItems();
        this.loading = false;
      },
      error: () => {
        this.error = 'Αποτυχία φόρτωσης παραστατικού.';
        this.loading = false;
      },
    });
  }

  // ---------- Tabs ----------

  setTab(tab: ActiveTab): void {
    this.activeTab = tab;
  }

  // ---------- Branch / Series / Whouse ----------

  onBranchChange(): void {
    this.filterSeriesByBranch();
    const branchId = this.vm.header.branchId;
    if (branchId) {
      this.loadWhouses(branchId);
    } else {
      this.whouses = [];
    }
  }

  private filterSeriesByBranch(): void {
    if (!this.vm.header.branchId) {
      this.filteredSeries = this.series.filter((s) => s.active !== false);
      return;
    }
    this.filteredSeries = this.series.filter(
      (s) => s.active !== false && s.branchId === this.vm.header.branchId
    );
  }

  onSeriesChange(): void {
    const selected = this.series.find((s) => s.id === this.vm.header.seriesId);
    this.vm.header.documentTypeId = selected?.documentTypeId ?? null;
  }

  private loadWhouses(branchId: number): void {
    this.salesdocService.getWhousesByBranch(branchId).subscribe({
      next: (wh) => (this.whouses = wh ?? []),
      error: () => (this.whouses = []),
    });
  }

  // ---------- CUSTOMER SEARCH (με «τέχνη») ----------

  get filteredCustomers(): Customer[] {
    const term = this.customerSearchTerm.trim().toLowerCase();
    if (!term) return this.customers;

    return this.customers.filter((c) => {
      const code = c.code?.toLowerCase() || '';
      const name = c.name?.toLowerCase() || '';
      const phone = c.phone?.toLowerCase() || '';
      const email = c.email?.toLowerCase() || '';
      return (
        code.includes(term) ||
        name.includes(term) ||
        phone.includes(term) ||
        email.includes(term)
      );
    });
  }

  onCustomerFocus(): void {
    this.showCustomerPanel = true;
  }

  onCustomerBlur(): void {
    setTimeout(() => (this.showCustomerPanel = false), 150);
  }

  selectCustomer(c: Customer): void {
    this.vm.header.traderId = c.id;
    this.vm.header.traderDisplay = `${c.code} - ${c.name}`;
    this.customerSearchTerm = this.vm.header.traderDisplay;

    // auto-fill delivery
    this.vm.delivery.addressLine1 = c.address || '';
    this.vm.delivery.city = c.city || '';
    this.vm.delivery.postalCode = c.zip || '';
    this.vm.delivery.region = this.vm.delivery.region || '';

    if (c.countryId && this.countries.length) {
      const country = this.countries.find((x) => x.id === c.countryId);
      if (country) {
        this.vm.delivery.countryCode = country.isoCode;
      }
    }
  }

  // ---------- ITEM SEARCH (per line) ----------

  get filteredItems(): Item[] {
    const term = this.itemSearchTerm.trim().toLowerCase();
    if (!term) return this.items;

    return this.items.filter((m) => {
      const code = m.code?.toLowerCase() || '';
      const name = m.name?.toLowerCase() || '';
      return code.includes(term) || name.includes(term);
    });
  }

  openItemPanel(line: SalesdocLineForm): void {
    this.activeItemLineId = line.tempId;
    this.itemSearchTerm = line.code || line.name || '';
  }

  closeItemPanel(): void {
    setTimeout(() => (this.activeItemLineId = null), 150);
  }

  selectItemForLine(line: SalesdocLineForm, m: Item): void {
    line.mtrlId = m.id;
    line.code = m.code;
    line.name = m.name;
    line.vatId = m.vatId ?? null;
    line.mtrUnitId = m.mtrunitId ?? null;
    line.price = m.pricer ?? 0;
    this.itemSearchTerm = `${m.code} - ${m.name}`;
  }

  // ---------- LINES (frontend only μέχρι Save) ----------

  addEmptyLine(): void {
    const nextTempId =
      (this.vm.lines.length ? this.vm.lines[this.vm.lines.length - 1].tempId : 0) +
      1;
    const nextLineNo =
      (this.vm.lines.length ? this.vm.lines[this.vm.lines.length - 1].lineNo : 0) +
      1;

    this.vm.lines.push({
      tempId: nextTempId,
      lineNo: nextLineNo,
      backendId: null,
      mtrlId: null,
      code: '',
      name: '',
      vatId: null,
      mtrUnitId: null,
      whouseId: this.vm.delivery.whouseId ?? null,
      qty: 1,
      price: 0,
      discountRate: 0,
    });
  }

  removeLine(line: SalesdocLineForm): void {
    if (this.vm.lines.length === 1) {
      // αφήνω πάντα τουλάχιστον μία κενή
      this.vm.lines[0] = {
        ...this.vm.lines[0],
        mtrlId: null,
        code: '',
        name: '',
        qty: 1,
        price: 0,
        discountRate: 0,
      };
    } else {
      this.vm.lines = this.vm.lines.filter((l) => l.tempId !== line.tempId);
    }
  }

  // ---------- SAVE ALL (header + lines + delivery) ----------

  onSave(): void {
    this.error = undefined;

    // validation light
    if (!this.vm.header.seriesId) {
      this.error = 'Παρακαλώ επιλέξτε Σειρά.';
      return;
    }
    if (!this.vm.header.branchId) {
      this.error = 'Παρακαλώ επιλέξτε Υποκατάστημα.';
      return;
    }
    if (!this.vm.header.traderId) {
      this.error = 'Παρακαλώ επιλέξτε Πελάτη.';
      return;
    }

    const nonEmptyLines = this.vm.lines.filter(
      (l) => l.mtrlId || l.code.trim() || l.name.trim()
    );
    if (!nonEmptyLines.length) {
      this.error = 'Παρακαλώ καταχωρήστε τουλάχιστον μία γραμμή.';
      return;
    }

    this.saving = true;

    if (!this.vm.id) {
      // νέο παραστατικό
      const headerReq: FindocCreateRequest = {
        documentTypeId: this.vm.header.documentTypeId,
        branchId: this.vm.header.branchId,
        seriesId: this.vm.header.seriesId,
        traderId: this.vm.header.traderId,
        documentDate: this.vm.header.documentDate,
        documentDomain: 1351,
        paymentMethodId: this.vm.header.paymentMethodId,
        shipKindId: this.vm.header.shipKindId,
      };

      this.salesdocService.createHeader(headerReq).subscribe({
        next: (doc) => {
          this.vm.id = doc.id;
          this.docFromBackend = doc;
          this.saveLinesAndDelivery(doc.id, nonEmptyLines);
        },
        error: () => {
          this.error = 'Αποτυχία δημιουργίας παραστατικού.';
          this.saving = false;
        },
      });
    } else {
      // υπάρχον draft → σώζω μόνο γραμμές + delivery
      this.saveLinesAndDelivery(this.vm.id, nonEmptyLines);
    }
  }

  private saveLinesAndDelivery(findocId: number, lines: SalesdocLineForm[]): void {
    // σώζω σειριακά τις γραμμές
    const saveNextLine = (index: number) => {
      if (index >= lines.length) {
        // τέλος γραμμών → σώζω delivery
        this.salesdocService
          .updateDelivery(findocId, this.vm.delivery)
          .subscribe({
            next: (doc) => {
              this.docFromBackend = doc;
              this.saving = false;
              // ανανέωση vm.lines από backend (για ποσά κτλ)
              this.vm.lines = (doc.mtrlines ?? []).map((l) => ({
                tempId: l.id,
                backendId: l.id,
                lineNo: l.lineNo,
                mtrlId: l.mtrlId,
                code: l.mtrlCode || '',
                name: l.mtrlName || '',
                vatId: l.vatId,
                mtrUnitId: l.mtrUnitId,
                whouseId: l.whouseId,
                qty: l.qty,
                price: l.price,
                discountRate: l.discountRate,
              }));
            },
            error: () => {
              this.error = 'Αποτυχία αποθήκευσης στοιχείων παράδοσης.';
              this.saving = false;
            },
          });
        return;
      }

      const l = lines[index];

      const req: MtrLineRequest = {
        mtrlId: l.mtrlId,
        vatId: l.vatId,
        mtrUnitId: l.mtrUnitId,
        whouseId: l.whouseId ?? this.vm.delivery.whouseId ?? null,
        lineNo: l.lineNo,
        qty: l.qty,
        price: l.price,
        discountRate: l.discountRate,
      };

      this.salesdocService.upsertLine(findocId, req).subscribe({
        next: () => saveNextLine(index + 1),
        error: () => {
          this.error = `Αποτυχία αποθήκευσης γραμμής ${l.lineNo}.`;
          this.saving = false;
        },
      });
    };

    saveNextLine(0);
  }

  onCancel(): void {
    this.router.navigate(['/app/salesdocs']);
  }

  // ---------- Post / Cancel doc ----------

  postDocument(): void {
    if (!this.vm.id || !this.isDraft) return;
    if (!confirm('Οριστικοποίηση παραστατικού;')) return;

    this.saving = true;
    this.salesdocService.postDocument(this.vm.id).subscribe({
      next: (doc) => {
        this.docFromBackend = doc;
        this.saving = false;
      },
      error: () => {
        this.error = 'Αποτυχία οριστικοποίησης.';
        this.saving = false;
      },
    });
  }

  cancelDocument(): void {
    if (!this.vm.id || !this.isDraft) return;
    if (!confirm('Ακύρωση παραστατικού;')) return;

    this.saving = true;
    this.salesdocService.cancelDocument(this.vm.id).subscribe({
      next: (doc) => {
        this.docFromBackend = doc;
        this.saving = false;
      },
      error: () => {
        this.error = 'Αποτυχία ακύρωσης.';
        this.saving = false;
      },
    });
  }
}

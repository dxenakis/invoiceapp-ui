import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CrudToolbarComponent } from '../../../layout/crud-toolbar/crud-toolbar.component';

import { SalesDocsService } from '../sales-docs.service';
import { FindocResponse, Page } from '../sales-docs.models';

import {
  SalesDocsLookupsService,
  BranchLookup,
  SeriesLookup,
  PaymentMethodLookup,
  ShipKindLookup,
  DocumentTypeLookup,
} from '../sales-docs-lookups.service';

@Component({
  standalone: true,
  selector: 'app-sales-docs-list',
  imports: [CommonModule, FormsModule, RouterModule, CrudToolbarComponent],
  templateUrl: './sales-docs-list.component.html',
  styleUrls: ['./sales-docs-list.component.css'],
})
export class SalesDocsListComponent implements OnInit {
  page: Page<FindocResponse> | null = null;
  loading = false;

  searchTerm = '';
  pageSize = 20;
  selectedId: number | null = null;

  // lookups maps (id -> entity)
  branchMap = new Map<number, BranchLookup>();
  seriesMap = new Map<number, SeriesLookup>();
  paymentMap = new Map<number, PaymentMethodLookup>();
  shipKindMap = new Map<number, ShipKindLookup>();
  docTypeMap = new Map<number, DocumentTypeLookup>();

  constructor(
    private salesDocs: SalesDocsService,
    private lookups: SalesDocsLookupsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadLookups();
    this.loadPage(0);
  }

  private loadLookups(): void {
    this.lookups.getBranches().subscribe({
      next: (branches) => {
        this.branchMap = new Map(branches.map((b) => [b.id, b]));
      },
      error: (err) => console.error('Error loading branches', err),
    });

    this.lookups.getSeries().subscribe({
      next: (list) => {
        this.seriesMap = new Map(list.map((s) => [s.id, s]));
      },
      error: (err) => console.error('Error loading series', err),
    });

    this.lookups.getPaymentMethods().subscribe({
      next: (list) => {
        this.paymentMap = new Map(list.map((p) => [p.id, p]));
      },
      error: (err) => console.error('Error loading payment methods', err),
    });

    this.lookups.getShipKinds().subscribe({
      next: (list) => {
        this.shipKindMap = new Map(list.map((s) => [s.id, s]));
      },
      error: (err) => console.error('Error loading ship kinds', err),
    });

    this.lookups.getDocumentTypes().subscribe({
      next: (list) => {
        this.docTypeMap = new Map(list.map((d) => [d.id, d]));
      },
      error: (err) => console.error('Error loading document types', err),
    });
  }

  loadPage(pageIndex: number): void {
    this.loading = true;
    this.salesDocs.list(pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.page = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading sales docs', err);
        this.loading = false;
      },
    });
  }

  // helpers εμφάνισης lookups
  docTypeLabel(id: number | null): string {
    if (!id) return '';
    const d = this.docTypeMap.get(id);
    return d ? `${d.code} - ${d.description}` : `${id}`;
  }

  branchLabel(id: number | null): string {
    if (!id) return '';
    const b = this.branchMap.get(id);
    return b ? `${b.code} - ${b.name}` : `${id}`;
  }

  seriesLabel(id: number | null): string {
    if (!id) return '';
    const s = this.seriesMap.get(id);
    return s ? s.code : `${id}`;
  }

  paymentLabel(id: number | null): string {
    if (!id) return '';
    const p = this.paymentMap.get(id);
    return p ? p.description ?? p.code : `${id}`;
  }

  shipKindLabel(id: number | null): string {
    if (!id) return '';
    const s = this.shipKindMap.get(id);
    return s ? s.name : `${id}`;
  }

  domainLabel(domain: string): string {
    switch (domain) {
      case 'SALES':
        return 'Πωλήσεις';
      case 'PURCHASES':
        return 'Αγορές';
      case 'COLLECTIONS':
        return 'Εισπράξεις';
      case 'PAYMENTS':
        return 'Πληρωμές';
      default:
        return domain;
    }
  }

  // toolbar actions
  newDoc(): void {
    this.router.navigate(['/app/sales-docs', 'new']);
  }

  openDoc(row: FindocResponse): void {
    this.selectedId = row.id;
    this.router.navigate(['/app/sales-docs', row.id]);
  }

  refresh(): void {
    this.loadPage(this.page?.number ?? 0);
  }

  printDocs(): void {
    console.log('Print sales docs (TODO)');
  }

  exportDocs(): void {
    console.log('Export sales docs (TODO)');
  }
}

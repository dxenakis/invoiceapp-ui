// src/app/pages/salesdoc/salesdoc-list/salesdoc-list.component.ts

import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrudToolbarComponent } from '../../../layout/crud-toolbar/crud-toolbar.component';
import { SalesdocService } from '../salesdoc.service';
import {
  FindocResponse,
  Page,
  DocumentStatusFilter,
} from '../salesdoc.models';

@Component({
  standalone: true,
  selector: 'app-salesdoc-list',
  templateUrl: './salesdoc-list.component.html',
  styleUrls: ['./salesdoc-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudToolbarComponent],
})
export class SalesdocListComponent1 implements OnInit {
  page?: Page<FindocResponse>;
  loading = false;
  error?: string;

  searchTerm = '';
  statusFilter: DocumentStatusFilter = 'ALL';
  selectedDoc: FindocResponse | null = null;

  constructor(
    private salesdocService: SalesdocService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    this.loading = true;
    this.error = undefined;

    this.salesdocService.list(pageIndex, 20, this.statusFilter).subscribe({
      next: (res) => {
        this.page = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Σφάλμα κατά την ανάκτηση των παραστατικών.';
        this.loading = false;
      },
    });
  }

  onStatusFilterChange(): void {
    this.loadPage(0);
  }

  get filteredDocs(): FindocResponse[] {
    if (!this.page) return [];
    const docs = this.page.content ?? [];
    if (!this.searchTerm.trim()) return docs;

    const term = this.searchTerm.toLowerCase();

    return docs.filter((d) => {
      const num = d.printedNumber || d.number?.toString() || '';
      const trader = d.traderName || '';
      const series = d.seriesCode || '';
      return (
        num.toLowerCase().includes(term) ||
        trader.toLowerCase().includes(term) ||
        series.toLowerCase().includes(term)
      );
    });
  }

  newDocument(): void {
    this.router.navigate(['/app/salesdocs/new']);
  }

  editDocument(doc: FindocResponse): void {
    this.router.navigate(['/app/salesdocs', doc.id]);
  }

  selectDoc(doc: FindocResponse): void {
    this.selectedDoc = doc;
  }

  printDocs(): void {
    console.log('TODO print');
  }

  exportDocs(): void {
    console.log('TODO export');
  }
}

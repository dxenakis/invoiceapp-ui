// src/app/pages/series/series-list/series-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrudToolbarComponent } from '../../../layout/crud-toolbar/crud-toolbar.component';
import { SeriesService } from '../series.service';
import { Page, SeriesResponse } from '../series.models';

@Component({
  standalone: true,
  selector: 'app-series-list',
  templateUrl: './series-list.component.html',
  styleUrls: ['./series-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudToolbarComponent],
})
export class SeriesListComponent implements OnInit {
  page: Page<SeriesResponse> | null = null;
  loading = false;
  error: string | null = null;

  pageSize = 20;
  searchTerm = '';
  selectedSeries: SeriesResponse | null = null;

  constructor(private seriesService: SeriesService, private router: Router) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    this.loading = true;
    this.error = null;

    this.seriesService.list(pageIndex, this.pageSize).subscribe({
      next: (res) => {
        this.page = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading series', err);
        this.error = 'Αποτυχία φόρτωσης σειρών.';
        this.loading = false;
      },
    });
  }

  get filteredSeries(): SeriesResponse[] {
    if (!this.page) return [];
    if (!this.searchTerm.trim()) return this.page.content;

    const term = this.searchTerm.toLowerCase();

    return this.page.content.filter((s) => {
      const code = s.code?.toLowerCase() ?? '';
      const desc = s.description?.toLowerCase() ?? '';
      const dtCode = s.documentType?.code?.toLowerCase() ?? '';
      const dtDesc = s.documentType?.description?.toLowerCase() ?? '';
      const brCode = s.branch?.code?.toLowerCase() ?? '';
      const brName = s.branch?.name?.toLowerCase() ?? '';
      const whCode = s.whouse?.code?.toLowerCase() ?? '';
      const whName = s.whouse?.name?.toLowerCase() ?? '';

      return (
        code.includes(term) ||
        desc.includes(term) ||
        dtCode.includes(term) ||
        dtDesc.includes(term) ||
        brCode.includes(term) ||
        brName.includes(term) ||
        whCode.includes(term) ||
        whName.includes(term)
      );
    });
  }

  newSeries(): void {
    this.router.navigate(['/app/settings/series', 'new']);
  }

  editSeries(s: SeriesResponse): void {
    this.router.navigate(['/app/settings/series', s.id]);
  }

  selectSeries(s: SeriesResponse): void {
    this.selectedSeries = s;
  }

  // placeholders για μελλοντική υλοποίηση
  printSeries(): void {
    console.log('Print series');
  }

  exportSeries(): void {
    console.log('Export series');
  }
}

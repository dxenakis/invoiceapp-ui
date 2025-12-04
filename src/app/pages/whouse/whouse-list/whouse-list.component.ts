// src/app/pages/whouse/whouse-list/whouse-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrudToolbarComponent } from '../../../layout/crud-toolbar/crud-toolbar.component';
import { WhouseService } from '../whouse.service';
import { Page, WhouseResponse } from '../whouse.models';

@Component({
  standalone: true,
  selector: 'app-whouse-list',
  templateUrl: './whouse-list.component.html',
  styleUrls: ['./whouse-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudToolbarComponent],
})
export class WhouseListComponent implements OnInit {
  page: Page<WhouseResponse> | null = null;
  loading = false;
  error: string | null = null;

  pageSize = 20;
  searchTerm = '';
  selectedWhouse: WhouseResponse | null = null;

  constructor(private whouseService: WhouseService, private router: Router) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    this.loading = true;
    this.error = null;

    this.whouseService.list(pageIndex, this.pageSize, null, null).subscribe({
      next: (res) => {
        this.page = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading whouses', err);
        this.error = 'Αποτυχία φόρτωσης αποθηκών.';
        this.loading = false;
      },
    });
  }

  newWhouse(): void {
    this.router.navigate(['/app/settings/whouse', 'new']);
  }

  editWhouse(w: WhouseResponse): void {
    this.router.navigate(['/app/settings/whouse', w.id]);
  }

  deleteWhouse(w: WhouseResponse): void {
    if (!confirm(`Διαγραφή αποθήκης "${w.code} - ${w.name}" ;`)) {
      return;
    }
    this.whouseService.delete(w.id).subscribe({
      next: () => {
        this.loadPage(this.page?.number ?? 0);
      },
      error: (err) => {
        console.error('Error deleting whouse', err);
        this.error = 'Αποτυχία διαγραφής αποθήκης.';
      },
    });
  }

  selectWhouse(w: WhouseResponse): void {
    this.selectedWhouse = w;
  }

  printWhouses(): void {
    console.log('Print whouses');
  }

  exportWhouses(): void {
    console.log('Export whouses');
  }
}

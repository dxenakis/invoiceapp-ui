// src/app/pages/series/series-edit/series-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  DocumentDomainOption, DOCUMENT_DOMAINS } from '../../../core/models/domain.model'
import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';

import { SeriesRequest, SeriesResponse, Page } from '../series.models';
import { SeriesService } from '../series.service';

import { BranchService } from '../../branch/branch.service';
import { BranchResponse } from '../../branch/branch.models';

import { WhouseService } from '../../whouse/whouse.service';
import { WhouseResponse } from '../../whouse/whouse.models';

import {
  DocumentTypeResponse,
} from '../../document-types/document-types.models';
import { DocumentTypesService } from '../../document-types/document-types.service';

@Component({
  standalone: true,
  selector: 'app-series-edit',
  templateUrl: './series-edit.component.html',
  styleUrls: ['./series-edit.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudFormToolbarComponent],
})
export class SeriesEditComponent implements OnInit {
  seriesId: number | null = null;

  model: SeriesRequest = {
    documentTypeId: null,
    branchId: null,
    whouseId: null,
    domain:null,
    code: '',
    description: '',
    active: true,
    prefix: '',
    formatPattern: '',
    paddingLength: 4,
  };

  domains: DocumentDomainOption[] = DOCUMENT_DOMAINS;
  loading = false;
  saving = false;
  error: string | null = null;

  branches: BranchResponse[] = [];
  whouses: WhouseResponse[] = [];
  documentTypes: DocumentTypeResponse[] = [];


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private seriesService: SeriesService,
    private branchService: BranchService,
    private whouseService: WhouseService,
    private documentTypesService: DocumentTypesService
  ) {}

  ngOnInit(): void {
    // φορτώνουμε lookups
    this.loadBranches();
    this.loadDocumentTypes();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.seriesId = +idParam;
      this.loadSeries(this.seriesId);
    }
  }

  // ------------------- LOADERS -------------------

  loadBranches(): void {
    // παράδειγμα: ενεργά, μέχρι 100 – προσαρμόζεις ανάλογα με το service σου
    this.branchService.list(0, 100, true).subscribe({
      next: (res: Page<BranchResponse>) => {
        this.branches = res.content ?? [];
      },
      error: (err) => {
        console.error('Error loading branches for series', err);
        this.branches = [];
      },
    });
  }

  loadWhousesForBranch(branchId: number | null): void {
    if (branchId == null) {
      this.whouses = [];
      return;
    }

    this.whouseService.list(0, 100, true, branchId).subscribe({
      next: (res: Page<WhouseResponse>) => {
        this.whouses = res.content ?? [];
      },
      error: (err) => {
        console.error('Error loading whouses for series', err);
        this.whouses = [];
      },
    });
  }

  loadDocumentTypes(): void {
    this.documentTypesService.list(0, 100).subscribe({
      next: (res: Page<DocumentTypeResponse>) => {
        this.documentTypes = res.content ?? [];
      },
      error: (err) => {
        console.error('Error loading document types for series', err);
        this.documentTypes = [];
      },
    });
  }

  loadSeries(id: number): void {
    this.loading = true;
    this.error = null;

    this.seriesService.get(id).subscribe({
      next: (res: SeriesResponse) => {
        this.model = {
          documentTypeId: res.documentType?.id ?? null,
          branchId: res.branch?.id ?? null,
          whouseId: res.whouse?.id ?? null,
          domain: res.domain ?? null,
          code: res.code,
          description: res.description ?? '',
          active: res.active,
          prefix: res.prefix ?? '',
          formatPattern: res.formatPattern ?? '',
          paddingLength: res.paddingLength ?? 4,
        };

        if (this.model.branchId != null) {
          this.loadWhousesForBranch(this.model.branchId);
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading series', err);
        this.error = 'Αποτυχία φόρτωσης σειράς.';
        this.loading = false;
      },
    });
  }

  // ------------------- EVENTS -------------------

  onBranchChange(branchId: number | null): void {
    this.model.branchId = branchId;
    this.model.whouseId = null;
    this.loadWhousesForBranch(branchId);
  }

  // ------------------- CRUD ACTIONS -------------------

  save(): void {
    this.error = null;

    if (!this.model.code || !this.model.code.trim()) {
      this.error = 'Ο κωδικός είναι υποχρεωτικός.';
      return;
    }
    if (this.model.documentTypeId == null) {
      this.error = 'Ο τύπος παραστατικού είναι υποχρεωτικός.';
      return;
    }

    this.saving = true;

    const payload: SeriesRequest = {
      ...this.model,
      code: this.model.code.trim(),
      description: this.model.description?.trim() ?? '',
    };

    const obs = this.seriesId
      ? this.seriesService.update(this.seriesId, payload)
      : this.seriesService.create(payload);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/settings/series']);
      },
      error: (err) => {
        console.error('Error saving series', err);
        this.error = 'Αποτυχία αποθήκευσης.';
        this.saving = false;
      },
    });
  }

  delete(): void {
    if (!this.seriesId) return;
    if (!confirm('Σίγουρα θέλεις να διαγράψεις αυτή τη σειρά;')) return;

    this.saving = true;
    this.error = null;

    this.seriesService.delete(this.seriesId).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/settings/series']);
      },
      error: (err) => {
        console.error('Error deleting series', err);
        this.error = 'Αποτυχία διαγραφής.';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/settings/series']);
  }
}

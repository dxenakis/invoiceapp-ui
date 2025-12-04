// src/app/pages/document-types/document-types-edit/document-types-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';
import {
  DocumentTypeRequest,
  DocumentTypeResponse,
  DOCUMENT_DOMAINS,
  DocumentDomainOption,
} from '../document-types.models';
import {
  TprmsResponse,
  IteprmsResponse,
} from '../document-types-lookups.models';
import { DocumentTypesService } from '../document-types.service';
import { DocumentTypesLookupsService } from '../document-types-lookups.service';

@Component({
  standalone: true,
  selector: 'app-document-types-edit',
  templateUrl: './document-types-edit.component.html',
  styleUrls: ['./document-types-edit.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudFormToolbarComponent],
})
export class DocumentTypesEditComponent implements OnInit {
  docTypeId: number | null = null;
  loading = false;
  saving = false;
  error: string | null = null;

  domains: DocumentDomainOption[] = DOCUMENT_DOMAINS;

  model: DocumentTypeRequest = {
    code: '',
    description: '',
    domain: null,
    tprmsId: null,
    iteprmsId: null,
  };

  // Επιλογές για dropdown
  tprmsOptions: TprmsResponse[] = [];
  iteprmsOptions: IteprmsResponse[] = [];

  // Cache ανά domain
  private tprmsCache = new Map<number, TprmsResponse[]>();
  private iteprmsCache = new Map<number, IteprmsResponse[]>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: DocumentTypesService,
    private lookupsService: DocumentTypesLookupsService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.docTypeId = +idParam;
      this.loadDocumentType(this.docTypeId);
    }
  }

  loadDocumentType(id: number): void {
    this.loading = true;
    this.error = null;

    this.service.getById(id).subscribe({
      next: (dto: DocumentTypeResponse) => {
        this.model = {
          code: dto.code,
          description: dto.description,
          domain: dto.domain,
          tprmsId: dto.tprmsId ?? null,
          iteprmsId: dto.iteprmsId ?? null,
        };
        this.loading = false;

        // Μόλις ξέρουμε το domain, φέρνουμε τα lookups
        if (this.model.domain) {
          this.onDomainChange(this.model.domain, true);
        }
      },
      error: (err) => {
        console.error('Error loading document type', err);
        this.error = 'Αποτυχία φόρτωσης τύπου παραστατικού.';
        this.loading = false;
      },
    });
  }

  /**
   * Καλείται όταν αλλάζει το domain στο dropdown.
   * Αν υπάρχουν δεδομένα στην cache, τα χρησιμοποιεί.
   * Αλλιώς κάνει κλήσεις στο backend για TPRMS & ITEPRMS.
   */
  onDomainChange(domain: number | null, keepSelected = false): void {
    if (!domain) {
      this.tprmsOptions = [];
      this.iteprmsOptions = [];
      if (!keepSelected) {
        this.model.tprmsId = null;
        this.model.iteprmsId = null;
      }
      return;
    }

    const cachedTprms = this.tprmsCache.get(domain);
    const cachedIteprms = this.iteprmsCache.get(domain);

    if (cachedTprms && cachedIteprms) {
      this.tprmsOptions = cachedTprms;
      this.iteprmsOptions = cachedIteprms;
      if (!keepSelected) {
        this.model.tprmsId = null;
        this.model.iteprmsId = null;
      }
      return;
    }

    this.loading = true;
    this.error = null;

    forkJoin({
      tprms: this.lookupsService.getTprmsByDomain(domain),
      iteprms: this.lookupsService.getIteprmsByDomain(domain),
    }).subscribe({
      next: ({ tprms, iteprms }) => {
        this.tprmsCache.set(domain, tprms);
        this.iteprmsCache.set(domain, iteprms);

        this.tprmsOptions = tprms;
        this.iteprmsOptions = iteprms;

        if (!keepSelected) {
          this.model.tprmsId = null;
          this.model.iteprmsId = null;
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading lookups for domain', domain, err);
        this.error =
          'Αποτυχία φόρτωσης σειρών παραστατικών / παραμέτρων αποθήκης.';
        this.loading = false;
        this.tprmsOptions = [];
        this.iteprmsOptions = [];
      },
    });
  }

  save(): void {
    if (!this.model.code || !this.model.description || !this.model.domain) {
      this.error = 'Συμπλήρωσε Κωδικό, Περιγραφή και Domain.';
      return;
    }

    this.saving = true;
    this.error = null;

    const obs = this.docTypeId
      ? this.service.update(this.docTypeId, this.model)
      : this.service.create(this.model);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/settings/document-types']);
      },
      error: (err) => {
        console.error('Error saving document type', err);
        this.error = 'Αποτυχία αποθήκευσης τύπου παραστατικού.';
        this.saving = false;
      },
    });
  }

  delete(): void {
    if (!this.docTypeId) return;
    if (!confirm('Να διαγραφεί ο τύπος παραστατικού;')) return;

    this.saving = true;
    this.error = null;

    this.service.delete(this.docTypeId).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/settings/document-types']);
      },
      error: (err) => {
        console.error('Error deleting document type', err);
        this.error = 'Αποτυχία διαγραφής τύπου παραστατικού.';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/settings/document-types']);
  }
}

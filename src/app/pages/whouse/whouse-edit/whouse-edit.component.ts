// src/app/pages/whouse/whouse-edit/whouse-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';
import { WhouseService } from '../whouse.service';
import { WhouseRequest, WhouseResponse } from '../whouse.models';
import { BranchService } from '../../branch/branch.service';
import { BranchResponse } from '../../branch/branch.models';

@Component({
  standalone: true,
  selector: 'app-whouse-edit',
  templateUrl: './whouse-edit.component.html',
  styleUrls: ['./whouse-edit.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudFormToolbarComponent],
})
export class WhouseEditComponent implements OnInit {
  whouseId?: number;

  model: WhouseRequest = {
    code: '',
    name: '',
    description: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    region: '',
    postalCode: '',
    countryCode: 'GR',
    phone: '',
    email: '',
    headquarters: false,
    active: true,
    branchId: 0,
  };

  branches: BranchResponse[] = [];

  loading = false;
  saving = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private whouseService: WhouseService,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    // φορτώνουμε πρώτα τα υποκαταστήματα για dropdown
    this.loadBranches();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.whouseId = +idParam;
      this.loadWhouse(this.whouseId);
    }
  }

  loadBranches(): void {
    // φέρνουμε π.χ. τα πρώτα 100 ενεργά υποκαταστήματα
    this.branchService.list(0, 100, true).subscribe({
      next: (res) => {
        this.branches = res.content ?? [];
      },
      error: (err) => {
        console.error('Error loading branches for whouse', err);
        this.branches = [];
      },
    });
  }

  loadWhouse(id: number): void {
    this.loading = true;
    this.error = null;

    this.whouseService.get(id).subscribe({
      next: (res: WhouseResponse) => {
        this.model = {
          code: res.code,
          name: res.name,
          description: res.description ?? '',
          addressLine1: res.addressLine1 ?? '',
          addressLine2: res.addressLine2 ?? '',
          city: res.city ?? '',
          region: res.region ?? '',
          postalCode: res.postalCode ?? '',
          countryCode: res.countryCode ?? 'GR',
          phone: res.phone ?? '',
          email: res.email ?? '',
          headquarters: res.headquarters,
          active: res.active,
          branchId: res.branchId,
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading whouse', err);
        this.error = 'Αποτυχία φόρτωσης αποθήκης.';
        this.loading = false;
      },
    });
  }

  save(): void {
    this.error = null;
    this.saving = true;

    if (!this.model.code || !this.model.name || !this.model.branchId) {
      this.error = 'Συμπλήρωσε Κωδικό, Ονομασία και Υποκατάστημα.';
      this.saving = false;
      return;
    }

    const req: WhouseRequest = { ...this.model };

    const obs = this.whouseId
      ? this.whouseService.update(this.whouseId, req)
      : this.whouseService.create(req);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/settings/whouse']);
      },
      error: (err) => {
        console.error('Error saving whouse', err);
        this.error = 'Αποτυχία αποθήκευσης.';
        this.saving = false;
      },
    });
  }

  delete(): void {
    if (!this.whouseId) return;
    if (!confirm('Σίγουρα θέλεις να διαγράψεις αυτή την αποθήκη;')) return;

    this.saving = true;
    this.whouseService.delete(this.whouseId).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/settings/whouse']);
      },
      error: (err) => {
        console.error('Error deleting whouse', err);
        this.error = 'Αποτυχία διαγραφής.';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/settings/whouse']);
  }
}

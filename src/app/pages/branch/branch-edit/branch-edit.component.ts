// src/app/pages/branch/branch-edit/branch-edit.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';
import { BranchService } from '../branch.service';
import { BranchRequest, BranchResponse } from '../branch.models';

@Component({
  standalone: true,
  selector: 'app-branch-edit',
  templateUrl: './branch-edit.component.html',
  styleUrls: ['./branch-edit.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudFormToolbarComponent],
})
export class BranchEditComponent implements OnInit {
  branchId?: number;

  model: BranchRequest = {
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
  };

  loading = false;
  saving = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private branchService: BranchService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam && idParam !== 'new') {
      this.branchId = +idParam;
      this.loadBranch(this.branchId);
    }
  }

  loadBranch(id: number): void {
    this.loading = true;
    this.error = null;

    this.branchService.get(id).subscribe({
      next: (res: BranchResponse) => {
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
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading branch', err);
        this.error = 'Αποτυχία φόρτωσης υποκαταστήματος.';
        this.loading = false;
      },
    });
  }

  save(): void {
    this.error = null;
    this.saving = true;

    if (!this.model.code || !this.model.name) {
      this.error = 'Συμπλήρωσε Κωδικό και Ονομασία.';
      this.saving = false;
      return;
    }

    const req: BranchRequest = { ...this.model };

    const obs = this.branchId
      ? this.branchService.update(this.branchId, req)
      : this.branchService.create(req);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/settings/branch']);
      },
      error: (err) => {
        console.error('Error saving branch', err);
        this.error = 'Αποτυχία αποθήκευσης.';
        this.saving = false;
      },
    });
  }

  delete(): void {
    if (!this.branchId) {
      return;
    }
    if (!confirm('Σίγουρα θέλεις να διαγράψεις αυτό το υποκατάστημα;')) {
      return;
    }

    this.saving = true;
    this.branchService.delete(this.branchId).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/settings/branch']);
      },
      error: (err) => {
        console.error('Error deleting branch', err);
        this.error = 'Αποτυχία διαγραφής.';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/settings/branch']);
  }
}

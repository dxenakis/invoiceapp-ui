// src/app/pages/branch/branch-list/branch-list.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CrudToolbarComponent } from '../../../layout/crud-toolbar/crud-toolbar.component';
import { BranchService } from '../branch.service';
import { BranchResponse, Page } from '../branch.models';

@Component({
  standalone: true,
  selector: 'app-branch-list',
  templateUrl: './branch-list.component.html',
  styleUrls: ['./branch-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudToolbarComponent],
})
export class BranchListComponent implements OnInit {
  page: Page<BranchResponse> | null = null;
  loading = false;
  error: string | null = null;

  pageSize = 20;
  searchTerm = '';

  selectedBranch: BranchResponse | null = null;

  constructor(private branchService: BranchService, private router: Router) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    this.loading = true;
    this.error = null;

    this.branchService.list(pageIndex, this.pageSize, null).subscribe({
      next: (res) => {
        this.page = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading branches', err);
        this.error = 'Αποτυχία φόρτωσης υποκαταστημάτων.';
        this.loading = false;
      },
    });
  }

  newBranch(): void {
    this.router.navigate(['/app/settings/branch', 'new']);
  }

  editBranch(branch: BranchResponse): void {
    this.router.navigate(['/app/settings/branch', branch.id]);
  }

  deleteBranch(branch: BranchResponse): void {
    if (!confirm(`Διαγραφή υποκαταστήματος "${branch.code} - ${branch.name}" ;`)) {
      return;
    }
    this.branchService.delete(branch.id).subscribe({
      next: () => {
        this.loadPage(this.page?.number ?? 0);
      },
      error: (err) => {
        console.error('Error deleting branch', err);
        this.error = 'Αποτυχία διαγραφής υποκαταστήματος.';
      },
    });
  }

  selectBranch(branch: BranchResponse): void {
    this.selectedBranch = branch;
  }

  // απλά για μελλοντική χρήση
  printBranches(): void {
    console.log('Print branches');
  }

  exportBranches(): void {
    console.log('Export branches');
  }
}

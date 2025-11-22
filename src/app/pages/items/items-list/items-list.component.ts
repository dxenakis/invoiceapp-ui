import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemsService } from '../items.service';
import {
  MtrlResponse,
  Page,
  ACCOUNTING_CATEGORY_LABELS,
} from '../items.models';

@Component({
  standalone: true,
  selector: 'app-items-list',
  templateUrl: './items-list.component.html',
  styleUrls: ['./items-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class ItemsListComponent implements OnInit {
  page?: Page<MtrlResponse>;
  loading = false;
  error?: string;
  searchTerm = '';

  ACCOUNTING_CATEGORY_LABELS = ACCOUNTING_CATEGORY_LABELS;

  constructor(
    private itemsService: ItemsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }

  loadPage(pageIndex: number): void {
    this.loading = true;
    this.error = undefined;

    this.itemsService.list(pageIndex, 20).subscribe({
      next: (res) => {
        this.page = res;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Κάτι πήγε στραβά κατά την ανάκτηση των ειδών.';
        this.loading = false;
      },
    });
  }

  get filteredItems(): MtrlResponse[] {
    if (!this.page) return [];
    if (!this.searchTerm.trim()) return this.page.content;

    const term = this.searchTerm.toLowerCase();
    return this.page.content.filter(
      (i) =>
        i.code.toLowerCase().includes(term) ||
        i.name.toLowerCase().includes(term) ||
        (i.name1 && i.name1.toLowerCase().includes(term))
    );
  }

  newItem(): void {
    this.router.navigate(['/app/items/new']);
  }

  editItem(item: MtrlResponse): void {
    this.router.navigate(['/app/items', item.id]);
  }

  deleteItem(item: MtrlResponse): void {
    if (!confirm(`Θέλεις σίγουρα να διαγράψεις το είδος "${item.name}" ;`)) {
      return;
    }

    this.itemsService.delete(item.id).subscribe({
      next: () => {
        this.loadPage(this.page?.number ?? 0);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Αποτυχία διαγραφής.';
      },
    });
  }
}

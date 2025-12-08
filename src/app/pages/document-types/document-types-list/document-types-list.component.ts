// src/app/pages/document-types/document-types-list/document-types-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { getDomainLabel} from '../../../core/models/domain.model'
import { CrudToolbarComponent } from '../../../layout/crud-toolbar/crud-toolbar.component';
import { DocumentTypeResponse,  Page,} from '../document-types.models';
import { DocumentTypesService } from '../document-types.service';

@Component({
  standalone: true,
  selector: 'app-document-types-list',
  templateUrl: './document-types-list.component.html',
  styleUrls: ['./document-types-list.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudToolbarComponent],
})
export class DocumentTypesListComponent implements OnInit {
  page: Page<DocumentTypeResponse> | null = null;
  loading = false;
  error: string | null = null;

  searchTerm = '';
  selected: DocumentTypeResponse | null = null;

  constructor(
    private service: DocumentTypesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPage(0);
  }



  loadPage(pageNumber: number): void {
    this.loading = true;
    this.error = null;

    this.service.list(pageNumber, 20).subscribe({
      next: (page) => {
        this.page = page;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading document types', err);
        this.error = 'Αποτυχία φόρτωσης τύπων παραστατικών.';
        this.loading = false;
      },
    });
  }

  get filteredDocumentTypes(): DocumentTypeResponse[] {
    if (!this.page) return [];
    if (!this.searchTerm.trim()) return this.page.content;

    const term = this.searchTerm.toLowerCase();
    return this.page.content.filter((d) =>
      (d.code && d.code.toLowerCase().includes(term)) ||
      (d.description && d.description.toLowerCase().includes(term))
    );
  }

  newDocumentType(): void {
    this.router.navigate(['/app/settings/document-types/new']);
  }

  editDocumentType(d: DocumentTypeResponse): void {
    this.router.navigate(['/app/settings/document-types', d.id]);
  }

  selectDocumentType(d: DocumentTypeResponse): void {
    this.selected = d;
  }

  printDocumentTypes(): void {
    console.log('Print document types');
  }

  exportDocumentTypes(): void {
    console.log('Export document types');
  }
  
 resolveDomain(domain: number){

    return getDomainLabel(domain);

 }

}

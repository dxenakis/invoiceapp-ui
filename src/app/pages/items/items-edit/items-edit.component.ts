import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AccountingCategory,
  ACCOUNTING_CATEGORY_LABELS,
  MtrlRequest,
  MtrlResponse,
} from '../items.models';
import { ItemsService } from '../items.service';
import { CrudFormToolbarComponent } from '../../../layout/crud-form-toolbar/crud-form-toolbar.component';
// ΝΕΟ:
import {  LookupsService,  MtrUnitLookup,  VatLookup,} from '../../../core/services/lookups.service';

@Component({
  standalone: true,
  selector: 'app-items-edit',
  templateUrl: './items-edit.component.html',
  styleUrls: ['./items-edit.component.css'],
  imports: [CommonModule, FormsModule, RouterModule, CrudFormToolbarComponent],
})
export class ItemsEditComponent implements OnInit {
  itemId?: number;

    model: MtrlRequest = {
    code: '',
    name: '',
    name1: '',
    accountCategory: AccountingCategory.EMPOREVMATA,
    pricer: 0,
    pricew: 0,
    mtrunitId: null,  // NEW
    vatId: null,      // NEW
    active: true,
  };

  mtrUnits: MtrUnitLookup[] = [];
  vats: VatLookup[] = [];
  ACCOUNTING_CATEGORY = AccountingCategory;
  ACCOUNTING_CATEGORY_LABELS = ACCOUNTING_CATEGORY_LABELS;

  loading = false;
  saving = false;
  error?: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private itemsService: ItemsService,
    private lookups: LookupsService 
  ) {}

 ngOnInit(): void {
    // πρώτα φορτώνουμε τα lookups
    this.loadLookups();

   
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && idParam !== 'new') {
      this.itemId = +idParam;
      this.loadItem(this.itemId);
    }
  }

   private loadLookups(): void {
    this.lookups.getMtrUnits().subscribe({
      next: (units) => (this.mtrUnits = units),
      error: (err) => {
        console.error('Error loading MtrUnits', err);
      },
    });

    this.lookups.getVats().subscribe({
      next: (vats) => (this.vats = vats),
      error: (err) => {
        console.error('Error loading Vats', err);
      },
    });
  }


    loadItem(id: number): void {
    this.loading = true;
    this.itemsService.get(id).subscribe({
      next: (res: MtrlResponse) => {
        this.model = {
          code: res.code,
          name: res.name,
          name1: res.name1 ?? '',
          accountCategory: res.accountCategory,
          pricer: res.pricer,
          pricew: res.pricew,

          // ΝΕΑ ΠΕΔΙΑ από το backend
          mtrunitId: res.mtrunitId ?? null,
          vatId: res.vatId ?? null,

          active: res.active,
          createdAt: res.createdAt ?? undefined,
          updatedAt: res.updatedAt ?? undefined,
        };

        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Αποτυχία φόρτωσης.';
        this.loading = false;
      },
    });
  }


  save(): void {
    this.saving = true;
    this.error = undefined;

    const req: MtrlRequest = { ...this.model };

    const obs = this.itemId
      ? this.itemsService.update(this.itemId, req)
      : this.itemsService.create(req);

    obs.subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/items']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Αποτυχία αποθήκευσης.';
        this.saving = false;
      },
    });
  }

  deleteItem(): void {
    if (!this.itemId) {
      return;
    }

    if (!confirm('Θέλεις σίγουρα να διαγράψεις αυτό το είδος;')) {
      return;
    }

    this.saving = true;

    this.itemsService.delete(this.itemId).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/app/items']);
      },
      error: (err) => {
        console.error(err);
        this.error = 'Αποτυχία διαγραφής.';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/app/items']);
  }

  categories(): AccountingCategory[] {
    return Object.values(AccountingCategory) as AccountingCategory[];
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-crud-toolbar',
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-toolbar.component.html',
  styleUrls: ['./crud-toolbar.component.css'],
})
export class CrudToolbarComponent {
  // κείμενο του search – το δένουμε με [(searchTerm)] από τον γονέα
  @Input() searchTerm = '';
  @Output() searchTermChange = new EventEmitter<string>();

  // placeholder για το search (να αλλάζει ανά entity)
  @Input() searchPlaceholder = 'Αναζήτηση…';

  // έλεγχος για το ποια κουμπιά θα φαίνονται (αν θες να κρύβεις/δείχνεις)
  @Input() showNew = true;
  @Input() showPrint = true;
  @Input() showExport = true;

  // events προς τον γονέα
  @Output() newClick = new EventEmitter<void>();
  @Output() printClick = new EventEmitter<void>();
  @Output() exportClick = new EventEmitter<void>();

  onSearchChange(value: string) {
    this.searchTerm = value;
    this.searchTermChange.emit(value);
  }
}

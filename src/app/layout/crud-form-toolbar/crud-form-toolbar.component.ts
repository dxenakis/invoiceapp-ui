import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-crud-form-toolbar',
  imports: [CommonModule],
  templateUrl: './crud-form-toolbar.component.html',
  styleUrls: ['./crud-form-toolbar.component.css'],
})
export class CrudFormToolbarComponent {
  /** Αν είναι true, δείχνουμε ότι γίνεται αποθήκευση & disable τα buttons */
  @Input() saving = false;

  /** Εμφάνιση / απόκρυψη delete button */
  @Input() showDelete = false;

  /** Events προς το parent component */
  @Output() saveClick = new EventEmitter<void>();
  @Output() cancelClick = new EventEmitter<void>();
  @Output() deleteClick = new EventEmitter<void>();
}

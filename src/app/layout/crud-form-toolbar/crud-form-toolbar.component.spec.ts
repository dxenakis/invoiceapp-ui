import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudFormToolbarComponent } from './crud-form-toolbar.component';

describe('CrudFormToolbarComponent', () => {
  let component: CrudFormToolbarComponent;
  let fixture: ComponentFixture<CrudFormToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudFormToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudFormToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

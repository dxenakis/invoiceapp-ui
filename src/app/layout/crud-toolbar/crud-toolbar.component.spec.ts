import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudToolbarComponent } from './crud-toolbar.component';

describe('CrudToolbarComponent', () => {
  let component: CrudToolbarComponent;
  let fixture: ComponentFixture<CrudToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrudToolbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrudToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

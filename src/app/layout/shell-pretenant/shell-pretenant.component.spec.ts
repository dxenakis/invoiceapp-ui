import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShellPretenantComponent } from './shell-pretenant.component';

describe('ShellPretenantComponent', () => {
  let component: ShellPretenantComponent;
  let fixture: ComponentFixture<ShellPretenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellPretenantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShellPretenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

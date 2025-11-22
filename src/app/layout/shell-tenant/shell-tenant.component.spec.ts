import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShellTenantComponent } from './shell-tenant.component';

describe('ShellTenantComponent', () => {
  let component: ShellTenantComponent;
  let fixture: ComponentFixture<ShellTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellTenantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShellTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

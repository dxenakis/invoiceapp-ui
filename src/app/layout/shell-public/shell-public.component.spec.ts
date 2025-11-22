import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShellPublicComponent } from './shell-public.component';

describe('ShellPublicComponent', () => {
  let component: ShellPublicComponent;
  let fixture: ComponentFixture<ShellPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShellPublicComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShellPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

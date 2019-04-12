import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorBookingHeaderComponent } from './doctor-booking-header.component';

describe('DoctorBookingHeaderComponent', () => {
  let component: DoctorBookingHeaderComponent;
  let fixture: ComponentFixture<DoctorBookingHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorBookingHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorBookingHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

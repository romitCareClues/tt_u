import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingVerificationComponent } from './booking-verification.component';

describe('BookingVerificationComponent', () => {
  let component: BookingVerificationComponent;
  let fixture: ComponentFixture<BookingVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookingVerificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

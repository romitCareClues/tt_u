import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CallToBookComponent } from './call-to-book.component';

describe('CallToBookComponent', () => {
  let component: CallToBookComponent;
  let fixture: ComponentFixture<CallToBookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CallToBookComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CallToBookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

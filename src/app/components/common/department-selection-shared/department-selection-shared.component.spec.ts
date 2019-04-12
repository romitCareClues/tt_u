import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentSelectionSharedComponent } from './department-selection-shared.component';

describe('DepartmentSelectionSharedComponent', () => {
  let component: DepartmentSelectionSharedComponent;
  let fixture: ComponentFixture<DepartmentSelectionSharedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepartmentSelectionSharedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepartmentSelectionSharedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

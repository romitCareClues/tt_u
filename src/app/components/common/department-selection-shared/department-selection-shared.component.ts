import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { CustomErrorStateMatcher } from '../../../validators';

import { ClinicService } from '../../../services/clinic.service';
import { CustomRouteService } from '../../../services/common/custom-route.service';

import * as moment from 'moment';

@Component({
  selector: 'app-department-selection-shared',
  templateUrl: './department-selection-shared.component.html',
  styleUrls: [
    './department-selection-shared.component.css',
    '../../widget-container/department-selection/department-selection.component.css'
  ],
  providers: [ClinicService]
})
export class DepartmentSelectionSharedComponent implements OnInit {
  @Output() reloadDoctorListEvent = new EventEmitter<any>();

  clinicId: number;
  clinicSlug: string;
  departments: any[];

  departmentSelectControl: FormControl;
  departmentSelectErrorMatcher: CustomErrorStateMatcher;
  appointmentDateSelectControl: FormControl;

  datePickerOptions: any;

  currentDate: string;
  departmentName: string;

  subscriptions: any[];

  referer: string;

  constructor(
    private clinicService: ClinicService,
    private route: ActivatedRoute,
    private router: Router,
    private customRouteService: CustomRouteService
  ) {
    this.subscriptions = [];
    this.currentDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit() {
    this.route.queryParams.subscribe(
      (params) => {
        this.referer = params['referer'];
        this.createAppointmentDateSelectionControl();
      }
    );
    this.extractAndSetRouteParams();
    this.departmentSelectErrorMatcher = new CustomErrorStateMatcher();
    this.createDepartmentSelectionControl();
    this.getClinicDepartments();
    this.setDepartmentName();
    this.onDepartmentChange();
    this.onAppointmentDateChange();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  createDepartmentSelectionControl(): void {
    this.departmentSelectControl = new FormControl('', [Validators.required]);
  }

  createAppointmentDateSelectionControl(): void {
    let datePreselectValue = this.getDatePreSelectValue();
    this.appointmentDateSelectControl = new FormControl(datePreselectValue, [Validators.required]);
  }

  getDatePreSelectValue(): any {
    let dateToReturn = this.currentDate;
    if (!this.isCurrentRouteDepartmentSelection()) {
      let locallySavedDate: string = localStorage.getItem('cc_appointment_date');
      if (locallySavedDate !== null && typeof this.referer !== 'undefined') {
        dateToReturn = this.getFormattedDate(locallySavedDate, 'YYYY-MM-DD');
      }
      else {
        localStorage.setItem('cc_appointment_date', dateToReturn);
      }
    }
    return dateToReturn;
  }

  extractAndSetRouteParams(): void {
    // this.clinicId = +this.route.snapshot.paramMap.get('clinicId');
    this.clinicId = +localStorage.getItem('cc_clinic_id');
    this.clinicSlug = this.route.snapshot.paramMap.get('clinicSlug');
    this.departmentName = this.route.snapshot.paramMap.get('departmentName');
  }

  getClinicDepartments(): void {
    let requestQuery: string = `pagination=false`;
    this.clinicService.fetchClinicDepartments(this.clinicId, requestQuery).subscribe(
      (successResponse) => {
        this.departments = successResponse.data;
      },
      (errorResponse) => {

      }
    );
  }

  setDepartmentName(): void {
    if (!this.isCurrentRouteDepartmentSelection()) {
      this.departmentSelectControl.patchValue(this.departmentName);
    }
  }

  onDepartmentChange(): void {
    let departmentChangeSubscription: any = this.departmentSelectControl.valueChanges.subscribe(
      (value) => {
        this.departmentName = value;
      }
    );
    this.subscriptions.push(departmentChangeSubscription);
  }

  onAppointmentDateChange(): void {
    let appointmentDateChangeSubscription: any = this.appointmentDateSelectControl.valueChanges.subscribe(
      (value) => {
        localStorage.setItem('cc_appointment_date', this.getFormattedDate(value, 'YYYY-MM-DD'));
      }
    );
    this.subscriptions.push(appointmentDateChangeSubscription);
  }

  onProceedButtonClick(): void {
    if (this.isCurrentRouteDepartmentSelection()) {
      this.redirectToDoctorListPage();
    }
    else {
      this.reloadDoctorListEvent.emit(this.departmentName);
    }
  }

  isCurrentRouteDepartmentSelection(): boolean {
    return this.customRouteService.currentRoute.includes('department-selection');
  }

  redirectToDoctorListPage(): void {
    this.router.navigate(['/doctor-list', this.clinicSlug, this.departmentName], { queryParams: { referer: '_department_selection' } });
  }

  getFormattedDate(date: any, format: string): string {
    return moment(date).format(format);
  }

  isDepartmentSelectionAllowed(): boolean {
    let status: boolean;
    if (this.isCurrentRouteDepartmentSelection() !== true) {
      status = typeof this.referer !== 'undefined';
    }
    else {
      status = true;
    }
    return status;
  }

}

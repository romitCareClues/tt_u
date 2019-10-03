import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams } from '@angular/common/http';

import { FormControl, Validators, FormGroup } from '@angular/forms';
import { CustomErrorStateMatcher } from '../../../validators';

import { DoctorService } from '../../../services/doctor.service';

import * as moment from 'moment';

import { debounceTime, distinctUntilChanged } from "rxjs/operators";

@Component({
  selector: 'app-department-selection',
  templateUrl: './department-selection.component.html',
  styleUrls: ['./department-selection.component.css'],
  providers: [DoctorService]
})
export class DepartmentSelectionComponent implements OnInit {

  clinicId: number;
  clinicSlug: string;
  departments: any[];

  departmentSelectControl: FormControl;
  departmentSelectErrorMatcher: CustomErrorStateMatcher;
  appointmentDateSelectControl: FormControl;

  datePickerOptions: any;

  searchQuery: string;
  searchFilters: HttpParams;
  doctorSearchResult: any[];
  searcDoctorControl: FormControl;

  currentDate: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorService: DoctorService
  ) {
    this.currentDate = moment().format('YYYY-MM-DD');
  }

  ngOnInit() {
    this.extractAndSetRouteParams();
    this.searcDoctorControl = new FormControl();
    this.attachSearchControlCallback();
  }

  extractAndSetRouteParams(): void {
    // this.clinicId = +this.route.snapshot.paramMap.get('clinicId');
    this.clinicId = +localStorage.getItem('cc_clinic_id');
    this.clinicSlug = this.route.snapshot.paramMap.get('clinicSlug');
  }

  attachSearchControlCallback(): void {
    this.searcDoctorControl.valueChanges
      .pipe(
        debounceTime(500)
      )
      .subscribe(() => {
        this.onSearch();
      });
  }

  onSearch(): void {
    this.searchQuery = this.searcDoctorControl.value;
    this.prepareSearchRequestQuery();
    this.getClinicDoctors();
  }

  prepareSearchRequestQuery(): void {
    // let searchQuery: string = typeof this.searchQuery !== 'undefined' ? `${this.searchQuery}*` : '*';
    let searchQuery: string = this.searchQuery ? `${this.searchQuery}*` : '';
    if (searchQuery.length > 3) {
      this.searchFilters = new HttpParams().set('facility_id', this.clinicId.toString())
        .set('filter[public_profile]', 'true')
        .set('expand', 'schedules,qualifications,reviews_count,specializations')
        .set('query[full_name]', searchQuery)
        .set('widget', 'true')
        .set('optimize', 'true')
        .set('date', this.currentDate)
        .set('filter[facilities.available_for_booking]', 'true')
        .set('pagination', 'false');
    }
    else {
      this.searchFilters = null;
    }
  }

  getClinicDoctors(): void {
    this.doctorSearchResult = [];
    if (this.searchFilters) {
      let searchQueryString: string = decodeURI(this.searchFilters.toString());
      this.doctorService.fetchClinicDoctorList(searchQueryString).subscribe(
        (successResponse) => {
          this.doctorSearchResult = successResponse.data;
        },
        (errorResponse) => {
          this.doctorSearchResult = [];
        }
      );
    }
  }

  getDoctorDisplayName(doctor: any): string {
    let doctorFulName: string = '';
    if (typeof doctor !== 'undefined') {
      let firstName: string = doctor.hasOwnProperty('first_name') ? doctor.first_name : '';
      let lastName: string = doctor.hasOwnProperty('last_name') ? doctor.last_name : '';
      doctorFulName = `${firstName} ${lastName}`.trim();
    }
    return doctorFulName;
  }

  onDoctorSelect(doctor: any): void {
    // localStorage.setItem('cc_doctor', JSON.stringify(doctor));
    let clinicSlug: string = localStorage.getItem('cc_clinic_slug');
    this.router.navigate(['/slot-selection', clinicSlug, doctor.uri]);
  }

}

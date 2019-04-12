import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ERROR_MESSAGES } from '../../../template-data';
import { PAGE_CONFIGURATIONS } from '../../../../configurations';
import { DoctorService } from '../../../services/doctor.service';

import { HttpParams } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrls: ['./doctor-list.component.css'],
  providers: [DoctorService]
})
export class DoctorListComponent implements OnInit {
  clinicId: number;
  clinicSlug: string;
  departmentName: string;
  doctorList: any[];
  doctorFound: boolean;

  errorMessages: any;

  currentPage: number;
  itemsPerPage: number;
  totalRecordCount: number;

  searchFilters: HttpParams;

  searchQuery: string;
  selectedDate: string;
  currentDate: string;

  constructor(
    private route: ActivatedRoute,
    private doctorService: DoctorService
  ) {
    this.setDefaultPaginationDetais();
    this.errorMessages = ERROR_MESSAGES.doctor_list;
    this.totalRecordCount = 0;
    this.searchQuery = '';
    this.doctorList = [];
    this.doctorFound = false;
    this.currentDate = moment().format('YYYY-MM-DD');
    this.selectedDate = localStorage.getItem('cc_appointment_date');
  }

  ngOnInit() {
    this.extractAndSetRouteParams();
    this.prepareSearchRequestQuery();
    this.getClinicDoctors();
  }

  setDefaultPaginationDetais(): void {
    this.currentPage = PAGE_CONFIGURATIONS.doctor_list.current_page;
    this.itemsPerPage = PAGE_CONFIGURATIONS.doctor_list.items_per_page;
  }

  extractAndSetRouteParams(): void {
    // this.clinicId = +this.route.snapshot.paramMap.get('clinicId');
    this.clinicId = +localStorage.getItem('cc_clinic_id');
    this.clinicSlug = this.route.snapshot.paramMap.get('clinicSlug');
    this.departmentName = this.route.snapshot.paramMap.get('departmentName');
  }

  prepareSearchRequestQuery(): void {
    let searchQuery: string = this.searchQuery.length > 0 ? `${this.searchQuery}*` : '*';
    this.searchFilters = new HttpParams().set('facility_id', this.clinicId.toString())
      .set('filter[public_profile]', 'true')
      .set('expand', 'schedules,qualifications,reviews_count,specializations')
      .set('query', searchQuery)
      .set('widget', 'true')
      .set('optimize', 'true')
      .set('page_size', this.itemsPerPage.toString())
      .set('page_no', this.currentPage.toString());

    if (typeof this.departmentName !== 'undefined' && this.departmentName !== null) {
      this.searchFilters = this.searchFilters.append('filter[facilities.departments.name][]', this.departmentName);
    }

    if (this.selectedDate != null) {
      this.searchFilters = this.searchFilters.append('date', this.selectedDate);
    }
    else {
      this.searchFilters = this.searchFilters.append('date', this.currentDate);
    }
  }

  isDoctorListAvailable(): boolean {
    return typeof this.doctorList !== 'undefined';
  }

  onPageNumberClick(event: any): void {
    this.currentPage = event;
    this.prepareSearchRequestQuery();
    this.getClinicDoctors();
  }

  getClinicDoctors(): void {
    let searchQueryString: string = decodeURI(this.searchFilters.toString());
    this.doctorService.fetchClinicDoctorList(searchQueryString).subscribe(
      (successResponse) => {
        this.doctorFound = true;
        this.doctorList = this.sortDoctorListByBookAppointAavailability(successResponse.data);
        this.totalRecordCount = successResponse.meta.total;
      },
      (errorResponse) => {
        this.doctorList = [];
        this.doctorFound = false;
      }
    );
  }

  onDoctorSearch(): void {
    this.setDefaultPaginationDetais();
    this.prepareSearchRequestQuery();
    this.getClinicDoctors();
  }

  sortDoctorListByBookAppointAavailability(doctorList: any[]): any[] {
    let bookAppointmentDoctors: any[] = [];
    let callToBookDoctors: any[] = [];
    doctorList.forEach((doctor: any) => {
      let doctorAvailableForBooking: boolean;

      if (doctor.hasOwnProperty('public_phone_available') && doctor.hasOwnProperty('available_for_booking')) {
        doctorAvailableForBooking = doctor.available_for_booking === true;
      }
      else if (doctor.hasOwnProperty('public_phone_available') && !doctor.hasOwnProperty('available_for_booking')) {
        doctorAvailableForBooking = !(doctor.public_phone_available === true);
      }
      else {
        doctorAvailableForBooking = false;
      }

      if (doctorAvailableForBooking === true) {
        bookAppointmentDoctors.push(doctor);
      }
      else {
        callToBookDoctors.push(doctor);
      }
    });
    return bookAppointmentDoctors.concat(callToBookDoctors);
  }

  onDepartmentChange(event): void {
    this.departmentName = event;
    this.onDoctorSearch();
  }

}

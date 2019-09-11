import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { LABEL_TEXTS, ERROR_MESSAGES } from '../../../../app/template-data';
import { ENUM_CONFIGURATIONS } from '../../../../configurations';

import { FormControl, Validators, FormGroup } from '@angular/forms';
import { CustomErrorStateMatcher } from '../../../validators';
import { CONSULTATION_VISIT_TYPES } from '../../../static_data';

import { AppointmentService } from '../../../services/appointment.service';
import { DoctorService } from '../../../services/doctor.service';
import { HttpParams } from '@angular/common/http';
import * as moment from 'moment';

@Component({
  selector: 'app-slot-selection',
  templateUrl: './slot-selection.component.html',
  styleUrls: ['./slot-selection.component.css', '../department-selection/department-selection.component.css'],
  providers: [AppointmentService, DoctorService]
})
export class SlotSelectionComponent implements OnInit, OnDestroy {
  displayLabel: any;
  validationMessages: any;

  clinicId: number;
  clinicSlug: string;
  doctorSlug: string;
  doctorId: number;

  doctor: any;
  schedule: any;
  visitTypes: any[];
  scheduleSlots: any[];
  buckets: any[];

  visitTypeSelectControl: FormControl;
  visitTypeSelectErrorMatcher: CustomErrorStateMatcher;
  appointmentDateSelectControl: FormControl;

  scheduleSlotRequestQuery: HttpParams;
  selectedDate: string;
  selectedSlot: any;
  currentDate: string;

  referer: string;
  serverRespondedForSlotListing: boolean;

  slotBasedRecordsCount: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService
  ) {
    this.visitTypes = Object.create(CONSULTATION_VISIT_TYPES);
    this.scheduleSlots = [];
    this.buckets = [];
    this.displayLabel = LABEL_TEXTS.slot_selection;
    this.validationMessages = ERROR_MESSAGES.slot_selection.message.validation;
    this.currentDate = moment().format('YYYY-MM-DD');
    this.selectedDate = this.getDatePreSelectValue();
    this.serverRespondedForSlotListing = false;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(
      (params) => {
        this.referer = params['referer'];
      }
    );
    this.visitTypeSelectControl = new FormControl('new_patient', [Validators.required]);
    this.visitTypeSelectErrorMatcher = new CustomErrorStateMatcher();
    this.appointmentDateSelectControl = new FormControl(this.selectedDate, [Validators.required]);

    this.saveSelectedVisitTypeLocally();
    this.saveSelectedDateLocally();

    this.extractAndSetRouteParams();
    this.fetchDoctor();
  }

  ngOnDestroy() {
    this.visitTypes = null;
    this.scheduleSlots = null;
    this.displayLabel = null;
    this.validationMessages = null;
    this.selectedDate = null;
  }

  extractAndSetRouteParams(): void {
    this.clinicId = +localStorage.getItem('cc_clinic_id');
    this.clinicSlug = this.route.snapshot.paramMap.get('clinicSlug');
    this.doctorSlug = this.route.snapshot.paramMap.get('doctorSlug');
  }

  fetchDoctor(): void {
    let requestParam: string = `expand=schedules,qualifications,reviews_count,specializations`;
    this.doctorService.fetchClinicDoctorBySlug(this.doctorSlug, requestParam).subscribe(
      (successResponse) => {
        this.setDoctor(successResponse.data);
        this.getVisitTypes();
        this.getClinicSchedules();
      },
      (errorResponse) => {

      }
    );
  }

  setDoctor(data: any): void {
    this.doctor = data;
    this.doctorId = data.id;
    localStorage.setItem('cc_doctor', JSON.stringify(data));
  }

  getClinicSchedules(): void {
    this.doctorService.fetchClinicSchedules(this.clinicId, this.doctorId).subscribe(
      (successResponse: any[]) => {
        this.schedule = successResponse.length > 0 ? successResponse.shift() : null;
        localStorage.setItem('cc_schedule', JSON.stringify(this.schedule));
        this.getScheduleSlots();
      },
      (errorResponse) => {

      },
    );
  }

  getVisitTypes(): void {
    let requestParams: string = `facility_id=${this.clinicId}&expand=generic_treatment_plan`;
    this.appointmentService.fetchAppointmentVisitTypes(this.doctorId, requestParams).subscribe(
      (successResponse) => {
        this.updateAppointVisitTypes(successResponse);
      },
      (errorResponse) => {

      },
    );
  }

  updateAppointVisitTypes(data: any): void {
    data.forEach(visitType => { this.visitTypes.push(visitType); });
  }

  getScheduleSlots(): void {
    this.buckets = this.scheduleSlots = [];
    this.slotBasedRecordsCount = null;
    if (this.schedule !== null && typeof this.schedule !== 'undefined') {
      this.buckets = [];
      this.prepareScheduleSlotRequestQuery();
      let requestParams: string = decodeURI(this.scheduleSlotRequestQuery.toString());
      this.appointmentService.fetchAppointmentSlots(this.schedule.id, requestParams).subscribe(
        (successResponse) => {
          this.scheduleSlots = successResponse;
          this.serverRespondedForSlotListing = true;
          this.fetchAllSlotBuckets();
        },
        (errorResponse) => {
          this.serverRespondedForSlotListing = true;
        }
      );
    }
  }

  prepareScheduleSlotRequestQuery(): void {
    let appointType: string = this.visitTypeSelectControl.value;
    let requestQuery: HttpParams = new HttpParams()
      .set('date', this.selectedDate)
      .set('appt_type', appointType);
    if (appointType !== 'new_patient' && appointType !== 'followup') {
      // requestQuery = requestQuery.delete('appt_type');
      requestQuery = requestQuery.append('treatment_plan_id', appointType);
    }
    this.scheduleSlotRequestQuery = requestQuery;
  }

  fetchAllSlotBuckets(): void {
    this.scheduleSlots.forEach((slot) => {
      if (this.isSlotAvailable(slot)) {
        this.fetchSlotBuckets(slot);
      }
    })
  }

  isSlotAvailable(slot: any): boolean {
    let statusToReturn: boolean = false;
    if (slot.hasOwnProperty('status')) {
      statusToReturn = slot.status !== 'unavailable';
    }
    return statusToReturn;
  }

  fetchSlotBuckets(slot: any, customizedQueryParams: string = null): void {
    let requestParams: string = customizedQueryParams ? customizedQueryParams : decodeURI(this.scheduleSlotRequestQuery.toString());
    this.appointmentService.getSlotBuckets(slot, requestParams).subscribe(
      (successResponse) => {
        let bucketsResponse: any[] = successResponse.data;
        let responseRecordCount = bucketsResponse.length;

        if (!this.slotBasedRecordsCount) {
          this.slotBasedRecordsCount = { [slot.id]: responseRecordCount }
        }
        else {
          this.slotBasedRecordsCount[slot.id] = isNaN(this.slotBasedRecordsCount[slot.id]) ?
            responseRecordCount :
            (this.slotBasedRecordsCount[slot.id] + responseRecordCount);
        }

        this.parseAndSetBuckets(bucketsResponse);
        this.navigateToNextPageBuckets(slot, successResponse.meta);
      },
      (error) => {

      }
    );
  }

  navigateToNextPageBuckets(whichSlot: any, meta: any = null): void {
    if (meta) {
      let totalRecordCount = meta.total;
      if (this.slotBasedRecordsCount[whichSlot.id] < totalRecordCount) {
        let currentPage: number = meta.page_no;
        let nextPage: number = currentPage + 1;
        let requestParams: string = decodeURI(this.scheduleSlotRequestQuery.toString()) + `&page_no=${nextPage}`;
        this.fetchSlotBuckets(whichSlot, requestParams);
      }
    }
  }

  parseAndSetBuckets(buckets: any[] = []): void {
    buckets.map(
      (bucket) => {
        if (bucket.hasOwnProperty('status')) {
          if (bucket.status == 'available') {
            this.buckets.push(bucket);
          }
        }
      }
    );
    this.sortBuckets();
  }

  sortBuckets(): void {
    this.buckets.sort((first, second) => {
      let firstDateTimeString: string = `${this.selectedDate} ${first.start}`;
      let secondDateTimeString: string = `${this.selectedDate} ${second.start}`;
      let firstDateTime = moment(firstDateTimeString);
      let secondDateTime = moment(secondDateTimeString);
      if (firstDateTime.isBefore(secondDateTime)) {
        return -1;
      }
      if (secondDateTime.isBefore(firstDateTime)) {
        return 1;
      }
      return 0;
    });
  }

  getStartTime(time: string): string {
    let dateTimeString: string = `${this.selectedDate} ${time}`;
    return moment(dateTimeString).format('h:mm a');
  }

  onSlotSelect(bucket: any): void {
    this.selectedSlot = bucket;
    localStorage.setItem('cc_selected_slot', JSON.stringify(bucket));
  }

  onAppointmentDateChange(date: MatDatepickerInputEvent<Date>): void {
    this.selectedDate = moment(this.appointmentDateSelectControl.value).format('YYYY-MM-DD');
    this.getClinicSchedules();
    this.saveSelectedDateLocally();
  }

  onVisitTypeChange(): void {
    this.saveSelectedVisitTypeLocally();
    this.getClinicSchedules();
  }

  onProceedClick(): void {
    this.router.navigate(['/booking-verification', this.clinicSlug]);
  }

  saveSelectedVisitTypeLocally(): void {
    let visitType: any = this.searchVisitTypeById(this.visitTypeSelectControl.value);
    localStorage.setItem('cc_visit_type_title', visitType.title);
    // localStorage.setItem('cc_appointment_type', JSON.stringify(visitType.data));
    localStorage.setItem('cc_appointment_type_key', this.visitTypeSelectControl.value);
  }

  isFormValid(): boolean {
    return typeof this.selectedSlot !== 'undefined';
  }

  searchVisitTypeById(searchId: any): any {
    let searchResult: any = {};
    for (let i: number = 0; i < this.visitTypes.length; i++) {
      let visitType: any = this.visitTypes[i];
      if (visitType.id == searchId) {
        searchResult.title = visitType.generic_treatment_plan.title;
        searchResult.data = visitType;
        break;
      }
    }
    return searchResult;
  }

  saveSelectedDateLocally(): void {
    localStorage.setItem('cc_appointment_date', this.selectedDate);
  }

  getDatePreSelectValue(): any {
    let dateToReturn = this.currentDate;
    let locallySavedDate: string = localStorage.getItem('cc_appointment_date');
    if (locallySavedDate !== null && typeof this.referer !== 'undefined') {
      dateToReturn = this.getFormattedDate(locallySavedDate, 'YYYY-MM-DD');
    }
    else {
      localStorage.setItem('cc_appointment_date', dateToReturn);
    }
    return dateToReturn;
  }

  getFormattedDate(date: any, format: string): string {
    return moment(date).format(format);
  }

}

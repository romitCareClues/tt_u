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
        this.setSchedule();
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

  setSchedule(): void {
    if (this.doctor.hasOwnProperty('schedules')) {
      this.schedule = this.doctor.schedules.length > 0 ? this.doctor.schedules[0] : null;
      localStorage.setItem('cc_schedule', JSON.stringify(this.schedule));
    }
  }

  prepareScheduleSlotRequestQuery(): void {
    let appointType: string = this.visitTypeSelectControl.value;
    let requestQuery: HttpParams = new HttpParams()
      .set('date', this.selectedDate)
      .set('appt_type', appointType)
      .set('expand', 'buckets');
    if (appointType !== 'new_patient' && appointType !== 'followup') {
      requestQuery = requestQuery.append('treatment_plan_id', appointType);
    }
    this.scheduleSlotRequestQuery = requestQuery;
  }

  getVisitTypes(): void {
    let requestParams: string = `facility_id=${this.clinicId}&expand=generic_treatment_plan`;
    this.appointmentService.fetchAppointmentVisitTypes(this.doctorId, requestParams).subscribe(
      (successResponse) => {
        this.updateAppointVisitTypes(successResponse);
        this.getScheduleSlots();
      },
      (errorResponse) => {

      },
    );
  }

  updateAppointVisitTypes(data: any): void {
    data.forEach(visitType => { this.visitTypes.push(visitType); });
  }

  getScheduleSlots(): void {
    if (this.schedule !== null && typeof this.schedule !== 'undefined') {
      this.buckets = [];
      this.prepareScheduleSlotRequestQuery();
      let requestParams: string = decodeURI(this.scheduleSlotRequestQuery.toString());
      this.appointmentService.fetchAppointmentSlots(this.schedule.id, requestParams).subscribe(
        (successResponse) => {
          this.parseAndSetSlots(successResponse);
        },
        (errorResponse) => {
        }
      );
    }
  }

  parseAndSetSlots(data: any[] = []): void {
    let currentTime: any =
      data.map(
        (slot) => {
          if (slot.hasOwnProperty('status')) {
            if (slot.status == 'available') {
              if (slot.hasOwnProperty('buckets')) {
                this.parseAndSetBuckets(slot.buckets);
              }
            }
          }
        }
      );
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
    this.getScheduleSlots();
    this.saveSelectedDateLocally();
  }

  onVisitTypeChange(): void {
    this.saveSelectedVisitTypeLocally();
    this.getScheduleSlots();
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

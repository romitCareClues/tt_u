import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { LABEL_TEXTS, ERROR_MESSAGES } from '../../../../app/template-data';
// import { ENUM_CONFIGURATIONS } from '../../../../configurations';

import { FormControl, Validators, FormGroup } from '@angular/forms';
import { CustomErrorStateMatcher } from '../../../validators';
// import { CONSULTATION_VISIT_TYPES } from '../../../static_data';

import { AppointmentService } from '../../../services/appointment.service';
import { DoctorService } from '../../../services/doctor.service';
import { HttpParams } from '@angular/common/http';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { LoaderService } from '../../../services/common/loader.service';

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
  treatmentPlans: any[];
  scheduleSlots: any[];
  buckets: any[];

  treatmentPlansSelectControl: FormControl;
  visitTypeSelectErrorMatcher: CustomErrorStateMatcher;
  appointmentDateSelectControl: FormControl;

  scheduleSlotRequestQuery: HttpParams;
  selectedDate: string;
  selectedSlot: any = null;
  currentDate: string;

  referer: string;
  serverRespondedForSlotListing: boolean;

  slotBasedRecordsCount: any = null;

  scheduleLoaded: boolean = false;
  scheduleSlotsLoaded: boolean = false;
  slotBucketsLoaded: boolean = false;

  allSubscriptions: any[] = [];

  callToBookFormDisplayStatus: boolean;

  slotTreatmentPlan: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private doctorService: DoctorService,
    private loaderService: LoaderService
  ) {
    // ##new-schedule-module
    // this.treatmentPlans = Object.create(CONSULTATION_VISIT_TYPES);
    this.scheduleSlots = null;
    this.buckets = [];
    this.displayLabel = LABEL_TEXTS.slot_selection;
    this.validationMessages = ERROR_MESSAGES.slot_selection.message.validation;
    this.currentDate = moment().format('YYYY-MM-DD');
    this.serverRespondedForSlotListing = false;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(
      (params) => {
        this.referer = params['referer'];
        this.selectedDate = this.getDatePreSelectValue();
      }
    );
    // ##new-schedule-module
    // this.treatmentPlansSelectControl = new FormControl('new_patient', [Validators.required]);
    this.treatmentPlansSelectControl = new FormControl('', [Validators.required]);

    this.visitTypeSelectErrorMatcher = new CustomErrorStateMatcher();
    this.appointmentDateSelectControl = new FormControl(this.selectedDate, [Validators.required]);

    // ##new-schedule-module
    // this.saveSelectedVisitTypeLocally();

    this.saveSelectedDateLocally();

    this.extractAndSetRouteParams();
    this.fetchDoctor();
  }

  ngOnDestroy() {
    this.treatmentPlans = null;
    this.scheduleSlots = null;
    this.displayLabel = null;
    this.validationMessages = null;
    this.selectedDate = null;

    this.scheduleLoaded = false;
    this.scheduleSlotsLoaded = false;
    this.slotBucketsLoaded = false;
  }

  setDoctor(data: any): void {
    this.doctor = data;
    this.doctorId = data.id;
    localStorage.setItem('cc_doctor', JSON.stringify(data));
  }

  setTreatmentPlans(data: any): void {
    this.treatmentPlans = data;
  }

  setSchedule(data: any): void {
    this.schedule = data;
    localStorage.setItem('cc_schedule', JSON.stringify(data));
  }

  setSlotTreatmentPlan(data: any): void {
    this.slotTreatmentPlan = data;
    localStorage.setItem('cc_slot_treatment_plan', JSON.stringify(data));
  }

  extractAndSetRouteParams(): void {
    this.clinicId = +localStorage.getItem('cc_clinic_id');
    this.clinicSlug = this.route.snapshot.paramMap.get('clinicSlug');
    this.doctorSlug = this.route.snapshot.paramMap.get('doctorSlug');
  }

  fetchDoctor(): void {
    this.selectedSlot = null;
    let requestParam: string = `facility_id=${this.clinicId}&widget=true&expand=schedules,qualifications,reviews_count,specializations`;
    this.allSubscriptions.push(
      this.doctorService.fetchClinicDoctorBySlug(this.doctorSlug, requestParam).subscribe(
        (successResponse) => {
          let doctorModel: any = successResponse.data;
          this.setDoctor(doctorModel);
          if (this.doctorService.isOnlineAppointmentAllowed(doctorModel)) {
            // ##new-schedule-module
            this.fetchPhysicianTreatmentPlans();
            // this.getClinicSchedules();
          }
          else {
            this.callToBookFormDisplayStatus = true;
          }
        },
        (errorResponse) => {

        }
      )
    )
  }

  fetchPhysicianTreatmentPlans(): void {
    this.selectedSlot = null;
    let requestParams: string = `facility_id=${this.clinicId}&expand=generic_treatment_plan&order[featured]=desc&order[title]=asc`;

    this.allSubscriptions.push(
      this.appointmentService.fetchAppointmentVisitTypes(this.doctorId, requestParams).subscribe(
        (successResponse) => {
          if (successResponse.length > 0) {
            this.setTreatmentPlans(successResponse);
            this.selectFirstTreatmentPlan();
            this.saveSelectedVisitTypeLocally();
            this.fetchSlotTreatmentPlans();
          }
        },
        (errorResponse) => {

        },
      )
    )
  }

  selectFirstTreatmentPlan(): void {
    this.treatmentPlansSelectControl.setValue(this.treatmentPlans[0].id);
  }

  fetchSlotTreatmentPlans(): void {
    this.selectedSlot = null;
    this.buckets = [];
    this.scheduleSlots = null;
    this.slotBasedRecordsCount = null;
    this.scheduleSlotsLoaded = false;

    this.slotBucketsLoaded = false;

    this.buckets = [];
    let treatmentPlanId: number = this.treatmentPlansSelectControl.value;
    let requestParams: string = `date=${this.selectedDate}&physician_id=${this.doctorId}&expand=slot`;

    this.allSubscriptions.push(
      this.appointmentService.fetchSlotTreatmentPlans(treatmentPlanId, requestParams).subscribe(
        (successResponse) => {
          this.scheduleSlotsLoaded = true;
          this.serverRespondedForSlotListing = true;
          if (successResponse.length > 0) {
            let availableSlots: any[] = this.appointmentService.getAvailableSlotTreatmentPlans(successResponse);
            if (availableSlots.length > 0) {
              this.scheduleSlots = availableSlots;
              this.fetchAllSlotBuckets();
            }
          }
        },
        (errorResponse) => {
          this.serverRespondedForSlotListing = true;
          this.scheduleSlotsLoaded = true;
        }
      )
    )
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
    if (slot.hasOwnProperty('online_booking')) {
      statusToReturn = slot.online_booking === true;
    }
    return statusToReturn;
  }

  fetchSlotBuckets(slot: any, customizedQueryParams: string = null): void {
    this.selectedSlot = null;
    this.slotBucketsLoaded = false;
    this.scheduleSlotsLoaded = false;
    // this.scheduleSlots = null;

    let requestParams: string = customizedQueryParams ? customizedQueryParams : `date=${this.selectedDate}`;

    this.allSubscriptions.push(
      this.appointmentService.getSlotTreatmentPlanBuckets(slot, requestParams).subscribe(
        (successResponse) => {
          this.slotBucketsLoaded = true;
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
          if (responseRecordCount > 0) {
            this.navigateToNextPageBuckets(slot, successResponse.meta);
          }
        },
        (error) => {
          this.slotBucketsLoaded = true;
        }
      )
    );
  }

  navigateToNextPageBuckets(whichSlot: any, meta: any = null): void {
    if (meta) {
      let totalRecordCount = meta.total;
      if (this.slotBasedRecordsCount[whichSlot.id] < totalRecordCount) {
        let currentPage: number = meta.page_no;
        let nextPage: number = currentPage + 1;
        let requestParams: string = `date=${this.selectedDate}` + `&page_no=${nextPage}`;
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


  // getClinicSchedules(): void {
  //   this.selectedSlot = null;
  //   this.scheduleLoaded = false;

  //   this.slotBucketsLoaded = false;
  //   this.scheduleSlotsLoaded = false;
  //   this.scheduleSlots = null;

  //   this.allSubscriptions.push(
  //     this.doctorService.fetchClinicSchedules(this.clinicId, this.doctorId).subscribe(
  //       (successResponse: any[]) => {
  //         this.scheduleLoaded = true;
  //         if (successResponse.length > 0) {
  //           var firstSchedule = successResponse.shift();
  //           this.setSchedule(firstSchedule);
  //           this.getScheduleSlots();
  //         }
  //       },
  //       (errorResponse) => {
  //         this.scheduleLoaded = true;
  //       },
  //     )
  //   )
  // }

  // getScheduleSlots(): void {
  //   this.selectedSlot = null;
  //   // this.buckets = this.scheduleSlots = [];
  //   this.buckets = [];
  //   this.scheduleSlots = null;
  //   this.slotBasedRecordsCount = null;
  //   this.scheduleSlotsLoaded = false;

  //   this.slotBucketsLoaded = false;

  //   if (this.schedule !== null && typeof this.schedule !== 'undefined') {
  //     this.buckets = [];
  //     this.prepareScheduleSlotRequestQuery();
  //     let requestParams: string = decodeURI(this.scheduleSlotRequestQuery.toString());

  //     this.allSubscriptions.push(
  //       this.appointmentService.fetchAppointmentSlots(this.schedule.id, requestParams).subscribe(
  //         (successResponse) => {
  //           this.scheduleSlotsLoaded = true;
  //           this.scheduleSlots = successResponse;
  //           this.serverRespondedForSlotListing = true;
  //           this.fetchAllSlotBuckets();
  //         },
  //         (errorResponse) => {
  //           this.serverRespondedForSlotListing = true;
  //           this.scheduleSlotsLoaded = true;
  //         }
  //       )
  //     )
  //   }
  // }

  // prepareScheduleSlotRequestQuery(): void {
  //   let appointType: string = this.treatmentPlansSelectControl.value;
  //   let requestQuery: HttpParams = new HttpParams()
  //     .set('date', this.selectedDate)
  //     .set('appt_type', appointType);
  //   if (appointType !== 'new_patient' && appointType !== 'followup') {
  //     // requestQuery = requestQuery.delete('appt_type');
  //     requestQuery = requestQuery.append('treatment_plan_id', appointType);
  //   }
  //   this.scheduleSlotRequestQuery = requestQuery;
  // }

  getStartTime(time: string): string {
    let dateTimeString: string = `${this.selectedDate} ${time}`;
    return moment(dateTimeString).format('h:mm a');
  }

  onSlotSelect(bucket: any): void {
    this.selectedSlot = bucket;
    localStorage.setItem('cc_selected_slot', JSON.stringify(bucket));
    this.parseAndSetSlotTreatmentPlan(bucket);
  }

  onAppointmentDateChange(date: MatDatepickerInputEvent<Date>): void {
    this.cancelExistingSubscriptions();
    this.selectedDate = moment(this.appointmentDateSelectControl.value).format('YYYY-MM-DD');
    this.saveSelectedDateLocally();
    this.fetchSlotTreatmentPlans();
  }

  onVisitTypeChange(): void {
    this.cancelExistingSubscriptions();
    this.fetchSlotTreatmentPlans();
    // this.getClinicSchedules();
    this.saveSelectedVisitTypeLocally();
  }

  onProceedClick(): void {
    this.cancelExistingSubscriptions();
    this.router.navigate(['/booking-verification', this.clinicSlug]);
  }

  saveSelectedVisitTypeLocally(): void {
    let visitType: any = this.searchVisitTypeById(this.treatmentPlansSelectControl.value);
    localStorage.setItem('cc_visit_type_title', visitType.title);
    // localStorage.setItem('cc_appointment_type', JSON.stringify(visitType.data));
    localStorage.setItem('cc_appointment_type_key', this.treatmentPlansSelectControl.value);
  }

  isFormValid(): boolean {
    return this.selectedSlot ? true : false;
  }

  searchVisitTypeById(searchId: any): any {
    let searchResult: any = {};
    for (let i: number = 0; i < this.treatmentPlans.length; i++) {
      let visitType: any = this.treatmentPlans[i];
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

  cancelExistingSubscriptions(): void {
    this.loaderService.hideLoader();
    this.allSubscriptions.map((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  parseAndSetSlotTreatmentPlan(bucket: any): void {
    let slotTreatmentPlans: any[] = this.scheduleSlots;
    let bucketId: string = bucket.id;
    let slotTreatmentPlanId: number = +bucketId.split("-").shift();
    var selectedSlotTreatmentPlan = slotTreatmentPlans.find((item) => { return item.id === slotTreatmentPlanId });
    if (selectedSlotTreatmentPlan) {
      this.setSlotTreatmentPlan(selectedSlotTreatmentPlan);
    }
  }

}

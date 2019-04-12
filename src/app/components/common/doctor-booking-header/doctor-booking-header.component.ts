import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

import { LABEL_TEXTS } from '../../../template-data';

@Component({
  selector: 'app-doctor-booking-header',
  templateUrl: './doctor-booking-header.component.html',
  styleUrls: ['./doctor-booking-header.component.css']
})
export class DoctorBookingHeaderComponent implements OnInit {
  doctor: any;
  selectedSlot: any;
  selectedDate: string;
  selectedVisitType: string;

  labels: any;

  constructor() {
    this.doctor = JSON.parse(localStorage.getItem('cc_doctor'));
    this.selectedSlot = JSON.parse(localStorage.getItem('cc_selected_slot'));
    this.selectedDate = localStorage.getItem('cc_appointment_date');
    this.selectedVisitType = localStorage.getItem('cc_visit_type_title');

    this.labels = LABEL_TEXTS.doctor_booking_header;
  }

  ngOnInit() {
  }

  getStartTime(): string {
    let dateTimeString: string = `${this.selectedDate} ${this.selectedSlot.start}`;
    return moment(dateTimeString).format('h:mm a');
  }

  getAppointmentDate(): string {
    let dateString: string = this.selectedDate;
    return moment(dateString).format('Do MMM');
  }

}

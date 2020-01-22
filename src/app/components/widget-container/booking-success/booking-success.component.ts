import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LABEL_TEXTS } from '../../../template-data';

@Component({
  selector: 'app-booking-success',
  templateUrl: './booking-success.component.html',
  styleUrls: ['./booking-success.component.css']
})
export class BookingSuccessComponent implements OnInit {

  clinicSlug: string;
  savedAppointment: any;

  schedule: any;
  labels: any;

  slotTreatmentPlan: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.savedAppointment = JSON.parse(localStorage.getItem('cc_saved_appointment'));
    this.schedule = JSON.parse(localStorage.getItem('cc_schedule'));
    this.slotTreatmentPlan = JSON.parse(localStorage.getItem('cc_slot_treatment_plan'));
    this.labels = LABEL_TEXTS.booking_success;
  }

  ngOnInit() {
    this.clinicSlug = this.route.snapshot.paramMap.get('clinicSlug');
  }

  getDuration(): string {
    let durationInSeconds: number = this.savedAppointment.hasOwnProperty('duration') ? +this.savedAppointment.duration : 0;
    let durationInMin: string = '';
    if (durationInSeconds > 0) {
      durationInMin = `${Math.ceil(durationInSeconds / 60).toString()} min`;
    }
    return durationInMin;
  }

  onBookAnotherAppointmentClick(): void {
    this.router.navigate(['/department-selection', this.clinicSlug]);
  }

}

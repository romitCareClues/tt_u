import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LABEL_TEXTS } from '../../../template-data';
import { HttpParams } from '@angular/common/http';
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-booking-verification',
  templateUrl: './booking-verification.component.html',
  styleUrls: ['./booking-verification.component.css', '../department-selection/department-selection.component.css', '../call-to-book/call-to-book.component.css'],
  providers: [AppointmentService]
})
export class BookingVerificationComponent implements OnInit {
  // clinicId: number;
  clinicSlug: string;
  // doctorId: number;

  schedule: any;
  disableAppointBookingButton: boolean;

  labels: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService
  ) {
    this.labels = LABEL_TEXTS.booking_verification;
    this.schedule = JSON.parse(localStorage.getItem('cc_schedule'));
    this.disableAppointBookingButton = true;
  }

  ngOnInit() {
    this.extractAndSetRouteParams();
  }

  extractAndSetRouteParams(): void {
    // this.clinicId = +this.route.snapshot.paramMap.get('clinicId');
    this.clinicSlug = this.route.snapshot.paramMap.get('clinicSlug');
    // this.doctorId = +this.route.snapshot.paramMap.get('doctorId');
  }

  triggerUserVerificationSuccessEvent() {
    this.disableAppointBookingButton = false;
  }

  onBookAppointmentClick(): void {
    let selectedBucket: any = JSON.parse(localStorage.getItem('cc_selected_slot'));
    let patientId: number = +localStorage.getItem('cc_patient_id');
    let bucketId: string = selectedBucket.id;
    let appointmentDate: string = localStorage.getItem('cc_appointment_date');
    let appointmentTypeKey: string = localStorage.getItem('cc_appointment_type_key');
    let requestBody: any = {
      appt_type: appointmentTypeKey,
      bucket_id: bucketId,
      date: appointmentDate,
      offer_id: null,
      patient_id: patientId
    };
    if (appointmentTypeKey !== 'new_patient' && appointmentTypeKey !== 'followup') {
      requestBody.treatment_plan_id = appointmentTypeKey;
      delete requestBody.appt_type;
    }
    let requestQueryParams: any = new HttpParams().set('bucket_id', bucketId).set('date', appointmentDate);
    let requestQueryString: string = decodeURI(requestQueryParams.toString());
    this.appointmentService.bookAppointment(patientId, requestQueryString, requestBody).subscribe(
      (successResponse) => {
        let dataToSave: any = {
          fees: successResponse.gross_amount,
          duration: successResponse.duration
        };
        localStorage.setItem('cc_saved_appointment', JSON.stringify(dataToSave));
        this.router.navigate(['/booking-success', this.clinicSlug]);
      },
      (errorResponse) => {
        console.log(errorResponse);
      }
    );
  }

}

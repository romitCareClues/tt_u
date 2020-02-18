import { Injectable } from '@angular/core';
import { ApiService } from './common/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export class AppointmentService {

  constructor(private apiService: ApiService) { }

  fetchAppointmentVisitTypes(doctorId: number, requestParams: string): Observable<any> {
    let endPoint: string = `physicians/${doctorId}/treatment_plans?${requestParams}`;
    let isPublic: boolean = true;
    return this.apiService.get(endPoint, isPublic).pipe(map((response) => response.data));
  }

  fetchAppointmentSlots(scheduleId: number, requestParams: string): Observable<any> {
    let endPoint: string = `schedules/${scheduleId}/slots?${requestParams}`;
    let isPublic: boolean = true;
    return this.apiService.get(endPoint, isPublic).pipe(map((response) => response.data));
  }

  bookAppointment(patientId: number, requestParams: string, requestBody: any): Observable<any> {
    let endPoint: string = `patients/${patientId}/events?${requestParams}`;
    let isPublic: boolean = false;
    return this.apiService.post(endPoint, isPublic, '', '', requestBody).pipe(map((response) => response.data));
  }

  getSlotBuckets(slot: any, requestParams: string): Observable<any> {
    let endPoint: string = `slots/${slot.id}/buckets?${requestParams}`;
    let isPublic: boolean = true;
    return this.apiService.get(endPoint, isPublic);
  }

  getAppointmentBookingErrorMessage(errorResponse: HttpErrorResponse): string {
    let parsedMessage: string = null;
    if (errorResponse.hasOwnProperty('error')) {
      let errorResponseBody: any = JSON.parse(JSON.stringify(errorResponse.error));
      if (errorResponseBody.hasOwnProperty('errors')) {
        if (errorResponseBody.errors.hasOwnProperty('clinic_consultation')) {
          parsedMessage = errorResponseBody.errors.clinic_consultation.full_messages.shift().message;
        }
      }
    }
    return parsedMessage;
  }

  fetchSlotTreatmentPlans(treatmentPlanId: number, requestQuery: string): Observable<any> {
    let endPoint: string = `treatment_plans/${treatmentPlanId}/slot_treatment_plans?${requestQuery}`;
    let isPublic: boolean = true;
    return this.apiService.get(endPoint, isPublic).pipe(map((response) => response.data));
  }

  getSlotTreatmentPlanBuckets(slot: any, requestParams: string): Observable<any> {
    let endPoint: string = `slot_treatment_plans/${slot.id}/buckets?${requestParams}`;
    let isPublic: boolean = true;
    return this.apiService.get(endPoint, isPublic);
  }
}

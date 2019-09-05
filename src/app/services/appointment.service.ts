import { Injectable } from '@angular/core';
import { ApiService } from './common/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
}

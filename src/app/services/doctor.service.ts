import { Injectable } from '@angular/core';
import { ApiService } from './common/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export class DoctorService {

  constructor(private apiService: ApiService) { }

  fetchClinicDoctorList(searchFilters: string): Observable<any> {
    let endPoint: string = `search/physicians?${searchFilters}`;
    let isPublic: boolean = true;
    return this.apiService.get(endPoint, isPublic);//.pipe(map((response) => response.data));
  }

  callDoctorToBook(facilityId: number, requestData: any): Observable<any> {
    let endPoint: string = `facilities/${facilityId}/public_phone_calls`;
    let isPublic: boolean = true;
    return this.apiService.post(endPoint, isPublic, '', '', requestData);//.pipe(map((response) => response.data));
  }

  fetchClinicDoctorBySlug(slugValue: string, queryParams: string): Observable<any> {
    let endPoint: string = `slugs/${slugValue}?${queryParams}`;
    let isPublic: boolean = true;
    return this.apiService.get(endPoint, isPublic);//.pipe(map((response) => response.data));
  }

  fetchClinicSchedules(facilityId: number, doctorId: number): Observable<any> {
    let endPoint: string = `physicians/${doctorId}/schedules?facility_id=${facilityId}`;
    let isPublic: boolean = true;
    return this.apiService.get(endPoint, isPublic).pipe(map((response) => response.data));
  }

}

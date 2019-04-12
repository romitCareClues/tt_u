import { Injectable } from '@angular/core';
import { ApiService } from './common/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export class ClinicService {

  constructor(private apiService: ApiService) { }

  fetchClinic(clinicSlug: string, expandParam: string = 'expand=rating,contacts'): Observable<any> {
    let endPoint: string = `slugs/${clinicSlug}?${expandParam}`;
    let isPublic: boolean = true;
    return this.apiService.get(endPoint, isPublic).pipe(map((response) => response.data));
  }

  fetchClinicDepartments(clinicId: number, requestQuery: string): Observable<any> {
    let endPoint: string = `facilities/${clinicId}/departments?${requestQuery}`;
    let isPublic: boolean = true;
    return this.apiService.get(endPoint, isPublic);//.pipe(map((response) => response.data));
  }


}

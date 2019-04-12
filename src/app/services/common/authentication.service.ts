import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private apiService: ApiService) { }

  generateOtp(requestData: any): Observable<any> {
    let endPoint: string = `authentication_codes`;
    let isPublic: boolean = false;
    return this.apiService.post(endPoint, isPublic, '', '', requestData);//.pipe(map((response) => response.data))
  }

  verifyOtp(requestData: any): Observable<any> {
    let endPoint: string = `authentications`;
    let isPublic: boolean = false;
    return this.apiService.post(endPoint, isPublic, '', '', requestData);//.pipe(map((response) => response.data))
  }

}

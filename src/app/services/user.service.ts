import { Injectable } from '@angular/core';
import { ApiService } from './common/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
@Injectable()
export class UserService {

  constructor(private apiService: ApiService) { }

  registerUser(requestData: any): Observable<any> {
    let endPoint: string = `patients/registration`;
    let isPublic: boolean = false;
    return this.apiService.post(endPoint, isPublic, '', '', requestData);//.pipe(map((response) => response.data));
  }
}

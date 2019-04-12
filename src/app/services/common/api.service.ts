import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = environment.api_url();
const PUBLIC_API_URL = environment.public_url();

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient
  ) { }

  get(
    endPoint: string = '',
    isPublic: boolean = false,
    headers: any = '',
    fullUrl: string = '',
    options: any = ''
  ): Observable<any> {
    let apiUrl: string = this.createApiUrl(endPoint, isPublic, fullUrl);
    let httpOptions = options.length == 0 ? { headers: this.createHttpRequestHeaders(headers) } : options;
    return this.httpClient.get(apiUrl, httpOptions);
  }

  post(
    endPoint: string = '',
    isPublic: boolean = false,
    headers: any = '',
    fullUrl: string = '',
    requestBody: any = null,
    options: any = ''
  ): Observable<any> {
    let apiUrl: string = this.createApiUrl(endPoint, isPublic, fullUrl);
    let httpOptions = options.length == 0 ? { headers: this.createHttpRequestHeaders(headers) } : options;
    return this.httpClient.post(apiUrl, requestBody, httpOptions);
  }

  put(
    endPoint: string = '',
    isPublic: boolean = false,
    headers: any = '',
    fullUrl: string = '',
    requestBody: any = null,
    options: any = ''
  ): Observable<any> {
    let apiUrl: string = this.createApiUrl(endPoint, isPublic, fullUrl);
    let httpOptions = options.length == 0 ? { headers: this.createHttpRequestHeaders(headers) } : options;
    return this.httpClient.put(apiUrl, requestBody, httpOptions);
  }

  delete(
    endPoint: string = '',
    isPublic: boolean = false,
    headers: any = '',
    fullUrl: string = '',
    options: any = ''
  ): Observable<any> {
    let apiUrl: string = this.createApiUrl(endPoint, isPublic, fullUrl);
    let httpOptions = options.length == 0 ? { headers: this.createHttpRequestHeaders(headers) } : options;
    return this.httpClient.delete(apiUrl, httpOptions);
  }

  createApiUrl(endPoint: string, isPublic: boolean, fullUrl: string): string {
    return fullUrl.length > 0 ? fullUrl : ((isPublic === true ? PUBLIC_API_URL : API_URL) + endPoint);
  }

  createHttpRequestHeaders(headers: any = ''): HttpHeaders {
    let requestHeaders: any;
    if (headers == '') {
      // add token header later
      let accessToken: string = this.getUserAccessToken();
      let headerObject: any = {
        'Content-Type': 'application/json'
      };
      if (accessToken.length > 0) {
        headerObject.authorization = accessToken;
      }
      requestHeaders = new HttpHeaders(headerObject);
    }
    else {
      requestHeaders = headers;
    }
    return requestHeaders;
  }

  getUserAccessToken(): string {
    let accessToken: string = localStorage.getItem('cc_auth_token');
    return accessToken != null ? accessToken : '';
  }

}

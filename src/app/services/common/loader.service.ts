import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  @Output()
  public loaderSubject = new EventEmitter();

  constructor() { }

  showLoader(): void {
    this.loaderSubject.next({ show: true });
  }

  hideLoader(): void {
    this.loaderSubject.next({ show: false });
  }

}

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LABEL_TEXTS, ERROR_MESSAGES } from '../../../../app/template-data';

import { DoctorService } from '../../../services/doctor.service';
import { NotificationService } from '../../../services/common/notification.service';

@Component({
  selector: 'app-call-to-book',
  templateUrl: './call-to-book.component.html',
  styleUrls: ['./call-to-book.component.css'],
  providers: [DoctorService]
})
export class CallToBookComponent implements OnInit {
  @Input() doctorId: number;
  displayLabel: any;
  validationMessages: any;

  callToBookForm: FormGroup;

  disableCallToBookButton: boolean;

  enableButtonEnableTimer: boolean;
  secondsCount: number;
  secondsCountTimer: any;

  constructor(private doctorService: DoctorService, private notificationService: NotificationService) {
    this.displayLabel = LABEL_TEXTS.call_to_book;
    this.validationMessages = ERROR_MESSAGES.call_to_book.message.validation;
    this.createCallToBookForm();
    this.disableCallToBookButton = false;
  }

  ngOnInit() {
  }

  createCallToBookForm(): void {
    let validators: any[] = [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.pattern('[0-9]+')
    ];
    this.callToBookForm = new FormGroup({
      mobileNumberControl: new FormControl('', validators)
    });
  }

  isformInValid(): boolean {
    return this.callToBookForm.controls.mobileNumberControl.errors !== null && (this.callToBookForm.touched || this.callToBookForm.dirty);
  }

  onCallToBookFormSubmit(): void {
    this.enableCallButtonAfterSetTime();
    this.proceedToCall();
  }

  enableCallButtonAfterSetTime(): void {
    this.disableCallToBookButton = true;
    this.enableButtonEnableTimer = true;
    this.secondsCount = 60;
    this.secondsCountTimer = setInterval(() => {
      this.secondsCount--;
      if (this.secondsCount == 0) {
        clearInterval(this.secondsCountTimer);
        this.enableButtonEnableTimer = false;
        this.disableCallToBookButton = false;
      }
    }, 1000);
  }

  proceedToCall(): void {
    let clinicId: number = +localStorage.getItem('cc_clinic_id');
    let countryIdPrefixedMobile: string = `+91${this.callToBookForm.value.mobileNumberControl}`;
    let requestParam: any = {
      phone_number: countryIdPrefixedMobile,
      physician_id: this.doctorId
    }
    this.doctorService.callDoctorToBook(clinicId, requestParam).subscribe(
      (successResponse) => {
        // this.disableCallToBookButton = false;
      },
      (errorResponse) => {
        this.handleError();
        // this.disableCallToBookButton = false;
      }
    );
  }

  handleError(): void {
    clearInterval(this.secondsCountTimer);
    this.enableButtonEnableTimer = false;
    this.disableCallToBookButton = false;
    this.notifyErrorMessage();
  }

  notifyErrorMessage(): void {
    let messageToDisplay: string = 'We are facing some technical issue while calling. Please call directly to the mentioned number.';
    let notificationActionText: string = 'Close';
    let errorMessageOptions: any = { duration: 3000, panelClass: ['red-snackbar'], verticalPosition: 'top' }
    this.notificationService.displayToast(messageToDisplay, notificationActionText, errorMessageOptions);
  }

}

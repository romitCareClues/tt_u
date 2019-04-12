import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LABEL_TEXTS, ERROR_MESSAGES } from '../../../template-data';
import { AuthenticationService } from '../../../services/common/authentication.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.css', '../../widget-container/call-to-book/call-to-book.component.css']
})
export class OtpComponent implements OnInit {
  @Output() onUserVerificationSuccess = new EventEmitter();

  otpForm: FormGroup;
  otpLabelTexts: any;
  errorMessages: any;

  displayOtpForm: boolean;
  displayOtpVerificationForm: boolean;
  displayRegistrationForm: boolean;

  userMobile: string;

  otpServiceError: string;

  constructor(private authService: AuthenticationService) {
    this.displayOtpForm = true;
    this.displayOtpVerificationForm = false;
    this.displayRegistrationForm = false;

    this.otpLabelTexts = LABEL_TEXTS.send_otp;
    this.errorMessages = ERROR_MESSAGES.send_otp.message;
  }

  ngOnInit() {
    this.createOtpForm();
    this.attachFormTouchedEventHandler();
  }

  createOtpForm(): void {
    let validators: any[] = [
      Validators.required,
      Validators.minLength(10),
      Validators.maxLength(10),
      Validators.pattern('[0-9]+')
    ];
    this.otpForm = new FormGroup({
      mobileNumberControl: new FormControl('', validators)
    });
  }

  attachFormTouchedEventHandler(): void {
    this.otpForm.valueChanges.subscribe(
      (event) => {
        this.otpServiceError = '';
      }
    );
  }

  isOtpformInValid(): boolean {
    let invalidStatus: boolean = this.otpForm.controls.mobileNumberControl.errors !== null && (this.otpForm.touched || this.otpForm.dirty);
    return invalidStatus;
  }

  onOtpFormSubmit(): void {
    this.otpServiceError = '';
    let mobileNumber: string = `+91${this.otpForm.controls.mobileNumberControl.value}`;
    this.userMobile = mobileNumber;
    let requestData: any = { mobile_number: mobileNumber };
    this.authService.generateOtp(requestData).subscribe(
      (successResponse) => {
        this.displayOtpForm = false;
        this.displayRegistrationForm = false;
        this.displayOtpVerificationForm = true;
      },
      (errorResponse) => {
        this.parseErrorAndDisplayRegistration(errorResponse.error);
      }
    );
  }

  parseErrorAndDisplayRegistration(response: any): void {
    if (response.errors.hasOwnProperty('otp')) {
      let errorMessageCollection: any[] = [];
      let errorCodeCollection: any[] = [];
      response.errors.otp.full_messages.map((msg) => {
        errorMessageCollection.push(msg.message);
        errorCodeCollection.push(msg.code);
      });
      this.otpServiceError = errorMessageCollection.join('');
      // if (errorCodeCollection.includes('errors.max_otp_limit.full_message')) {
      //   this.otpServiceError = 'You have reached the maximum limit of resending OTP.';
      // }
      // else {
      //   this.otpServiceError = errorMessageCollection.join('');
      // }
    }

    if (response.errors.hasOwnProperty('user')) {
      this.displayRegistrationForm = true;
      this.displayOtpForm = false;
      this.displayOtpVerificationForm = false;
    }

  }

  triggerOtpVerificationCancelEvent(): void {
    this.displayOtpForm = true;
    this.displayOtpVerificationForm = false;
    this.displayRegistrationForm = false;
  }

  triggerOtpVerifiedEvent(): void {
    this.onUserVerificationSuccess.emit();
  }

  triggerUserRegisteredEvent(): void {
    this.displayOtpVerificationForm = true;
    this.displayRegistrationForm = false;
    this.displayOtpForm = false;
  }

}

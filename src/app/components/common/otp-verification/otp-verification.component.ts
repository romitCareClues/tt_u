import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthenticationService } from '../../../services/common/authentication.service';

import { LABEL_TEXTS, ERROR_MESSAGES } from '../../../template-data';

@Component({
  selector: 'app-otp-verification',
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.css']
})
export class OtpVerificationComponent implements OnInit {
  @Output() onCancelOtpVerification = new EventEmitter();
  @Output() onOtpVerified = new EventEmitter();

  @Input() mobile: string;

  otpVerificationForm: any;
  otpVerificationServiceError: string;

  labels: any;
  errorMessages: any;

  grantUserAccess: boolean = true;
  otpVerificationSuccess: boolean;

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder
  ) {
    this.labels = LABEL_TEXTS.verify_otp;
    this.errorMessages = ERROR_MESSAGES.verify_otp.message;
  }

  ngOnInit() {
    this.createOtpVerificationForm();
  }

  createOtpVerificationForm(): void {
    let validators: any[] = [
      Validators.required,
      // Validators.minLength(1),
      // Validators.maxLength(1),
      Validators.pattern('[0-9]+')
    ];
    this.otpVerificationForm = this.formBuilder.group({
      otp_slice_1: ['', validators],
      otp_slice_2: ['', validators],
      otp_slice_3: ['', validators],
      otp_slice_4: ['', validators],
      otp_slice_5: ['', validators],
      otp_slice_6: ['', validators]
    });
  }

  isOtpVerificationFormValid(): boolean {
    // let otpSliceControlErrorStatus: boolean = false;
    // for (let property in this.otpVerificationForm.controls) {
    //   let control: any = this.otpVerificationForm.controls[property];
    //   if (control.errors != null) {
    //     otpSliceControlErrorStatus = true;
    //     break;
    //   }
    // }
    // let status: boolean = otpSliceControlErrorStatus && (this.otpVerificationForm.touched || this.otpVerificationForm.dirty);
    let status: boolean = this.otpVerificationForm.invalid && (this.otpVerificationForm.touched || this.otpVerificationForm.dirty);
    if (status === true) {
      this.resetOtpVerificationServiceErrorMessage();
    }
    return status;
  }

  resetOtpVerificationServiceErrorMessage(): void {
    this.otpVerificationServiceError = '';
    this.grantUserAccess = true;
  }


  onCancel(): void {
    this.onCancelOtpVerification.emit();
  }

  onVerifyOtp(): void {
    this.grantUserAccess = true;
    this.otpVerificationSuccess = false;

    let otpSlice1: string = this.otpVerificationForm.get('otp_slice_1').value.toString();
    let otpSlice2: string = this.otpVerificationForm.get('otp_slice_2').value.toString();
    let otpSlice3: string = this.otpVerificationForm.get('otp_slice_3').value.toString();
    let otpSlice4: string = this.otpVerificationForm.get('otp_slice_4').value.toString();
    let otpSlice5: string = this.otpVerificationForm.get('otp_slice_5').value.toString();
    let otpSlice6: string = this.otpVerificationForm.get('otp_slice_6').value.toString();

    let fullOtpCode: string = otpSlice1 + otpSlice2 + otpSlice3 + otpSlice4 + otpSlice5 + otpSlice6;
    let otpToVerificationRequest = { 'mobile_number': this.mobile, 'otp': fullOtpCode };
    this.authService.verifyOtp(otpToVerificationRequest).subscribe(
      (successResponse) => {
        if (this.canUserBookAppointment(successResponse)) {
          localStorage.setItem('cc_patient_id', successResponse.data.id);
          this.onOtpVerified.emit();
          this.otpVerificationSuccess = true;
        }
        else {
          this.grantUserAccess = false;
        }
      },
      (errorResponse) => {
        this.displayOtpVerificationError(errorResponse);
        this.otpVerificationSuccess = false;
        this.grantUserAccess = true;
      }
    );
  }

  canUserBookAppointment(otpVerificationResponse): boolean {
    let status: boolean = false;
    let userRole: string = this.authService.getParsedUserRole(otpVerificationResponse);
    if (userRole) {
      let allowedRoles: string[] = ['patient', 'patientdependant'];
      status = allowedRoles.includes(userRole);
    }
    return status;
  }

  // focus on respective otp slice input when user navigates using keyborad
  onOtpFormNavigate(event): void {
    let nextSiblingElement = event.srcElement.nextElementSibling;
    let previousSiblingElement = event.srcElement.previousElementSibling;
    if ((event.target.value || event.key == 'ArrowRight') && nextSiblingElement !== null) {
      nextSiblingElement.value = null;
      nextSiblingElement.focus();
    }
    else if (((event.key == 'ArrowLeft' || event.key == 'Backspace') && !event.target.value) && previousSiblingElement !== null) {
      previousSiblingElement.value = null;
      previousSiblingElement.focus();
    }
  }

  displayOtpVerificationError(errors: any): void {
    if (errors.hasOwnProperty('error')) {
      if (errors.error.errors.otp) {
        let errorMessageCollection: any[] = [];
        errors.error.errors.otp.full_messages.map((msg) => {
          errorMessageCollection.push(msg.message);
        });
        // this.otpVerificationServiceError = 'You have reached the maximum limit of resending OTP.';
        this.otpVerificationServiceError = errorMessageCollection.join(' ');
      }
      else {
        this.otpVerificationServiceError = 'Invalid OTP provided.';
      }
    }
    else {
      this.otpVerificationServiceError = 'Invalid OTP provided.';
    }
  }

  getHeaderText(): string {
    let template: string = this.labels.header_label;
    return template.replace(`__(userMobile)`, this.mobile);
  }


}

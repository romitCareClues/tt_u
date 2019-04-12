import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LABEL_TEXTS, ERROR_MESSAGES } from '../../../../app/template-data';

import { DoctorService } from '../../../services/doctor.service';

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

  constructor(private doctorService: DoctorService) {
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
    this.disableCallToBookButton = true;
    let clinicId: number = +localStorage.getItem('cc_clinic_id');
    let countryIdPrefixedMobile: string = `+91${this.callToBookForm.value.mobileNumberControl}`;
    let requestParam: any = {
      phone_number: countryIdPrefixedMobile,
      physician_id: this.doctorId
    }
    this.doctorService.callDoctorToBook(clinicId, requestParam).subscribe(
      (successResponse) => {
        console.log(successResponse);
      },
      (errorResponse) => {
        console.log(errorResponse);
      }
    );
  }

}

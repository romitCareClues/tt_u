import { Component, OnInit, Input } from '@angular/core';
import { ENUM_CONFIGURATIONS } from '../../../../configurations';
import { LABEL_TEXTS } from '../../../../app/template-data';
import { FILE_PATHS } from '../../../../configurations';
import { Router } from '@angular/router';
import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-doctor-card',
  templateUrl: './doctor-card.component.html',
  styleUrls: ['./doctor-card.component.css'],
  providers: [DoctorService]
})
export class DoctorCardComponent implements OnInit {
  @Input() doctor;
  @Input() hideBookAndCallButton: boolean;

  doctorCardConfigurations: any;
  displayLabel: any;
  filePaths: any;

  doctorFulName: string;
  doctorPrefix: string;
  favouriteCount: number;
  qualifications: string;
  specializations: string;
  doctorImage: string;
  doctorRating: string;
  doctorExperienceInYears: number;

  bookingButtonEnum: string;
  callToBookingButtonEnum: string;
  bookingButtonType: string;
  callToBookFormDisplayStatus: boolean;


  constructor(private router: Router, private doctorService: DoctorService) {
    this.displayLabel = LABEL_TEXTS.doctor_card;
    this.doctorCardConfigurations = ENUM_CONFIGURATIONS.doctor_card;
    this.filePaths = FILE_PATHS;
    this.callToBookFormDisplayStatus = false;
  }

  ngOnInit() {
    this.createDoctorDisplayName();
    this.createDoctorDisplayPrefix();
    this.setDisplayFavouriteCount();
    this.createDoctorDisplayQualifications();
    this.createDoctorDisplaySpecializations();
    this.setDoctorDisplayImage();
    this.setDoctorRating();
    this.setBookingButtonEnumConstants();
    this.setBookingButtonType();
  }

  createDoctorDisplayName(): void {
    this.doctorFulName = '';
    if (typeof this.doctor !== 'undefined') {
      let firstName: string = this.doctor.hasOwnProperty('first_name') ? this.doctor.first_name : '';
      let lastName: string = this.doctor.hasOwnProperty('last_name') ? this.doctor.last_name : '';
      this.doctorFulName = `${firstName} ${lastName}`.trim();
    }
  }

  createDoctorDisplayPrefix(): void {
    this.doctorPrefix = '';
    if (this.doctor.hasOwnProperty('prefix')) {
      this.doctorPrefix = this.doctor.prefix.charAt(0).toUpperCase() + this.doctor.prefix.charAt(1);
    }
  }

  setDisplayFavouriteCount(): void {
    this.favouriteCount = this.doctor.hasOwnProperty('favourites_count') ? this.doctor.favourites_count : 0;
  }

  createDoctorDisplayQualifications(): void {
    this.qualifications = '';
    if (this.doctor.hasOwnProperty('qualifications')) {
      let qualificationCollection: any[] = [];
      for (let i = 0; i < this.doctor.qualifications.length; i++) {
        let qualification: any = this.doctor.qualifications[i];
        let degree: string = qualification.hasOwnProperty('degree') ? qualification.degree : '';
        let specialty: string = qualification.hasOwnProperty('specialty') ? qualification.specialty : '';
        let qualificationDisplayString: string = ((degree.length > 0 && specialty.length > 0) ? `${degree}(${specialty})` : degree).trim();
        if (qualificationDisplayString.length > 0) {
          qualificationCollection.push(qualificationDisplayString);
        }
      }
      this.qualifications = qualificationCollection.join(', ');
    }
  }

  createDoctorDisplaySpecializations(): void {
    this.specializations = '';
    if (this.doctor.hasOwnProperty('specializations')) {
      let specializationCollection: any[] = [];
      for (let i = 0; i < this.doctor.specializations.length; i++) {
        let specialization: any = this.doctor.specializations[i];
        let subSpecialty: string = specialization.hasOwnProperty('subspecialty') ? specialization.subspecialty : '';
        if (subSpecialty.length > 0) {
          specializationCollection.push(subSpecialty);
        }
      }
      this.specializations = specializationCollection.join(', ');
    }
  }

  setDoctorDisplayImage(): void {
    this.doctorImage = this.filePaths.default_user_image;
    if (this.doctor.hasOwnProperty('links')) {
      let linkCollections = this.doctor.links;
      for (let index in linkCollections) {
        let link: any = linkCollections[index];
        if (link.hasOwnProperty('rel') && link.hasOwnProperty('href')) {
          if (link.rel === 'profile_photo') {
            this.doctorImage = link.href.length > 0 ? link.href : '';
            break;
          }
        }
      }
    }
  }

  setDoctorRating(): void {
    this.doctorRating = '';
    if (this.doctor.hasOwnProperty('rating')) {
      this.doctorRating = this.doctor.rating;
    }
  }

  setDoctorExperience(): void {
    this.doctorExperienceInYears = 0;
    if (this.doctor.hasOwnProperty('years_of_experience')) {
      this.doctorExperienceInYears = this.doctor.years_of_experience;
    }
  }

  setBookingButtonEnumConstants(): void {
    this.bookingButtonEnum = this.doctorCardConfigurations.book_button;
    this.callToBookingButtonEnum = this.doctorCardConfigurations.call_to_book_button;
  }

  setBookingButtonType(): void {
    if (this.doctor.hasOwnProperty('public_phone_available') && this.doctor.hasOwnProperty('available_for_booking')) {
      this.bookingButtonType = this.doctor.available_for_booking === true ? this.bookingButtonEnum : this.callToBookingButtonEnum;
    }
    else if (this.doctor.hasOwnProperty('public_phone_available') && !this.doctor.hasOwnProperty('available_for_booking')) {
      this.bookingButtonType = this.doctor.public_phone_available === true ? this.callToBookingButtonEnum : this.callToBookingButtonEnum;
    }
    else {
      this.bookingButtonType = this.callToBookingButtonEnum;
    }
  }

  toggleCallToBookFormDisplay(): void {
    this.callToBookFormDisplayStatus = !this.callToBookFormDisplayStatus;
  }

  onBookAppointmentClick(): void {
    // localStorage.setItem('cc_doctor', JSON.stringify(this.doctor));
    // let clinicId: number = +localStorage.getItem('cc_clinic_id');
    let clinicSlug: string = localStorage.getItem('cc_clinic_slug');
    this.router.navigate(['/slot-selection', clinicSlug, this.doctor.uri], { queryParams: { referer: '_doctor_card' } });
  }

  onConsultNowClick(): void {
    this.redirectToDoctorPublicProfile();
  }

  redirectToDoctorPublicProfile(): void {
    let publicUrl: string = this.doctorService.getDoctorPublicProfileUrl(this.doctor);
    window.location.href = publicUrl;
  }

}

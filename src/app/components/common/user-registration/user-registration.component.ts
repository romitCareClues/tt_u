import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { LABEL_TEXTS } from '../../../template-data';

@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css'],
  providers: [UserService]
})
export class UserRegistrationComponent implements OnInit {

  @Input() mobile: string;
  @Output() onCancelRegistration = new EventEmitter;
  @Output() onRegistrationSuccess = new EventEmitter;

  first_name: string;
  last_name: string;
  labels: any;

  constructor(private userService: UserService) {
    this.labels = LABEL_TEXTS.registration;
  }

  ngOnInit() {
  }

  onCancelButtonClicked(): void {
    this.onCancelRegistration.emit();
  }

  onRegister(): void {
    let requestData: any = {
      first_name: this.first_name,
      last_name: this.last_name,
      mobile_number: this.mobile
    };
    this.userService.registerUser(requestData).subscribe(
      (successResponse) => {
        this.onRegistrationSuccess.emit();
      },
      (errorResponse) => { }
    );
  }

}

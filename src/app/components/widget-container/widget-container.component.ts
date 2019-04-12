import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { ERROR_MESSAGES } from '../../template-data';
import { PAGE_CONFIGURATIONS } from '../../../configurations';

import { ClinicService } from '../../services/clinic.service';
import { CustomRouteService } from '../../services/common/custom-route.service';

@Component({
  selector: 'app-widget-container',
  templateUrl: './widget-container.component.html',
  styleUrls: ['./widget-container.component.css'],
  providers: [ClinicService]
})
export class WidgetContainerComponent implements OnInit, OnDestroy {
  clinicSlug: any;
  departmentName: any;

  subscriptions: any[] = [];

  errorMessages: any;

  inputParamsValidStatus: boolean;

  clinic: any;
  clinicId: number;
  clinicNotFoundStatus: boolean;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clinicService: ClinicService,
    private customRouteService: CustomRouteService
  ) {
    this.errorMessages = ERROR_MESSAGES.widget_container;
    this.clinicNotFoundStatus = false;
  }

  ngOnInit() {
    this.subscribeToRouteChangeEvent();
  }

  ngOnDestroy() {
    // put all cleanup logic here
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  subscribeToRouteChangeEvent(): void {
    this.subscriptions.push(this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.route.snapshot.children.map((activatedRoute) => {
          this.clinicSlug = activatedRoute.params.clinicSlug;
          this.departmentName = activatedRoute.params.departmentName;
          this.setInputParamsValidationStatus();
          this.getClinicDetails(event.url);
          this.customRouteService.setCurrentRoute(event.url);
          this.customRouteService.setCurrentRouteParams(activatedRoute.params);
        });
      }
    }));
  }

  setInputParamsValidationStatus(): void {
    this.inputParamsValidStatus = typeof this.clinicSlug !== 'undefined' && this.clinicSlug !== '';
  }

  getClinicDetails(calledForPageUrl: string): void {
    if (this.inputParamsValidStatus == true) {
      this.clinicService.fetchClinic(this.clinicSlug).subscribe(
        (successResponse) => {
          this.clinic = successResponse;
          this.clinicId = successResponse.id;
          this.setClinicDetailsLocally(successResponse);
          // set template property
          this.clinicNotFoundStatus = false;
          this.redirect(calledForPageUrl);
        },
        (errorResponse) => {
          console.log(errorResponse);
          // set template property
          this.clinicNotFoundStatus = true;
        }
      );
    }
  }

  setClinicDetailsLocally(data: any): void {
    localStorage.setItem('cc_clinic_id', data.id.toString());
    localStorage.setItem('cc_clinic_slug', this.clinicSlug);
  }

  redirect(calledForPageUrl: string): void {
    if ((calledForPageUrl.indexOf('widget-root') > -1) === true) {
      if (typeof this.clinicSlug !== 'undefined' && typeof this.departmentName === 'undefined') {
        this.router.navigate(['/department-selection', this.clinicSlug]);
      }

      if (typeof this.clinicSlug !== 'undefined' && typeof this.departmentName !== 'undefined') {
        this.router.navigate(['/doctor-list', this.clinicSlug]);
      }
    }
  }

}

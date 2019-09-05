import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { ERROR_MESSAGES } from '../../template-data';
import { PAGE_CONFIGURATIONS } from '../../../configurations';

import { ClinicService } from '../../services/clinic.service';
import { CustomRouteService } from '../../services/common/custom-route.service';
import { LoaderService } from '../../services/common/loader.service';

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
  clinicNotFoundStatus: boolean = false;

  displayLoader: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private clinicService: ClinicService,
    private customRouteService: CustomRouteService,
    private loaderService: LoaderService
  ) {
    this.errorMessages = ERROR_MESSAGES.widget_container;
  }

  ngOnInit() {
    this.subscribeToRouteChangeEvent();
    this.subscribeToLoaderEvent();
  }

  ngOnDestroy() {
    // put all cleanup logic here
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  subscribeToLoaderEvent(): void {
    this.subscriptions.push(this.loaderService.loaderSubject.subscribe((event) => { this.displayLoader = event.show; }));
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

import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

import { CustomRouteService } from '../../../services/common/custom-route.service';
import { CONFIGS, FILE_PATHS } from '../../../../configurations';

@Component({
  selector: 'app-widget-header',
  templateUrl: './widget-header.component.html',
  styleUrls: ['./widget-header.component.css']
})
export class WidgetHeaderComponent implements OnInit {
  @Input() clinic: any;
  routeListToHideBackButton: string[];

  referer: string;
  logoUrl: string;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private customRouteService: CustomRouteService,
    private router: Router
  ) {
    this.routeListToHideBackButton = CONFIGS.hideBackButtonForRoutes;
    this.logoUrl = FILE_PATHS.cdn_images.logo_image;
  }

  ngOnInit() {
    this.setReferer();
  }

  setReferer(): void {
    this.route.queryParams.subscribe(
      (params) => {
        this.referer = params['referer'];
      }
    );
  }

  onBackButtonClicked(): void {
    this.location.back();
  }

  canDisplayBackButton(): boolean {
    let currentRoute: string = this.customRouteService.getCurrentRoute();
    let canDisplayStatus: boolean = true;
    this.routeListToHideBackButton.forEach((routeName) => {
      if (currentRoute.includes(routeName)) {
        canDisplayStatus = false;
      }
    });
    let status: boolean = canDisplayStatus && this.hasReferer();
    return status;
  }

  hasReferer(): boolean {
    return typeof this.referer !== 'undefined';
  }

  onAppointmentTitleClick(): void {
    let currentRouteParams: any = this.customRouteService.getCurrentRouteParams();
    if (currentRouteParams.hasOwnProperty('clinicSlug')) {
      this.router.navigate(['/department-selection', currentRouteParams.clinicSlug]);
    }
  }

}

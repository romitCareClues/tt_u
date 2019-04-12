import { Component, OnInit, Input } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

import { CustomRouteService } from '../../../services/common/custom-route.service';
import { CONFIGS } from '../../../../configurations';

@Component({
  selector: 'app-widget-header',
  templateUrl: './widget-header.component.html',
  styleUrls: ['./widget-header.component.css']
})
export class WidgetHeaderComponent implements OnInit {
  @Input() clinic: any;
  routeListToHideBackButton: string[];

  constructor(
    private location: Location,
    private customRouteService: CustomRouteService,
    private router: Router
  ) {
    this.routeListToHideBackButton = CONFIGS.hideBackButtonForRoutes;
  }

  ngOnInit() {
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
    return canDisplayStatus;
  }

  onAppointmentTitleClick(): void {
    let currentRouteParams: any = this.customRouteService.getCurrentRouteParams();
    if (currentRouteParams.hasOwnProperty('clinicSlug')) {
      this.router.navigate(['/department-selection', currentRouteParams.clinicSlug]);
    }
  }

}

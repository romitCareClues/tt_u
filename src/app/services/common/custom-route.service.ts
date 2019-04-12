import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CustomRouteService {
    currentRoute: string;
    currentRouteParams: any;

    setCurrentRoute(routeToSet: string): void {
        this.currentRoute = routeToSet;
    }

    getCurrentRoute(): string {
        return this.currentRoute;
    }

    setCurrentRouteParams(paramsToSet: any): void {
        this.currentRouteParams = paramsToSet;
    }

    getCurrentRouteParams(): any {
        return this.currentRouteParams;
    }
}
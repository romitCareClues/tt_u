import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import {
  HttpConfigInterceptor,
  LoaderInterceptor
} from './interceptors';

import { RouterModule } from '@angular/router';
import { routes } from './routes';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

// import {
//   BsDatepickerModule,
//   BsDropdownModule
// } from 'ngx-bootstrap';

import {
  MatSelectModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatInputModule,
  // MatButtonModule,
  MatAutocompleteModule,
  MatProgressBarModule
} from '@angular/material';

// component imports
import { AppComponent } from './app.component';
import {
  WidgetContainerComponent,
  WidgetHeaderComponent,
  WidgetFooterComponent,
  DoctorListComponent,
  DoctorCardComponent,
  DepartmentSelectionComponent,
  CallToBookComponent,
  SlotSelectionComponent,
  BookingVerificationComponent,
  DoctorBookingHeaderComponent,
  OtpComponent,
  OtpVerificationComponent,
  UserRegistrationComponent,
  BookingSuccessComponent,
  DepartmentSelectionSharedComponent,
  LoaderComponent
} from './components';

@NgModule({
  declarations: [
    AppComponent,
    WidgetContainerComponent,
    WidgetHeaderComponent,
    WidgetFooterComponent,
    DoctorListComponent,
    DoctorCardComponent,
    DepartmentSelectionComponent,
    CallToBookComponent,
    SlotSelectionComponent,
    BookingVerificationComponent,
    DoctorBookingHeaderComponent,
    OtpComponent,
    OtpVerificationComponent,
    UserRegistrationComponent,
    BookingSuccessComponent,
    DepartmentSelectionSharedComponent,
    LoaderComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' }),
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,

    NgxPaginationModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressBarModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpConfigInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
  // entryComponents: [WidgetContainerComponent]
})
export class AppModule {

  // constructor(
  //   private injector: Injector
  // ) { }

  // ngDoBootstrap() {
  //   const widgetElement = createCustomElement(WidgetContainerComponent, { injector: this.injector });
  //   customElements.define('care-clues-doctor-widget', widgetElement);


  //   // //on every route change tell router to navigate to defined route
  //   // this.location.subscribe((data) => {
  //   //   this.router.navigateByUrl(data.url);
  //   // });

  //   // //using this router outlet is loaded normaly on init
  //   // this.router.navigateByUrl(this.location.path(true));

  //   // //event subscribe to detect route change inside angular
  //   // this.router.events.subscribe((data) => {
  //   //   console.log(data);
  //   // });
  // }
}

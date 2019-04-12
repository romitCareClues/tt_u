
import { Routes } from '@angular/router';

import {
    DoctorListComponent,
    DepartmentSelectionComponent,
    SlotSelectionComponent,
    BookingVerificationComponent,
    BookingSuccessComponent
} from './components';

export const routes: Routes = [
    { path: '', redirectTo: 'widget-root/hello', pathMatch: 'full' },
    { path: 'widget-root/:clinicSlug', component: DepartmentSelectionComponent },
    { path: 'department-selection/:clinicSlug', component: DepartmentSelectionComponent },
    { path: 'doctor-list/:clinicSlug/:departmentName', component: DoctorListComponent },
    { path: 'doctor-list/:clinicSlug', component: DoctorListComponent },
    { path: 'slot-selection/:clinicSlug/:doctorSlug', component: SlotSelectionComponent },
    { path: 'booking-verification/:clinicSlug', component: BookingVerificationComponent },
    { path: 'booking-success/:clinicSlug', component: BookingSuccessComponent }
    // { path: 'widget-root/:clinicSlug/:departmentId', component: DepartmentSelectionComponent },
    // { path: 'widget-root/:clinicSlug/:departmentId', component: WidgetContainerComponent },
];
import { Injectable } from '@angular/core';
// import { ErrorDialogService } from '../error-dialog/errordialog.service';
import {
    HttpInterceptor,
    HttpRequest,
    HttpResponse,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            map(
                (event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        if (event.headers.get('x-authentication-token') != null) {
                            const accessToken = event.headers.get('x-authentication-token');
                            localStorage.setItem('cc_auth_token', accessToken);
                        }
                    }
                    return event;
                }
            )
        );
    }
}
import { LoaderService } from '../services/common/loader.service';
import { Injectable } from "@angular/core";
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Observable } from "rxjs";
import { finalize, tap } from "rxjs/operators";

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

    constructor(public loaderService: LoaderService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // return next.handle(req).pipe(
        //     finalize(() => this.loaderService.hideLoader())
        // );

        this.loaderService.showLoader();
        return next.handle(req).pipe(
            tap(
                (event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        this.loaderService.hideLoader()
                    }
                },
                (err: any) => {
                    this.loaderService.hideLoader()
                }
            ),
            //finalize(() => this.loaderService.hideLoader())
        );

    }

}
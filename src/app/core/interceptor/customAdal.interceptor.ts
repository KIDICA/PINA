import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {CustomAdalService} from '@app/services';

@Injectable()
export class CustomAdalInterceptor implements HttpInterceptor {
  constructor(private adal: CustomAdalService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.adal.userInfo.authenticated) {
      const authorizedRequest = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${this.adal.userInfo.token}`),
      });
      return next.handle(authorizedRequest);
    }
    return next.handle(request);
  }

}

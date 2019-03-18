import {AdalGuard} from 'adal-angular4';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {Observable} from 'rxjs';
import { environment } from '@environments/environment';
import {Injectable} from '@angular/core';
import {CustomAdalService} from '@app/services';

@Injectable()
export class CustomAdalGuard extends AdalGuard {

  constructor(adalService: CustomAdalService) {
    super(adalService);
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return environment.disableAuthentication || super.canActivate(route, state);
  }

  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    return environment.disableAuthentication || super.canActivateChild(childRoute, state);
  }
}

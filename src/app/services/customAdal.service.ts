import {Injectable, NgZone} from '@angular/core';
import {AdalService} from 'adal-angular4';
import {environment} from '@environments/environment';

@Injectable()
export class CustomAdalService extends AdalService {

  constructor(ngZone: NgZone) {
    super(ngZone);
  }

  isAuthenticated() {
    return this.userInfo.authenticated || environment.disableAuthentication;
  }

}

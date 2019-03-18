import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {environment} from '@environments/environment';
import {CustomAdalService} from '@app/services';
import {TranslateService} from '@ngx-translate/core';


@Component({ selector: 'app-pina', templateUrl: 'app.component.html' })
export class AppComponent {

    constructor(
        private router: Router,
        private adalService: CustomAdalService,
        private translate: TranslateService
    ) {
      translate.setDefaultLang('en');
      this.adalService.init(environment.azure.adal);
      if (!this.adalService.isAuthenticated()) {
        this.router.navigate(['/login']);
      }
    }

}

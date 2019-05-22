import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import {PinaAlertService, CustomAdalService} from '@app/services';

@Component({
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private alertService: PinaAlertService,
        private adalService: CustomAdalService
    ) {

      if (this.adalService.isAuthenticated()) {
          this.router.navigate(['person']);
          // this.router.navigate(['emotion']);
      }

    }

    ngOnInit() {
      this.adalService.handleWindowCallback();
    }

    login() {
      this.adalService.login();
    }
}

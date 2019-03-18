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
        // redirect to home if already logged in
        if (this.adalService.isAuthenticated()) {
            this.router.navigate(['/']);
        }
    }

    ngOnInit() {
      this.adalService.handleWindowCallback();
    }

    login() {
      this.adalService.login();
    }
}

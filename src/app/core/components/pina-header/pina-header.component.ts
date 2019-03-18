import {Component, OnInit} from '@angular/core';
import {CustomAdalService} from '@app/services';

@Component({
  selector: 'app-pina-header',
  templateUrl: 'pina-header.component.html',
  styleUrls: ['pina-header.component.css']
})
export class PinaHeaderComponent implements OnInit {

  constructor(
    private adalService: CustomAdalService,
  ) {

  }

  ngOnInit() {
    this.adalService.handleWindowCallback();
  }

  logout() {
    this.adalService.logOut();
  }

  isNavbarVisible() {
    return this.adalService.isAuthenticated();
  }

}

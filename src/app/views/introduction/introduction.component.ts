import {Component, OnInit} from '@angular/core';
import {interval} from 'rxjs';
import {Router} from '@angular/router';
import {take} from 'rxjs/operators';
import { ConfigurationState } from '@app/misc/configuration.state';
import { KeyListeningComponent } from '../abstract';

@Component({
  templateUrl: 'introduction.component.html',
  styleUrls: ['../../../assets/css/global.css', 'introduction.component.css']
})
export class IntroductionComponent extends KeyListeningComponent implements OnInit {

  constructor(
    private router: Router,
    private configurationState: ConfigurationState,
    protected currentConfiguration: ConfigurationState
  ) {
    super(currentConfiguration);
    this.hideCountDown = configurationState.pressKeyToContinue;
    this.hideTruck = !configurationState.driveCars;
  }

  hideCountDown;
  hideTruck;
  countDownValue;

  ngOnInit() {
    if (!this.configurationState.pressKeyToContinue) {
      this.countDownValue = 9;
      interval(1000).pipe(take(10)).subscribe(
        (value) => { this.countDownValue--; },
        (error) => { /* I dont care */ },
        this.introDone
      );
    }
  }

  handleKeyDown(event) {
    this.introDone();
  }

  private introDone = () => {
    this.router.navigate(['emotion']);
  }

}

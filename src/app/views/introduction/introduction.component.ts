import {Component, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {take} from 'rxjs/operators';

@Component({
  templateUrl: 'introduction.component.html',
  styleUrls: ['introduction.component.css']
})
export class IntroductionComponent implements OnInit {

  private subscription;
  constructor( private router: Router ) {}
  countDownValue = 10;

  public ngOnInit() {
    this.countDownValue = 9;
    this.subscription = interval(1000).pipe(take(10)).subscribe(
      (value) => { this.countDownValue--; },
      (error) => { /* I dont care */ },
      () => {
        this.subscription.unsubscribe();
        this.router.navigate(['emotion']);
      }
    );

  }

}

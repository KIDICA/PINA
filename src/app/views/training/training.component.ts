import {Component, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {take} from 'rxjs/operators';

@Component({
  templateUrl: 'training.component.html',
  styleUrls: ['training.component.css']
})
export class TrainingComponent implements OnInit {

  private subscription: Subscription;

  constructor( private router: Router ) {}

  runCircleFillAnimation = false;

  public ngOnInit() {

    this.runCircleFillAnimation = true;

    this.subscription = interval(10000).pipe(take(1)).subscribe(val => {
      console.log('i am done!');
    });

  }

}

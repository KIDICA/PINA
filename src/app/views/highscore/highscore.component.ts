import {Component, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {take} from 'rxjs/operators';

@Component({
  templateUrl: 'highscore.component.html',
  styleUrls: ['highscore.component.css']
})
export class HighscoreComponent implements OnInit {

  private subscription;
  constructor( private router: Router ) {}
  countDownValue = 10;

  public ngOnInit() {
    this.countDownValue = 10;
    this.subscription = interval(1000).pipe(take(10)).subscribe(
      (value) => { this.countDownValue--; },
      (error) => { /* I dont care */ },
      () => {
        this.subscription.unsubscribe();
        this.router.navigate(['person']);
      }
    );
  }

  getHighscores() {
    // TODO
    return [
      {place: 1, score: 10000, name: 'AwesomeFalk'},
      {place: 2, score: 9000, name: 'MegaFalk'},
      {place: 3, score: 8000, name: 'SuperFalk'},
      {place: 4, score: 7000, name: 'AstonishingFalk'},
      {place: 5, score: 6000, name: 'FantasticFalk'},
      {place: 6, score: 5000, name: 'SplendidFalk'},
      {place: 7, score: 4000, name: 'AmazingFalk'},
      {place: 8, score: 3000, name: 'WhatAboutFalk?'},
      {place: 9, score: 2000, name: 'MarvellousFalk'},
      {place: 10, score: -7, name: 'Patrick'}
    ];
  }
}

import {Component, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {take} from 'rxjs/operators';
import { PlayerService } from '@app/services';
import { RecognitionPersonComponent } from '../recognition-person';
import { PlayerData } from '@app/core/model/PlayerData';
import { PlayersState } from '@app/misc/players.state';

@Component({
  templateUrl: 'highscore.component.html',
  styleUrls: ['../../../assets/css/global.css', 'highscore.component.css']
})
export class HighscoreComponent implements OnInit {

  private subscription: Subscription;

  constructor(
    private router: Router,
    private currentPlayers: PlayersState,
    private playerService: PlayerService
  ) {}

  countDownValue;
  scores = undefined;

  public ngOnInit() {
    this.countDownValue = 10;
    this.subscription = interval(1000).pipe(take(10)).subscribe(
      (value) => {
        this.mayfetchHighScores();
        this.countDownValue--;
      },
      (error) => { /* I dont care */ },
      () => {
        this.subscription.unsubscribe();
        this.decideWhereToGoNext();
      }
    );
  }

  private decideWhereToGoNext() {
    if (this.currentPlayers.trainingNeeded) {
      this.router.navigate(['training']);
    } else {
      this.router.navigate(['person']);
    }
  }

  private mayfetchHighScores() {
    if (this.scores === undefined) {
      this.scores = new Array(); // trigger fetch only once
      this.playerService
        .findTop10HighScorePlayers(RecognitionPersonComponent.personGroupId)
        .then(players => this.scores = players.map(this.mapper));
    }
  }

  private mapper = (player: PlayerData, index: number, players: PlayerData[]) => {
    return {
      'place': index + 1,
      'score': player.score,
      'name': player.name
    };
  }

  getHighscores() {
    return this.scores;
  }
}

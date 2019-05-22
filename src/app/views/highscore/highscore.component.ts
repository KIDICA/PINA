import {Component, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {take} from 'rxjs/operators';
import { PlayerService } from '@app/services';
import { RecognitionPersonComponent } from '../recognition-person';
import { PlayersState } from '@app/misc/players.state';
import { ConfigurationState } from '@app/misc/configuration.state';
import { KeyListeningComponent } from '../abstract';

@Component({
  templateUrl: 'highscore.component.html',
  styleUrls: ['../../../assets/css/global.css', 'highscore.component.css']
})
export class HighscoreComponent extends KeyListeningComponent implements OnInit {

  private subscription: Subscription;

  constructor(
    private router: Router,
    private currentPlayers: PlayersState,
    private playerService: PlayerService,
    protected configurationState: ConfigurationState
  ) {
    super(configurationState);
  }

  countDownValue;
  scores;

  ngOnInit() {
    this.mayfetchHighScores(this.currentPlayers);
    if (!this.configurationState.pressKeyToContinue) {
      this.launchCountDown();
    }
  }

  handleKeyDown(event) {
    this.decideWhereToGoNext();
  }

  private launchCountDown() {
    this.countDownValue = 10;
    this.subscription = interval(1000).pipe(take(10)).subscribe(
      (value) => this.countDownValue--,
      (error) => { /* I dont care */ },
      () => {
        this.subscription.unsubscribe();
        this.decideWhereToGoNext();
      }
    );
  }

  private decideWhereToGoNext = () => {
    if (this.currentPlayers.trainingNeeded) {
      this.router.navigate(['training']);
    } else {
      this.router.navigate(['person']);
    }
  }

  private mayfetchHighScores(players: PlayersState) {
    interval(1000).pipe(take(1)).subscribe(val =>
      this.playerService
        .findTop10HighScorePlayersIncluding(RecognitionPersonComponent.personGroupId, players.currentPlayerOne, players.currentPlayerTwo)
        .then(results => this.scores = results)
    );
  }

  getHighscores() {
    return this.scores;
  }

  hideCountdown() {
    return this.configurationState.pressKeyToContinue;
  }
}

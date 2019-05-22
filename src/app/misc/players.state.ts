import {Injectable} from '@angular/core';
import {PlayerData} from '@app/core/model/PlayerData';

@Injectable({providedIn: 'root'})
export class PlayersState {

  trainingNeeded = false;
  currentPlayerOne = new PlayerData();
  currentPlayerTwo = new PlayerData();

  reset() {
    this.trainingNeeded = false;

    this.currentPlayerOne = new PlayerData();
    this.currentPlayerOne.noPlayerFound();

    this.currentPlayerTwo = new PlayerData();
    this.currentPlayerTwo.noPlayerFound();
  }

}

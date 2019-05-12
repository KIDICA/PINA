import {Injectable, Output} from '@angular/core';
import {PlayerData} from '@app/core/model/PlayerData';
import { AzureVisionFaceApiService } from './azureVisionFaceApi.service';
import { map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class PlayerService {

  private readonly first = ['Awesome', 'Mega', 'Super', 'Astonishing', 'Fantastic', 'Splendid', 'Amazing', 'Marvellous'];
  private readonly second = ['Racer', 'Driver', 'Operator', 'Conductor'];

  constructor(
    private faceApiService: AzureVisionFaceApiService
  ) {}

  generateRandomName(personGroupId: string) {
    return this.findAllPlayers(personGroupId)
      .then(players => {
        while (true) {
          const temp = this.selectRandom(this.first) + this.selectRandom(this.second) + this.randomNumber();
          if (this.noPlayersWithName(temp, players)) {
            return Promise.resolve(temp);
          }
      }});
  }

  private noPlayersWithName(name: string, players: PlayerData[]) {
    return players.find(player => player.name === name) === undefined;
  }

  private randomNumber() {
    return Math.round(Math.random() * 100);
  }

  private selectRandom(someArray) {
    return someArray[Math.floor(Math.random() * someArray.length)];
  }

  buildPlayerFrom(singleDetectFaceResponse): PlayerData {
    return new PlayerData().knownPlayerFound(
        singleDetectFaceResponse['personId'],
        singleDetectFaceResponse['name'],
        singleDetectFaceResponse['personData']);
  }

  findPlayerFor(personGroupId: string, personId: string): Promise<PlayerData> {
    return this.faceApiService.findPerson(personGroupId, personId)
      .pipe(map(this.responseToPlayerMapper))
      .toPromise();
  }

  updatePlayer(personGroupId: string, playerData: PlayerData) {
    return this.faceApiService.updatePerson(
        personGroupId,
        playerData.personId,
        playerData.name,
        playerData.score.toString()
      ).toPromise();
  }

  findAllPlayers(personGroupId: string) {
    return this.faceApiService
      .findPersons(personGroupId)
      .toPromise()
      .then((responses: []) => responses.map(this.responseToPlayerMapper));
  }

  findTop10HighScorePlayersIncluding(personGroupId: string, playerOne: PlayerData, playerTwo: PlayerData) {
    return this.faceApiService
      .findPersons(personGroupId)
      .toPromise()
      .then((respones: any[]) => respones.map(this.responseToPlayerMapper))
      .then((players: PlayerData[]) => players.filter(p => p.personId !== playerOne.personId && p.personId !== playerTwo.personId))
      .then((players: PlayerData[]) => {
        players.push(playerOne);
        players.push(playerTwo);
        return players;
      })
      .then((players: PlayerData[]) => {
        this.sort(players);
        return players;
      })
      .then((players: PlayerData[]) => players.map(this.advancedMapper(playerOne, playerTwo)))
      .then((output: any[]) => output.filter(o => o.mayIgnore === false));
  }

  private advancedMapper = (pOne: PlayerData, pTwo: PlayerData) => (player: PlayerData, index: number, players: PlayerData[]) => {
    return {
      'index':  index + 1,
      'player': player,
      'mayIgnore': index > 9 && !(pOne.personId === player.personId || pTwo.personId === player.personId),
      'fresh': pOne.personId === player.personId || pTwo.personId === player.personId
    };
  }

  private responseToPlayerMapper = response => {
    return new PlayerData().knownPlayerFound(response['personId'], response['name'], response['userData']);
  }

  private sort(playerData: PlayerData[]) {
    playerData.sort((a, b) => b.score - a.score);
  }

  /*
  findTop10HighScorePlayers(personGroupId: string) {
    return this.faceApiService
      .findPersons(personGroupId)
      .toPromise()
      .then((responses: []) => responses.map(this.mapper))
      .then((players: PlayerData[]) => {
        this.sort(players);
        return Promise.resolve(players.filter(this.takeFirst10));
      });
  }

  private takeFirst10 = (player: PlayerData, index: number, players: PlayerData[]) => {
    return index < 10;
  }

  private sort(playerData: PlayerData[]) {
    playerData.sort((a, b) => b.score - a.score);
  }
  */
}

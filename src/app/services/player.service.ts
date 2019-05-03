import {Injectable} from '@angular/core';
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

  generateRandomName() {
    while (true) {
      const temp = this.selectRandom(this.first) + this.selectRandom(this.second) + this.randomNumber();
      if (!this.nameAlreadyExists(temp)) {
        return temp;
      }
    }
  }

  private nameAlreadyExists(name: string) {
    // return Array.from(this.names.values()).filter((v, i) => name === v).length > 0;
    // TODO querry faceApiService
    return false;
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
      .pipe(map(this.mapper))
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
      .then((responses: []) => Promise.resolve(responses.map(this.mapper)));
  }

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


  private mapper = response => {
    return new PlayerData().knownPlayerFound(response['personId'], response['name'], response['userData']);
  }

  private takeFirst10 = (player: PlayerData, index: number, players: PlayerData[]) => {
    return index < 10;
  }

  private sort(playerData: PlayerData[]) {
    playerData.sort((a, b) => b.score - a.score);
  }

}

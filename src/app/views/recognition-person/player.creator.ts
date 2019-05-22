import {ElementRef} from '@angular/core';
import {RTCService} from '@app/services/rtc.service';
import {AzureVisionFaceApiService} from '@app/services/azureVisionFaceApi.service';
import {PlayerService} from '@app/services';
import {PlayerData} from '@app/core/model/PlayerData';
import { PlayerPositionService } from '@app/services/player.position.service';

export class PlayerCreator {

  constructor(
    private personGroupId: string,
    private playerPositionService: PlayerPositionService,
    private rtcService: RTCService,
    private faceApiService: AzureVisionFaceApiService,
    private playerService: PlayerService
  ) { }

  private takeSnapshot = (videoElm: ElementRef, canvasElm: ElementRef) => {
    return this.rtcService.takeSnapshot(videoElm, canvasElm);
  }

  private detectFaces = (capturedImage) => {
    return this.faceApiService.detectFaces(capturedImage).toPromise();
  }

  private addFace = (faces, personId: string, snapshot, isLeftPlayer: boolean) => {

    if (faces === undefined || faces.length === 0 || faces.length > 2) {
      console.log('not valid face detection response received');
      return;
    }

    faces.forEach(face => {

      // left player
      if (isLeftPlayer && this.playerPositionService.isLeftPlayerResponse(face)) {
        console.log('adding face for left player', this.personGroupId, personId, snapshot, this.targetFace(face));
        return this.faceApiService.addPersonFace(this.personGroupId, personId, snapshot, this.targetFace(face)).toPromise();
      }

      // right player
      if (!isLeftPlayer && this.playerPositionService.isRightPlayerResponse(face)) {
        console.log('adding face for right player', this.personGroupId, personId, snapshot, this.targetFace(face));
        return this.faceApiService.addPersonFace(this.personGroupId, personId, snapshot, this.targetFace(face)).toPromise();
      }

    });
  }

  private targetFace = (faceResponse) => {
    return  faceResponse.faceRectangle.left + ',' +
            faceResponse.faceRectangle.top + ',' +
            faceResponse.faceRectangle.width + ',' +
            faceResponse.faceRectangle.height;
  }

  private addPlayer(videoElm: ElementRef, canvasElm: ElementRef, personId: string, isLeftPlayer: boolean) {
    let snapshot;
    return this.takeSnapshot(videoElm, canvasElm)
      .then(image => {
        snapshot = image;
        return this.detectFaces(snapshot);
      })
      .then(faces => this.addFace(faces, personId, snapshot, isLeftPlayer));
  }

  createNewPlayerWithRandomName(videoElm: ElementRef, canvasElm: ElementRef, isLeftPlayer: boolean, consumer: (data: PlayerData) => void) {

    let personId;
    this.playerService.generateRandomName(this.personGroupId)
      .then(name => {
        console.log('creating person', this.personGroupId, name, '0');
        return this.faceApiService.createPerson(this.personGroupId, name, '0').toPromise();
      })
      .then(response => {
        personId = response['personId'];
        console.log('adding player', response['personId'], isLeftPlayer);
        return this.addPlayer(videoElm, canvasElm, response['personId'], isLeftPlayer);
      })
      .then(() => this.playerService.findPlayerFor(this.personGroupId, personId))
      .then(freshPlayer => consumer(freshPlayer));
  }

}

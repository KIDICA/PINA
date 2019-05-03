import {ElementRef} from '@angular/core';
import {RTCService} from '@app/services/rtc.service';
import {AzureVisionFaceApiService} from '@app/services/azureVisionFaceApi.service';
import { PlayerService } from '@app/services';
import { PlayerData } from '@app/core/model/PlayerData';

export class PlayerCreator {

  constructor(
    private personGroupId: string,
    private leftPlayerFieldOfPlayWidth: number,
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
      if (isLeftPlayer && this.isLeftPlayer(face)) {
        console.log('adding face for left player', this.personGroupId, personId, snapshot, this.targetFace(face));
        return this.faceApiService.addPersonFace(this.personGroupId, personId, snapshot, this.targetFace(face)).toPromise();
      }

      // right player
      if (!isLeftPlayer && !this.isLeftPlayer(face)) {
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

  private isLeftPlayer = (faceResponse) => {
    return faceResponse.faceRectangle.left + faceResponse.faceRectangle.width < this.leftPlayerFieldOfPlayWidth;
  }

  private createNewPlayer(name) {
    return this.faceApiService.createPerson(this.personGroupId, name, '0');
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
      .then(name => this.faceApiService.createPerson(this.personGroupId, name, '0').toPromise())
      .then(response => {
        personId = response['personId'];
        return this.addPlayer(videoElm, canvasElm, response['personId'], isLeftPlayer);
      })
      .then(() => this.playerService.findPlayerFor(this.personGroupId, personId))
      .then(freshPlayer => consumer(freshPlayer));
  }

}

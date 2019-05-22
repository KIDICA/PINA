import { Injectable, ElementRef } from '@angular/core';
import { AzureVisionFaceApiService } from './azureVisionFaceApi.service';
import { RTCService } from './rtc.service';
import { FaceContainer } from '@app/core/model/FaceContainer';
import { forkJoin } from 'rxjs';

@Injectable({providedIn: 'root'})
export class FaceDetectionService {

  constructor(
    private imageAnalyzing: AzureVisionFaceApiService,
    private rtcService: RTCService
  ) {}

  private detectFaces = (capturedImage) => {
    return this.imageAnalyzing.detectFaces(capturedImage).toPromise();
  }

  private identifyFaces = (detectFacesResponse, personGroupId: string, data: FaceContainer) => {

    if (detectFacesResponse !== undefined && detectFacesResponse.length > 0) {
      detectFacesResponse.forEach(r => {
        data.addRectangle(r);
        // data.addAge(r);
        // data.addGender(r);
      });
      return this.imageAnalyzing.identifyFaces(personGroupId, data.getFaceIds()).toPromise();
    }

    return Promise.reject(new Error('no faces found'));
  }

  private determinePersons = (indentifyFacesResponses, personGroupId: string, data: FaceContainer) => {

    if (indentifyFacesResponses !== undefined && indentifyFacesResponses.length > 0 ) {
      indentifyFacesResponses.forEach(response => data.addCandidates(response));
      const observables = data.getPersonIds().map(personId => this.imageAnalyzing.findPerson(personGroupId, personId));
      return forkJoin(observables)
        .toPromise()
        .then(responses => this.mapResponsesToFaceContainer(responses, data));
    }

    return Promise.reject(new Error('no persons found'));
  }

  private mapResponsesToFaceContainer = (responses, faceContainer) => {
    if (responses !== undefined) {
      responses.forEach(person => {
        faceContainer.addName(person);
        faceContainer.addPersonData(person);
      });
    }
  }

  public takeSnapshotAndDetectFaces(
    personGroupId: string,
    videoElm: ElementRef,
    canvasElm: ElementRef,
    consumer: (data: FaceContainer) => void,
    errorHandler: (error: Error) => void) {

    const data: FaceContainer = new FaceContainer();

    this.rtcService.takeSnapshot(videoElm, canvasElm)
        .then(response => {
          return this.detectFaces(response);
        })
        .then(response => this.identifyFaces(response, personGroupId, data), errorHandler)
        .then(response => this.determinePersons(response, personGroupId, data), errorHandler)
        .then(() => consumer(data));
  }
}

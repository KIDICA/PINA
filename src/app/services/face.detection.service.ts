﻿import { Injectable, ElementRef } from '@angular/core';
import { AzureVisionFaceApiService } from './azureVisionFaceApi.service';
import { RTCService } from './rtc.service';
import { FaceContainer } from '@app/core/model/FaceContainer';
import { forkJoin } from 'rxjs';

@Injectable({providedIn: 'root'})
export class FaceDetectionService {

  constructor(
    private imageAnalyzing: AzureVisionFaceApiService,
    private rtcService: RTCService,
  ) { }

  private detectFaces = (capturedImage) => {
    return this.imageAnalyzing.detectFaces(capturedImage).toPromise();
  }

  private indentifyFaces = (detectFacesResponse, personGroupId: string, data: FaceContainer) => {

    if (detectFacesResponse !== undefined && detectFacesResponse.length > 0) {
      detectFacesResponse.forEach(r => {
        
        console.log('face response', r);
        
        data.addRectangle(r);
        data.addAge(r);
        data.addGender(r);
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
        .then(responses => responses.forEach(person => data.addName(person)));
    }

    return Promise.reject(new Error('no persons found'));
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
          
          // TODO
          this.imageAnalyzing.detectCelebrities(response).toPromise().then(r => console.log('celebritites', r));
          
          return this.detectFaces(response);
        })
        .then(response => this.indentifyFaces(response, personGroupId, data), errorHandler)
        .then(response => this.determinePersons(response, personGroupId, data), errorHandler)
        .then(() => consumer(data));
  }
}

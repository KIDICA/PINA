import {ElementRef, Injectable} from '@angular/core';
import {RTCService} from '@app/services/rtc.service';
import {interval} from 'rxjs';
import {AzureVisionFaceApiService} from '@app/services/azureVisionFaceApi.service';
import {map, switchMap} from 'rxjs/operators';
import {PersonData} from '@app/core/model';

@Injectable({providedIn: 'root'})
export class FaceTrainingService {

  constructor(
    private imageAnalyzing: AzureVisionFaceApiService,
    private rtcService: RTCService,
  ) { }

  registerPerson(personGroupId: string, personData: PersonData) {
    return this.imageAnalyzing.createPerson(personGroupId, personData.name).pipe(map(response => {
      personData.persondId = response['personId'];
      return personData;
    })).toPromise();
  }

  registerFace(personGroupId: string, personData: PersonData,  videoElm: ElementRef, canvasElm: ElementRef) {
    return this.rtcService.takeSnapshot(videoElm, canvasElm).then(blob => this.submitFaces(personGroupId, personData, blob));
  }

  private submitFaces = (personIdGroupId: string, personData: PersonData, blob) => {
    return this.imageAnalyzing.addPersonFace(personIdGroupId, personData.persondId, blob).toPromise();
  }

  beginPersonGroupTraining(personIdGroupId: string, finished: () => void, inProgress: () => void) {
    this.imageAnalyzing.trainPersonGroup(personIdGroupId)
      .toPromise()
      .then(response => this.pollPersonGroupTrainingStatus(personIdGroupId, finished, inProgress));
  }

  private pollPersonGroupTrainingStatus = (personIdGroupId: string, finished: () => void, inProgress: () => void) => {

    const handle = interval(1000)
    .pipe(switchMap(() => this.imageAnalyzing.personGroupTrainingStatus(personIdGroupId)))
    .subscribe(response => {
      if (response['status'] === 'Succeeded') {
        handle.unsubscribe();
        finished();
      } else {
        inProgress();
      }
    });
  }

}

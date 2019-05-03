import {ElementRef, Injectable} from '@angular/core';
import {RTCService} from '@app/services/rtc.service';
import {interval} from 'rxjs';
import {AzureVisionFaceApiService} from '@app/services/azureVisionFaceApi.service';
import {map, switchMap} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class FaceTrainingService {

  constructor(
    private imageAnalyzing: AzureVisionFaceApiService,
    private rtcService: RTCService,
  ) { }

  registerPerson(personGroupId: string, name: string, score: number) {
    return this.imageAnalyzing.createPerson(personGroupId, name, score.toString()).pipe(map(response => {
      return response['personId'];
    })).toPromise();
  }

  registerFace(personGroupId: string, persondId: string,  videoElm: ElementRef, canvasElm: ElementRef) {
    return this.rtcService.takeSnapshot(videoElm, canvasElm).then(blob => this.submitFaces(personGroupId, persondId, blob));
  }

  private submitFaces = (personIdGroupId: string, persondId: string, blob) => {
    return this.imageAnalyzing.addPersonFace(personIdGroupId, persondId, blob).toPromise();
  }

  beginPersonGroupTraining(personIdGroupId: string, finished: () => void, inProgress: () => void) {
    this.imageAnalyzing.trainPersonGroup(personIdGroupId)
      .toPromise()
      .then(response => this.pollPersonGroupTrainingStatus(personIdGroupId, finished, inProgress));
  }

  private pollPersonGroupTrainingStatus = (personIdGroupId: string, finished: () => void, inProgress: () => void) => {
    const handle = interval(5000)
    .pipe(switchMap(() => this.imageAnalyzing.personGroupTrainingStatus(personIdGroupId)))
    .subscribe(response => {
      if (response['status'].toLowerCase() === 'succeeded') {
        handle.unsubscribe();
        finished();
      } else {
        inProgress();
      }
    });
  }

}

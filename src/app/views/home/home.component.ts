import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PinaAlertService, ConfigService} from '@app/services';
import {RTCService} from '@app/services/rtc.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, forkJoin, timer, interval, identity} from 'rxjs';
import {AzureVisionFaceApiService} from '@app/services/azureVisionFaceApi.service';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '@environments/environment';
import {takeUntil, take} from 'rxjs/operators';
import { TrainingComponent } from '../training';

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild('video') videoElm: ElementRef;
  @ViewChild('canvas') canvasElm: ElementRef;

  isCanvasVisible = false;
  areMultipleCamerasAvailable = false;
  countDownValue = environment.snapshotIntervalInSeconds + 1;

  constructor(
    private configService: ConfigService,
    private imageAnalyzing: AzureVisionFaceApiService,
    private alertService: PinaAlertService,
    private rtcService: RTCService,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService
  ) { }

  private initSuccess = () => {
    this.hideSpinnerWithDelay(1000).finally(() => {
      this.alertService.success(this.translateService.instant('views.home.messages.applicationSuccessfullyInitialized'));
      this.areMultipleCamerasAvailable = this.rtcService.getNumberOfAvailableCameras() > 1;

      /*
      this.imageAnalyzing.trainPersonGroup(TrainingComponent.personGroupId)
        .toPromise()
        .then(response => console.log('training resopnse', response));
      */

      this.takeSnapshots();
    });
  }

  private initError = error => {
    this.alertService.error(error);
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    this.spinner.hide();
  }

  private detectFaces = (capturedImage) => {
    return this.imageAnalyzing.detectFaces(capturedImage).toPromise();
  }

  private indentifyFaces = (detectFacesResponse) => {

    console.log('detectFacesResponse', detectFacesResponse);

    if (detectFacesResponse.length > 0) {
      const faceIds: [] = detectFacesResponse.map(v => v['faceId']);
      this.imageAnalyzing.identifyFaces(TrainingComponent.personGroupId, faceIds).subscribe(this.determinePersons);
    }
  }

  private determinePersons = (indentifyFacesResponses) => {

    console.log('indentifyFacesResponse', indentifyFacesResponses);

    indentifyFacesResponses.forEach(indentifyFacesResponse => {

      indentifyFacesResponse.candidates.forEach(candidate => {

        console.log('indentifyFacesResponse candidate', candidate);

        this.imageAnalyzing.findPerson(TrainingComponent.personGroupId, candidate.personId)
          .subscribe(person => console.log('received person', person));

      });
    });
  }

  ngOnInit() {
    this.spinner.show();
    forkJoin([this.configService.isConfigInitialized(), this.initCameraStream()]).subscribe(this.initSuccess, this.initError);
  }

  private takeSnapshots() {
    // TODO
    interval(5000).pipe(take(5)).subscribe(val => {

      /*
      this.imageAnalyzing.personGroupTrainingStatus(TrainingComponent.personGroupId)
        .toPromise()
        .then(response => console.log('training status', response));
      */

      this.rtcService.takeSnapshot(this.videoElm, this.canvasElm)
        .then(this.detectFaces)
        .then(this.indentifyFaces);
    });
  }

  private initCameraStream() {
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    return Observable.create((observable) => {
      const constraints = {
        audio: false,
        video: {}
      };
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        this.videoElm.nativeElement.srcObject = stream;
        observable.next(true);
        observable.complete();
      }).catch((error) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        if (error === 'PermissionDeniedError') {
          observable.error(this.translateService.instant('view.home.messages.permissionDeniedError'));
        }
        observable.error(error);
      });
    });
  }

  private async hideSpinnerWithDelay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => this.spinner.hide());
  }

}

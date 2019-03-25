import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PinaAlertService, ConfigService, FaceTrainingService} from '@app/services';
import {RTCService} from '@app/services/rtc.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, forkJoin, timer, interval} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {take} from 'rxjs/operators';
import {PersonDataComponent} from '@app/core/components';
import {PersonData} from '@app/core/model';

@Component({
  templateUrl: 'training.component.html',
  styleUrls: ['training.component.css']
})
export class TrainingComponent implements OnInit {

  // TODO
  static readonly personGroupId = 'pina-test-1';

  @ViewChild('video') videoElm: ElementRef;
  @ViewChild('canvas') canvasElm: ElementRef;
  @ViewChild(PersonDataComponent) personDataComponent: PersonDataComponent;

  isMessageVisible = false;
  isCanvasVisible = false;
  areMultipleCamerasAvailable = false;
  countDownValue = -1;
  message = '';

  constructor(
    private configService: ConfigService,
    private alertService: PinaAlertService,
    private rtcService: RTCService,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService,
    private faceTrainingService: FaceTrainingService
  ) { }

  private initSuccess = () => {
    this.hideSpinnerWithDelay(1000).finally(() => {
      this.alertService.success(this.translateService.instant('views.home.messages.applicationSuccessfullyInitialized'));
      this.areMultipleCamerasAvailable = this.rtcService.getNumberOfAvailableCameras() > 1;
    });
  }

  private initError = (error) => {
    this.alertService.error(error);
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    this.spinner.hide();
  }

  private takeAndSubmitPicture = (val: Number, personData: PersonData) => {
    console.log('takeAndSubmitPicture', val, this.countDownValue);

    // message
    if (val === 14) {
      this.message = 'finished';
    } else if (val > 11) {
      this.message = 'look up';
    } else if (val > 7) {
      this.message = 'look right';
    } else if (val > 4) {
      this.message = 'look left';
    }

    // taking and submitting screenshots
    if (val > 4) {
      this.faceTrainingService.registerFace(TrainingComponent.personGroupId, personData, this.videoElm, this.canvasElm);
    }

    this.countDownValue--;
  }

  private takeAndSubmitPictures(personData: PersonData) {

    this.countDownValue = 5;

    interval(1000).pipe(take(15)).subscribe(
      val => this.takeAndSubmitPicture(val, personData),
      () => {},
      () => this.faceTrainingService.beginPersonGroupTraining(
        TrainingComponent.personGroupId,
        () => console.log('it is done'),
        () => console.log('still ongoing')
      )
    );
  }

  ngOnInit() {
    this.spinner.show();
    forkJoin([this.configService.isConfigInitialized(), this.initCameraStream()]).subscribe(this.initSuccess, this.initError);
  }

  showCountDownValue() {
    return this.countDownValue > 0;
  }

  receivePersonData($personData: PersonData) {
    console.log('received persondata event', $personData);
    this.personDataComponent.toggleVisibility();
    this.faceTrainingService.registerPerson(TrainingComponent.personGroupId, $personData)
      .then(data => this.takeAndSubmitPictures(data));
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

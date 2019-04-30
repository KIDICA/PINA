import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PinaAlertService, ConfigService, FaceDetectionService} from '@app/services';
import {RTCService} from '@app/services/rtc.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, forkJoin, timer, interval, identity, Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '@environments/environment';
import {TrainingComponent} from '../training';
import {FaceContainer} from '../../core/model/FaceContainer';
import {Router} from '@angular/router';
import { take } from 'rxjs/operators';
import { AzureVisionFaceApiService } from '@app/services/azureVisionFaceApi.service';

@Component({
  templateUrl: 'recognition.emotion.component.html',
  styleUrls: ['recognition.emotion.component.css']
})
export class RecognitionEmotionComponent implements OnInit {

  @ViewChild('video') private videoElm: ElementRef;
  @ViewChild('canvas') private canvasElm: ElementRef;

  /*
  @ViewChild('leftContainer') private leftContainer: ElementRef;
  */

  private readonly images = [
    '/assets/images/emoji_happy_large.png',
    '/assets/images/emoji_angry_large.png',
    '/assets/images/emoji_sad_large.png'
  ];

  private readonly overlayTopMessages = [
    'PHASE ONE',
    'PHASE TWO',
    'PHASE THREE'
  ];

  private readonly overlayMiddleMessages = [
    'PREPARE TO LOOK HAPPY',
    'PREPARE TO LOOK ANGRY',
    'PREPARE TO LOOK SAD'
  ];

  private readonly overlayBottomMessages = [
    'GAME STARTS IN',
    'GAME CONTINUES IN',
    'GAME CONTINUES IN'
  ];

  private readonly messages = [
    'LOOK HAPPY',
    'LOOK ANGRY',
    'LOOK SAD'
  ];

  private overlaySubscription;
  private gameSubscription;

  rightGaugeValue = 0;
  leftGaugeValue = 0;
  currentState = 0;
  countDownValue = 5;
  hideOverlay = false;
  runCircleFillAnimation = false;
  areMultipleCamerasAvailable = false;

  constructor(
    private configService: ConfigService,
    private alertService: PinaAlertService,
    private rtcService: RTCService,
    private faceDetectionService: FaceDetectionService,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private faceApiService: AzureVisionFaceApiService
  ) { }

  private initSuccess = () => {
    this.hideSpinnerWithDelay(1000).finally(() => {
      this.alertService.success(this.translateService.instant('views.home.messages.applicationSuccessfullyInitialized'));
      this.areMultipleCamerasAvailable = this.rtcService.getNumberOfAvailableCameras() > 1;
      this.launchOverlaySubscriber();
    });
  }

  private handleError = error => {
    this.alertService.error(error);
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    this.spinner.hide();
  }

  private launchOverlaySubscriber() {
    this.hideOverlay = false;
    this.runCircleFillAnimation = false;
    this.countDownValue = 5;
    this.overlaySubscription = interval(1000).pipe(take(5)).subscribe(
      (value) => { this.countDownValue--; },
      this.handleError,
      () => {
        this.overlaySubscription.unsubscribe();
        this.launchGameSubscriber();
      }
    );
  }

  private launchGameSubscriber() {
    this.hideOverlay = true;
    this.runCircleFillAnimation = true;
    this.gameSubscription = interval(1000).pipe(take(10)).subscribe(
      this.gameLogic,
      this.handleError,
      () => {
        this.gameSubscription.unsubscribe();
        if (this.currentState === 2) {
          this.leftGaugeValue = 0;
          this.rightGaugeValue = 0;
          this.router.navigate(['highscore']);
        } else {
          this.currentState++;
          this.launchOverlaySubscriber();
        }
      }
    );
  }

  private gameLogic = (value) => {
    this.rtcService.takeSnapshot(this.videoElm, this.canvasElm)
      .then(image => this.faceApiService.detectFaces(image).toPromise())
      .then(response => {
        this.leftGaugeValue = this.determineScore(response, 0);
        this.rightGaugeValue = this.determineScore(response, 1);
    });
  }

  private determineScore(response, index) {

    if (response !== undefined && response['length'] > index) {

      // happy
      if (this.currentState === 0) {
        return response[index].faceAttributes.emotion.happiness * 100;
      }

      // angry
      if (this.currentState === 1) {
        return response[index].faceAttributes.emotion.anger * 100;
      }

      // sad
      if (this.currentState === 2) {
        return response[index].faceAttributes.emotion.sadness * 100;
      }
    }

    return 0;
  }

  /*
  private calculateDimension() {
    const width = this.leftContainer.nativeElement.clientWidth;
    const height = this.leftContainer.nativeElement.clientHeight;
    return {width: width, height: height};
  }
  */

  private firstVideoDeviceStream = () => {
    return this.rtcService.getVideoDeviceIds()
      .then(ids => ids[0])
      .then(id => this.rtcService.getConstraints(id))
      .then(constraints => navigator.mediaDevices.getUserMedia(constraints));
  }

  private initCameraStream() {
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    return Observable.create((observable) => {
      this.firstVideoDeviceStream().then((stream) => {
        this.videoElm.nativeElement.srcObject = stream;
        observable.next(true);
        observable.complete();
      }).catch((error) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        if (error === 'PermissionDeniedError') {
          observable.error(this.translateService.instant('view.home.messages.permissionDeniedError'));
        } else {
          observable.error(error);
        }
      });
    });
  }

  private async hideSpinnerWithDelay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => this.spinner.hide());
  }

  ngOnInit() {
    this.spinner.show();
    forkJoin([this.configService.isConfigInitialized(), this.initCameraStream()]).subscribe(this.initSuccess, this.handleError);
  }

  image() {
    return this.images[ this.currentState ];
  }

  overlayTopMessage() {
    return this.overlayTopMessages[ this.currentState ];
  }

  overlayMiddleMessage() {
    return this.overlayMiddleMessages[ this.currentState ];
  }

  overlayBottomMessage() {
    return this.overlayBottomMessages[ this.currentState ];
  }

  message() {
    return this.messages[ this.currentState ];
  }

}

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
import { PlayerData } from '@app/core/model/PlayerData';

@Component({
  templateUrl: 'recognition.person.component.html',
  styleUrls: ['recognition.person.component.css']
})
export class RecognitionPersonComponent implements OnInit {

  // TODO
  static readonly personGroupId = 'pina-test-1';

  @ViewChild('videoPerson') private videoElm: ElementRef;
  @ViewChild('canvasPerson') private canvasElm: ElementRef;

  private subscription: Subscription;

  playerOne = new PlayerData();
  playerTwo = new PlayerData();
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
      this.letTheMagicHappen();
    });
  }

  private initError = error => {
    this.alertService.error(error);
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    this.spinner.hide();
  }

  private letTheMagicHappen() {
    this.subscription = interval(1000).subscribe(val => {
      this.faceDetectionService.takeSnapshotAndDetectFaces(
        RecognitionPersonComponent.personGroupId,
        this.videoElm,
        this.canvasElm,
        this.analyzeResponse,
        this.analyzeError
      )
    });
  }

  private analyzeError = (error) => {
    // TODO
  }


  private analyzeResponse = (data: FaceContainer) => {

    if (this.isAlive()) {

      this.playerOne.noPlayerFound();
      this.playerTwo.noPlayerFound();
      const faces = data.magic();

      if (faces.length > 2) {

        this.alertService.error('more then 2 persons found');

      } else {

        faces.forEach(face => {

          // player one or two?
          const player = this.playerOneFieldOfPlayWidth() < face.rectangle.left + face.rectangle.width ? this.playerTwo : this.playerOne;

          console.log('################', this.playerOneFieldOfPlayWidth(), face.rectangle.left,  face.rectangle.width);

          if (face.name === FaceContainer.UNKNOWN) {

            player.unkownPlayerFound();

          } else {

            player.knownPlayerFound(face.name, 'TODO');

          }

        });
      }

      // TODO
      this.mayMoveToNextPage();
    }
  }

  /*

  private letTheMagicHappen() {
    this.subscription = interval(1000).subscribe(val => {
      this.rtcService.takeSnapshot(this.videoElm, this.canvasElm)
        .then(image => this.faceApiService.detectFaces(image).toPromise())
        .then(response => {
          this.analyze(response);
          this.mayMoveToNextPage();
        });
    });
  }

  private analyze(response) {

    this.playerOne.noPlayerFound();
    this.playerTwo.noPlayerFound();

    if (response === undefined || response.length === 0) {

      // wait and wo nothing

    } else if (response.length > 2) {

      this.alertService.error('more then 2 persons found');

    } else {

      response.forEach(r => {

        if (r.faceRectangle.width + r.faceRectangle.left < this.playerOneFieldOfPlayWidth()) {

          this.playerOne.unkownPlayerFound();

        } else {

          this.playerTwo.unkownPlayerFound();
        }

      });

    }
  }
  */

  private isAlive() {
    return this.subscription !== undefined && !this.subscription.closed;
  }

  private mayMoveToNextPage() {

    if (!this.playerOne.isNoPlayerFound() && !this.playerTwo.isNoPlayerFound()) {

      if (this.subscription !== undefined) {
        this.subscription.unsubscribe();
      }

      this.router.navigate(['intro']);
    }
  }

  private playerOneFieldOfPlayWidth() {
    console.log('canvasElm.nativeElement.clientWidth', this.canvasElm.nativeElement.width);
    // return this.videoElm.nativeElement.clientWidth / 2;
    return this.canvasElm.nativeElement.width / 2;
  }

  ngOnInit() {
    this.spinner.show();
    forkJoin([this.configService.isConfigInitialized(), this.initCameraStream()]).subscribe(this.initSuccess, this.initError);
  }

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

}

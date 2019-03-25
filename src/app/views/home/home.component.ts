import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PinaAlertService, ConfigService, FaceDetectionService} from '@app/services';
import {RTCService} from '@app/services/rtc.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, forkJoin, timer, interval, identity} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '@environments/environment';
import {take} from 'rxjs/operators';
import {TrainingComponent} from '../training';
import {FaceContainer} from '../../core/model/FaceContainer';

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
    private alertService: PinaAlertService,
    private rtcService: RTCService,
    private faceDetectionService: FaceDetectionService,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService
  ) { }

  private initSuccess = () => {
    this.hideSpinnerWithDelay(1000).finally(() => {
      this.alertService.success(this.translateService.instant('views.home.messages.applicationSuccessfullyInitialized'));
      this.areMultipleCamerasAvailable = this.rtcService.getNumberOfAvailableCameras() > 1;
      this.takeSnapshots();
    });
  }

  private initError = error => {
    this.alertService.error(error);
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    this.spinner.hide();
  }

  private drawRectanglesAndNames = (container: FaceContainer) => {
    const canvas = this.canvasElm.nativeElement.getContext('2d');
    canvas.font = `${environment.canvas.font.size} ${environment.canvas.font.family}`;
    canvas.fillStyle = environment.canvas.colors.success;
    canvas.strokeStyle = environment.canvas.colors.success;
    container.drawNamesAndRectangles(canvas);
  }

  ngOnInit() {
    this.spinner.show();
    forkJoin([this.configService.isConfigInitialized(), this.initCameraStream()]).subscribe(this.initSuccess, this.initError);
  }

  private takeSnapshots() {
    // TODO
    interval(5000).pipe(take(1)).subscribe(val => {
      this.faceDetectionService.takeSnapshotAndDetectFaces(
        TrainingComponent.personGroupId,
        this.videoElm,
        this.canvasElm,
        this.drawRectanglesAndNames,
        () => {}
      );

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

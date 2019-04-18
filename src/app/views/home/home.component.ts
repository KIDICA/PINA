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

@Component({
  templateUrl: 'home.component.html',
  styleUrls: ['home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild('video') private videoElm: ElementRef;
  @ViewChild('canvas') private canvasElm: ElementRef;
  private subscription: Subscription;

  areMultipleCamerasAvailable = false;

  constructor(
    private configService: ConfigService,
    private alertService: PinaAlertService,
    private rtcService: RTCService,
    private faceDetectionService: FaceDetectionService,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService,
    private router: Router
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

  private errorHandler = error => {
    // TODO
    console.log('some error happend', error);
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

  navigateToFacialTraining() {
    if (this.subscription !== undefined) {
        this.subscription.unsubscribe();
    }
    this.router.navigate(['training']);
  }

  private takeSnapshots() {
    this.subscription = interval(3000).pipe(take(3)).subscribe(val => {

      this.faceDetectionService.takeSnapshotAndDetectFaces(
        TrainingComponent.personGroupId,
        this.videoElm,
        this.canvasElm,
        this.drawRectanglesAndNames,
        this.errorHandler
      );

    });
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

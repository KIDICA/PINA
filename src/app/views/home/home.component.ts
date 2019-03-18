import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PinaAlertService, ConfigService} from '@app/services';
import {RTCService} from '@app/services/rtc.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, forkJoin, timer, interval} from 'rxjs';
import {AzureVisionApiService} from '@app/services/azureVisionApi.service';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '@environments/environment';
import {takeUntil} from 'rxjs/operators';

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
    private imageAnalyzing: AzureVisionApiService,
    private alertService: PinaAlertService,
    private rtcService: RTCService,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService
  ) { }

  private analyzeCapturedSnapshot = (capturedImage) => {
    return this.imageAnalyzing.detectFaces(capturedImage).toPromise();
  }

  private drawRectanglesAroundFaces = apiResponse => {
    const faces = apiResponse.faces || [];
    const canvas = this.canvasElm.nativeElement.getContext('2d');
    const fillColor = (faces.length > 0) ? environment.canvas.colors.success : environment.canvas.colors.error;
    canvas.font = `${environment.canvas.font.size} ${environment.canvas.font.family}`;
    canvas.fillStyle = fillColor;
    canvas.strokeStyle = fillColor;

    canvas.fillText(this.translateService.instant('views.home.canvas.resultText', {'numberOfFaces': faces.length}), 50, 50);

    faces.forEach(face => {
        // Rectangle
        canvas.strokeRect(face.faceRectangle.left, face.faceRectangle.top, face.faceRectangle.width, face.faceRectangle.height);
        // Age
        canvas.fillText(face.age, face.faceRectangle.left + face.faceRectangle.width + 5, face.faceRectangle.top + 15);
        // Gender
        canvas.fillText(face.gender, face.faceRectangle.left + face.faceRectangle.width + 5, face.faceRectangle.top + 55);
      });
  }

  private toggleCanvasVisibility = () => this.isCanvasVisible = !this.isCanvasVisible;

  private refreshCountDownValue = (val) => {
    this.countDownValue = environment.snapshotIntervalInSeconds - (val + 1);
  }

  private textResultConsumer = (results) => {

    const canvas = this.canvasElm.nativeElement.getContext('2d');
    canvas.font = `${environment.canvas.font.size} ${environment.canvas.font.family}`;
    canvas.fillStyle = environment.canvas.colors.success;
    canvas.strokeStyle = environment.canvas.colors.success;

    results.forEach(result => {

      // Rectangle
      canvas.beginPath();
      canvas.moveTo(result.boundingBox[0], result.boundingBox[1]);
      canvas.lineTo(result.boundingBox[2], result.boundingBox[3]);
      canvas.lineTo(result.boundingBox[4], result.boundingBox[5]);
      canvas.lineTo(result.boundingBox[6], result.boundingBox[7]);
      canvas.lineTo(result.boundingBox[0], result.boundingBox[1]);
      canvas.stroke();

      // Text
      const x = Math.min(result.boundingBox[0], result.boundingBox[2], result.boundingBox[4], result.boundingBox[6]);
      const y = Math.max(result.boundingBox[1], result.boundingBox[3], result.boundingBox[5], result.boundingBox[7]);
      canvas.fillText(result.text, x, y + 25);
    });
  }

  showCountDown() {
    return this.countDownValue <= environment.snapshotIntervalInSeconds;
  }

  showCameraStream() {
    this.isCanvasVisible = false;
    this.countDownValue = environment.snapshotIntervalInSeconds + 1;
  }

  ngOnInit() {
    this.spinner.show();
    forkJoin([this.configService.isConfigInitialized(), this.initCameraStream()])
    .subscribe(() => {
      this.hideSpinnerWithDelay(1000)
      .finally(() => {
        this.alertService.success(this.translateService.instant('views.home.messages.applicationSuccessfullyInitialized'));
        this.areMultipleCamerasAvailable = this.rtcService.getNumberOfAvailableCameras() > 1;
      });
    }, error => {
      this.alertService.error(error);
      this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
      this.spinner.hide();
    });
  }

  takeSnapshot() {
    const source = interval(1000);
    const timer$ = timer(environment.snapshotIntervalInSeconds * 1000);

    source.pipe(takeUntil(timer$)).subscribe(this.refreshCountDownValue);
    timer$.subscribe(() => {

      const snapshotPromise =  this.rtcService.takeSnapshot(this.videoElm, this.canvasElm);

      snapshotPromise
        .then(this.analyzeCapturedSnapshot)
        .then(this.drawRectanglesAroundFaces)
        .finally(this.toggleCanvasVisibility);

      snapshotPromise
        .then(x => this.imageAnalyzing.detectText(x, this.textResultConsumer));
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

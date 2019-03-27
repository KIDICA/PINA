import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PinaAlertService, ConfigService, FaceTrainingService} from '@app/services';
import {RTCService} from '@app/services/rtc.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, forkJoin, timer, interval} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {take} from 'rxjs/operators';
import {PersonDataComponent} from '@app/core/components';
import {PersonData} from '@app/core/model';
import {environment} from '@environments/environment';
import { Buffer } from 'buffer';

@Component({
  templateUrl: 'training.component.html',
  styleUrls: ['training.component.css']
})
export class TrainingComponent implements OnInit {

  // TODO
  static readonly personGroupId = 'pina-test-1';

  @ViewChild(PersonDataComponent) personDataComponent: PersonDataComponent;

  private videoElements: ElementRef[] = new Array<ElementRef>();
  private canvasElements: ElementRef[] = new Array<ElementRef>();

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

      // TODO
      interval(1000).pipe(take(3)).subscribe(val => {
        for (let i = 0; i < this.videoElements.length; i++) {
          if (this.videoElements[i] !== undefined && this.canvasElements[i] !== undefined) {
            console.log('drawing');
            this.rtcService.takeSnapshot(this.videoElements[i], this.canvasElements[i]).then((blob: Blob) => {

              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onloadend = function() {
                const base64data = reader.result;
                console.log(base64data);
              };

            });
          }
        }
      });
    });
  }

  private initError = (error) => {
    this.alertService.error(error);
    this.cleanAll();
    this.spinner.hide();
  }

  ngOnInit() {
    this.spinner.show();
    forkJoin([this.configService.isConfigInitialized(), this.initCameraStreams()]).subscribe(this.initSuccess, this.initError);
  }

  private createElements() {
    this.rtcService.getVideoDeviceIds().then(ids => {

      ids.forEach(id => {

        console.log('creating video element');
        const video: HTMLVideoElement = document.createElement('video');
        video.className = 'webcam-stream';
        video.hidden = false;
        video.load();
        video.play();

        console.log('creating canvas element');
        const canvas: HTMLCanvasElement = document.createElement('canvas');
        canvas.className = 'result-canvas';
        canvas.hidden = false;
        canvas.width = 1000;
        canvas.height = 1000;

        // console.log('addding children');
        // document.body.appendChild(video);
        // document.body.appendChild(canvas);

        console.log('pushing references');
        this.videoElements.push(new ElementRef(video));
        this.canvasElements.push(new ElementRef(canvas));

      });
    });
  }

  private cleanAll() {

    console.log('stopping all');
    this.videoElements.forEach(v => this.rtcService.stopAllCurrentlyRunningStreams(v));
    this.videoElements = new Array<ElementRef>();
    this.canvasElements = new Array<ElementRef>();

    console.log('removing video tags');
    let temp: HTMLCollectionOf<any> = document.getElementsByTagName('canvas');
    for (let i = 0; i < temp.length; i++) {
      document.body.removeChild(temp.item(i));
    }

    console.log('removing canvas tags');
    temp = document.getElementsByTagName('video');
    for (let i = 0; i < temp.length; i++) {
      document.body.removeChild(temp.item(i));
    }
  }

  private initCameraStreams() {
    return Observable.create((observer) => {
      this.cleanAll();
      this.createElements();
      this.rtcService.getVideoDeviceIds().then(ids => {

        console.log('recieved ids');

        for (let i = 0; i < ids.length; i++) {
          console.log('creating contraints', i);
          const constraints: MediaStreamConstraints = this.rtcService.getConstraints(ids[i]);
          console.log('connecting streams', i);
          navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            this.videoElements[i].nativeElement.srcObject = stream;
          });
        }

        observer.next(true);
        observer.complete();

      }).catch((error) => this.handleObserverError(observer, error));
    });
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  private handleObserverError(observer: any, error: string) {
    if (error === 'PermissionDeniedError') {
      observer.error(this.translateService.instant('view.home.messages.permissionDeniedError'));
    } else {
      observer.error(error);
    }
  }

  private async hideSpinnerWithDelay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => this.spinner.hide());
  }

}

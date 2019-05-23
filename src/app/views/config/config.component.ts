import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import { PinaAlertService, RCCarService } from '@app/services';
import { RTCService } from '@app/services/rtc.service';
import { ConfigurationState } from '@app/misc/configuration.state';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

@Component({
  templateUrl: 'config.component.html',
  styleUrls: ['../../../assets/css/global.css', 'config.component.css']
})
export class ConfigurationComponent implements OnInit {

  @ViewChild('video') private videoElm: ElementRef;

  availableVideoDeviceIds = new Array<string>();

  constructor(
    private alertService: PinaAlertService,
    private rtcService: RTCService,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService,
    private router: Router,
    public configurationState: ConfigurationState,
    private rcCarService: RCCarService
  ) {}

  ngOnInit() {
    this.spinner.show();
    this.initCameraStream(this.firstVideoDeviceStream()).subscribe(this.initSuccess, this.initError);
  }

  testRCCars() {
    this.rcCarService.accelerate(this.configurationState.rcCar1Uri, 30);
    this.rcCarService.accelerate(this.configurationState.rcCar2Uri, 30);
  }

  stopRCCars() {
    this.rcCarService.stop(this.configurationState.rcCar1Uri);
    this.rcCarService.stop(this.configurationState.rcCar2Uri);
  }

  carModes() {
    return [
      {
        'value': true,
        'label': 'ON',
        'selected': this.configurationState.driveCars
      }, {
        'value': false,
        'label': 'OFF',
        'selected': !this.configurationState.driveCars
      }
    ];
  }

  selectCarMode(newMode: boolean) {
    this.configurationState.driveCars = newMode;
  }

  operatingModes() {
    return [
      {
        'value': false,
        'label': 'continue via countdown',
        'selected': !this.configurationState.pressKeyToContinue
      }, {
        'value': true,
        'label': 'continue via button press',
        'selected': this.configurationState.pressKeyToContinue
      }
    ];
  }

  selectOperatingMode(newMode: boolean) {
    this.configurationState.pressKeyToContinue = newMode;
  }

  videoDeviceIds() {
    return this.availableVideoDeviceIds.map((value, index, values) => {
      return {
        'index': index,
        'id': value,
        'selected': value === this.configurationState.selectedVideoDeviceId
      };
    });
  }

  selectVideoDevice(index: number) {
    this.spinner.show();
    this.configurationState.selectedVideoDeviceId = this.availableVideoDeviceIds[index];
    this.initCameraStream(this.useSelectedVideoStream()).subscribe(this.initSuccess, this.initError);
  }

  backToPerson() {
    this.router.navigate(['person']);
  }

  private initSuccess = () => {
    this.hideSpinnerWithDelay(1000).finally(() => {
      this.alertService.success(this.translateService.instant('views.home.messages.applicationSuccessfullyInitialized'));
    });
  }

  private initError = error => {
    this.alertService.error(error);
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    this.spinner.hide();
  }

  private firstVideoDeviceStream = () => {
    return this.rtcService.getVideoDeviceIds()
      .then(ids => {
        this.availableVideoDeviceIds = ids;
        return ids[0];
      })
      .then(id => {
        if (this.configurationState.selectedVideoDeviceId === undefined) {
          this.configurationState.selectedVideoDeviceId = id;
        }
        return this.rtcService.getConstraints(this.configurationState.selectedVideoDeviceId);
      })
      .then(constraints => navigator.mediaDevices.getUserMedia(constraints));
  }

  private useSelectedVideoStream = () => {
    const constraints = this.rtcService.getConstraints(this.configurationState.selectedVideoDeviceId);
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  private initCameraStream(pms: Promise<MediaStream>) {
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    return Observable.create((observable) => {
      pms.then((stream) => {
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

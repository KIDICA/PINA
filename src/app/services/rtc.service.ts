import {ElementRef, Injectable} from '@angular/core';
import {environment} from '@environments/environment';
import {PinaAlertService} from '@app/core/modules/pina-alert/pina-alert.service';


@Injectable({providedIn: 'root'})
export class RTCService {

  private DetectRTC: any = window['DetectRTC'];

  constructor(
    private alertService: PinaAlertService
  ) {
    this.DetectRTC.load(() => this.executeSomeChecks());
  }

  private executeSomeChecks() {

    if (this.DetectRTC.isWebRTCSupported === false) {
      this.alertService.error('Please use Chrome, Firefox, iOS 11, Android 5 or higher, Safari 11 or higher');
    } else if (this.DetectRTC.hasWebcam === false) {
      this.alertService.error('Please install an external webcam device.');
    }

    if (!environment.production) {
      this.logRTCStatus();
    }
  }

  getVideoDeviceIds(): Promise<string[]> {
    return navigator.mediaDevices
      .enumerateDevices()
      .then(infos => infos.filter(info => info.kind === 'videoinput')
      .map(info => info['deviceId']));
  }

  getConstraints(videoDeviceId: string): MediaStreamConstraints {
    return {
      audio: false,
      video: {
        deviceId: {
          exact: videoDeviceId
        }
      }
    };
  }

  createVideoDeviceStream(videoDeviceId: string) {

    if (videoDeviceId === undefined) {
      console.log('undefined videoDeviceId handed over, switching to fallback');
      return this.getVideoDeviceIds()
        .then(ids => ids[0])
        .then(id => this.getConstraints(id))
        .then(constraints => navigator.mediaDevices.getUserMedia(constraints));
    }

    return navigator.mediaDevices.getUserMedia(this.getConstraints(videoDeviceId));
  }

  getNumberOfAvailableCameras() {
    return this.DetectRTC.videoInputDevices.length;
  }

  stopAllCurrentlyRunningStreams(videoElem: ElementRef) {
    if (videoElem && videoElem.nativeElement && videoElem.nativeElement.srcObject) {
      videoElem.nativeElement.srcObject.getTracks().forEach((track) => track.stop());
      videoElem.nativeElement.srcObject = null;
    }
  }

  takeSnapshot(videoElem: ElementRef, canvasElem: ElementRef): Promise<{}> {
    const video = videoElem.nativeElement;
    const width = video.videoWidth; // video.clientWidth;
    const height = video.videoHeight; // video.clientHeight;
    canvasElem.nativeElement.width = width;
    canvasElem.nativeElement.height = height;
    const canvas = canvasElem.nativeElement.getContext('2d');
    canvas.drawImage(video, 0, 0, width, height);
    return this.getCanvasBlob(canvasElem.nativeElement);
  }

  private getCanvasBlob(canvas: HTMLCanvasElement) {
    return new Promise(function (resolve, reject) {
      canvas.toBlob(function (blob) {
        resolve(blob);
      }, 'image/png');
    });
  }

  private logRTCStatus() {
    console.log(
      `RTC Debug info:
        OS:                   ${this.DetectRTC.osName} ${this.DetectRTC.osVersion}
        browser:              ${this.DetectRTC.browser.fullVersion} ${this.DetectRTC.browser.name}
        is Mobile Device:     ${this.DetectRTC.isMobileDevice}
        has webcam:           ${this.DetectRTC.hasWebcam}
        has permission:       ${this.DetectRTC.isWebsiteHasWebcamPermission}
        getUserMedia Support: ${this.DetectRTC.isGetUserMediaSupported}
        isWebRTC Supported:   ${this.DetectRTC.isWebRTCSupported}
        WebAudio Supported:   ${this.DetectRTC.isAudioContextSupported}`
    );
  }
}

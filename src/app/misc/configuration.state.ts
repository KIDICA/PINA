import {Injectable, OnInit} from '@angular/core';
import { RTCService } from '../services/rtc.service';

@Injectable({providedIn: 'root'})
export class ConfigurationState {

  selectedVideoDeviceId: string;

  constructor( private rtcService: RTCService ) {
    this.rtcService.getVideoDeviceIds().then(ids => this.selectedVideoDeviceId = ids[0]);
  }

}

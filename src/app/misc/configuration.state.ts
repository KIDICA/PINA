import {Injectable, OnInit} from '@angular/core';
import { RTCService } from '../services/rtc.service';

@Injectable({providedIn: 'root'})
export class ConfigurationState {

  selectedVideoDeviceId: string;
  rcCar1Uri = 'http://192.168.1.113:8038/motor';
  rcCar2Uri = 'TODO';

  constructor( private rtcService: RTCService ) {
    this.rtcService.getVideoDeviceIds().then(ids => this.selectedVideoDeviceId = ids[0]);
  }

}

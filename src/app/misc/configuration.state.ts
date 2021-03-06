﻿import {Injectable, OnInit} from '@angular/core';
import { RTCService } from '../services/rtc.service';

@Injectable({providedIn: 'root'})
export class ConfigurationState {

  selectedVideoDeviceId: string;
  rcCar1Uri;
  rcCar2Uri;
  driveCars;
  pressKeyToContinue;

  constructor( private rtcService: RTCService ) {
    this.rtcService.getVideoDeviceIds().then(ids => this.selectedVideoDeviceId = ids[0]);
    this.rcCar1Uri = 'http://192.168.1.113:8038/motor';
    this.rcCar2Uri = 'http://192.168.1.126:8038/motor';
    this.driveCars = false;
    this.pressKeyToContinue = true;
  }

}

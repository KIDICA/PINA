import {Injectable} from '@angular/core';
import {PlayerData} from '@app/core/model/PlayerData';

@Injectable({providedIn: 'root'})
export class RCCarsState {

    rcCar1Uri = 'http://192.168.1.113:8038/motor';
    rcCar2Uri = 'TODO';

}

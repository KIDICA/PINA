import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationState } from '@app/misc/configuration.state';


@Injectable({ providedIn: 'root' })
export class RCCarService {

    constructor(
        private http: HttpClient,
        private configurationState: ConfigurationState
    ) {}

    /** 0 bis 100 */
    accelerate(uri: string, speed: number) {
        if (this.configurationState.driveCars) {
            this.http.put(uri, this.speedyBody(this.rangedValue(speed))).subscribe(this.NOTHINGNESS);
        }
    }

    stop(uri: string) {
        if (this.configurationState.driveCars) {
            this.http.put(uri, this.speedyBody(0)).subscribe(this.NOTHINGNESS);
        }
    }

    private NOTHINGNESS = response => {
        // nothing
    }

    private speedyBody(speed) {
        return {
            'speed': speed,
            'direction': 1
        };
    }

    /** 0,100 ==> 300,1000 */
    private rangedValue(speed) {
        let output = speed * 10;
        output = Math.max(300, output);
        output = Math.min(1000, output);
        return output;
    }
}

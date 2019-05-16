import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ConfigService } from './config.service';
import {
    HTTP_HEADER_AZ_CS_SUBSCRIPTION_API_KEY_NAME,
    HTTP_HEADER_CONTENT_TYPE_NAME,
    HTTP_HEADER_CONTENT_TYPE_VALUE_APPLICATION_OCTECT_STREAM,
    HTTP_HEADER_CONTENT_TYPE_VALUE_APPLICATION_JSON
} from '@app/core/constants/http.constants';


@Injectable({ providedIn: 'root' })
export class RCCarService {

    constructor(
        private http: HttpClient
    ) {}

    private headers() {
        return {
            [HTTP_HEADER_CONTENT_TYPE_NAME]: [HTTP_HEADER_CONTENT_TYPE_VALUE_APPLICATION_JSON]
        };
    }

    /** 0 bis 100 */
    accelerate(uri: string, speed: number) {
        console.log('accelerate', uri, speed);
        const body = this.speedyBody(this.rangedValue(speed));
        console.log('accerlerate', uri, body);
        return this.http.put(uri, body).subscribe(this.NOTHINGNESS);
    }

    stop(uri: string) {
        console.log('stop', uri, 0);
        const body = this.speedyBody(0);
        return this.http.put(uri, body).subscribe(this.NOTHINGNESS);
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

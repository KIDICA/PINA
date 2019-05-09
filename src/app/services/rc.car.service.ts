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

    // curl -XPUT -d '{"speed":"0", "direction": "1"}' http://192.168.1.113:8038/motor 

    fullSpeed() {
        const uri  = 'http://192.168.1.113:8038/motor';
        const body = this.speedyBody(500);
        return this.http.put(uri, body);
    }

    stop() {
        const uri  = 'http://192.168.1.113:8038/motor';
        const body = this.speedyBody(0);
        return this.http.put(uri, body);
    }

    private speedyBody(speed) {
        return {
            'speed': speed,
            'direction': 1
        };
    }
}

import { Injectable } from '@angular/core';
import { Observable, interval } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { ConfigService } from './config.service';
import {
    HTTP_HEADER_AZ_CS_SUBSCRIPTION_API_KEY_NAME, HTTP_HEADER_CONTENT_TYPE_NAME,
    HTTP_HEADER_CONTENT_TYPE_VALUE_APPLICATION_OCTECT_STREAM
} from '@app/core/constants/http.constants';
import { startWith, switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AzureVisionApiService {

    constructor(
        private configService: ConfigService,
        private http: HttpClient
    ) {}

    private locationFromHeaders = (response) => {
        const location = response.headers.get('Operation-Location');
        return location;
    }

    private readonly polling = (location, consumer: Function) => {

        const handle = interval(1000)
        .pipe(
            startWith(0),
            switchMap(() => {
                return this.getDetectTextResult(location);
            })
        )
        .subscribe(response => {
            if (response['status'] === 'Succeeded') {
                handle.unsubscribe();
                consumer(response['recognitionResult'].lines);
            }
        });
    }

    private headers() {
        return {
            [HTTP_HEADER_CONTENT_TYPE_NAME]: [HTTP_HEADER_CONTENT_TYPE_VALUE_APPLICATION_OCTECT_STREAM],
            [HTTP_HEADER_AZ_CS_SUBSCRIPTION_API_KEY_NAME]: this.configService.getAzCognitiveServiceKey()
        };
    }

    detectFaces(blobData) {
        const uriBase = environment.azure.cognitiveServices.facesUrl;
        const httpParams = new HttpParams()
                            .set('visualFeatures', 'Faces')
                            .set('language', 'en')
                            .set('details', '');

        return this.http.post(uriBase, blobData, {
            'headers': new HttpHeaders(this.headers()),
            'params': httpParams
        });
    }

    detectText(blobData, consumer: Function) {
        this.getDetectTextOperationLocation(blobData)
            .then(this.locationFromHeaders)
            .then(location => this.polling(location, consumer));
    }

    private getDetectTextOperationLocation(blobData) {
        const uriBase = environment.azure.cognitiveServices.ocrUrl;
        const httpParams = new HttpParams().set('mode', 'Handwritten');
        const response: Observable<HttpResponse<any>>  = this.http.post(uriBase, blobData, {
            headers: new HttpHeaders(this.headers()),
            params: httpParams,
            observe: 'response'
        });
        return response.toPromise();
    }

    private getDetectTextResult(location) {
        return this.http.get(location, {
            headers: new HttpHeaders(this.headers())
        });
    }
}

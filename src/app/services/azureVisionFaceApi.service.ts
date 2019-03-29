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
export class AzureVisionFaceApiService {

    constructor(
        private configService: ConfigService,
        private http: HttpClient
    ) {}

    private headersJson() {
        return {
            [HTTP_HEADER_CONTENT_TYPE_NAME]: [HTTP_HEADER_CONTENT_TYPE_VALUE_APPLICATION_JSON],
            [HTTP_HEADER_AZ_CS_SUBSCRIPTION_API_KEY_NAME]: this.configService.getAzCognitiveServiceKey()
        };
    }

    private headersOctetStream() {
        return {
            [HTTP_HEADER_CONTENT_TYPE_NAME]: [HTTP_HEADER_CONTENT_TYPE_VALUE_APPLICATION_OCTECT_STREAM],
            [HTTP_HEADER_AZ_CS_SUBSCRIPTION_API_KEY_NAME]: this.configService.getAzCognitiveServiceKey()
        };
    }

    createPersonGroup(personGroupId: string, personGroupDisplayName: string) {
        const uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId;
        const headers = new HttpHeaders(this.headersJson());
        const body = {'name': personGroupDisplayName};
        return this.http.put(uri, body, {headers: headers});
    }

    trainPersonGroup(personGroupId: string) {
        const uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId + '/train';
        const headers = new HttpHeaders(this.headersJson());
        return this.http.post(uri, {}, {headers: headers});
    }

    personGroupTrainingStatus(personGroupId: string) {
        const uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId + '/training';
        const headers = new HttpHeaders(this.headersJson());
        return this.http.get(uri, {headers: headers});
    }

    createPerson(personGroupId: string, personDisplayName: string) {
        const uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId + '/persons';
        const headers = new HttpHeaders(this.headersJson());
        const body = {'name': personDisplayName};
        return this.http.post(uri, body, {headers: headers});
    }

    findPerson(personGroupId: string, personId: string) {
        const uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId + '/persons/' + personId;
        const headers = new HttpHeaders(this.headersJson());
        return this.http.get(uri, {headers: headers});
    }

    addPersonFace(personGroupId: string, personId: string, blobData) {
        const uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId + '/persons/' + personId + '/persistedFaces';
        const headers = new HttpHeaders(this.headersOctetStream());
        return this.http.post(uri, blobData, {headers: headers});
    }

    detectFaces(blob) {
        const uri = environment.azure.cognitiveServices.faceDetectUrl;
        const headers = new HttpHeaders(this.headersOctetStream());
        const params = new HttpParams().set('returnFaceId', 'true').set('returnFaceAttributes', 'age,gender');
        return this.http.post(uri, blob, {headers: headers, params: params});
    }

    identifyFaces(personGroupId: string, faceIds: string[]) {
        const uri = environment.azure.cognitiveServices.faceIdentifyUrl;
        const headers = new HttpHeaders(this.headersJson());
        const body = {faceIds: faceIds, personGroupId: personGroupId};
        return this.http.post(uri, body, {headers: headers});
    }

}

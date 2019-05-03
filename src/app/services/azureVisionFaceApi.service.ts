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
        const body = {'name': personGroupDisplayName, 'recognitionModel': 'recognition_02'};
        return this.http.put(uri, body, {headers: headers});
    }

    deletePersonGroup(personGroupId: string) {
        const uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId;
        const headers = new HttpHeaders(this.headersJson());
        return this.http.delete(uri, {headers: headers});
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

    createPerson(personGroupId: string, personDisplayName: string, additionalPersonData: string) {
        const uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId + '/persons';
        const headers = new HttpHeaders(this.headersJson());
        const body = {'name': personDisplayName, 'userData': additionalPersonData};
        return this.http.post(uri, body, {headers: headers});
    }

    updatePerson(personGroupId: string, personId: string, personDisplayName: string, additionalPersonData: string) {
        const uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId + '/persons/' + personId;
        const headers = new HttpHeaders(this.headersJson());
        const body = {'name': personDisplayName, 'userData': additionalPersonData};
        return this.http.patch(uri, body, {headers: headers});
    }

    findPersons(personGroupId: string) {
        const uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId + '/persons?start=&top=';
        const headers = new HttpHeaders(this.headersJson());
        return this.http.get(uri, {headers: headers});
    }

    findPerson(personGroupId: string, personId: string) {
        const uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId + '/persons/' + personId;
        const headers = new HttpHeaders(this.headersJson());
        return this.http.get(uri, {headers: headers});
    }

     // targetFace=left,top,width,height
    addPersonFace(personGroupId: string, personId: string, blobData, targetFace?: string) {
        let uri = environment.azure.cognitiveServices.personGroupsUrl + '/' + personGroupId + '/persons/' + personId + '/persistedFaces';
        if (targetFace !== undefined) {
            uri = uri + '?targetFace=' + targetFace;
        }
        const headers = new HttpHeaders(this.headersOctetStream());
        return this.http.post(uri, blobData, {headers: headers});
    }

    detectFaces(blob) {
        const uri = environment.azure.cognitiveServices.faceDetectUrl;
        const headers = new HttpHeaders(this.headersOctetStream());
        // const params = new HttpParams().set('returnFaceId', 'true').set('returnFaceAttributes', 'age,gender,emotion');
        const params = new HttpParams()
            .set('returnFaceId', 'true')
            .set('recognitionModel', 'recognition_02')
            .set('returnFaceAttributes', 'emotion');
        return this.http.post(uri, blob, {headers: headers, params: params});
    }

    identifyFaces(personGroupId: string, faceIds: string[]) {
        const uri = environment.azure.cognitiveServices.faceIdentifyUrl;
        const headers = new HttpHeaders(this.headersJson());
        const body = {faceIds: faceIds, personGroupId: personGroupId};
        return this.http.post(uri, body, {headers: headers});
    }

    detectCelebrities(blob) {
        const uri  = environment.azure.cognitiveServices.analyzeVisionUrl;
        const headers = new HttpHeaders(this.headersOctetStream());
        const params = new HttpParams().set('visualFeatures', 'Faces').set('details', 'Celebrities');
        return this.http.post(uri, blob, {headers: headers, params: params});
    }

}

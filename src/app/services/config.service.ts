import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AsyncSubject } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({ providedIn: 'root' })
export class ConfigService {

    private azCognitiveServiceKey: string;
    private subject = new AsyncSubject<ConfigService>();

    constructor(private http: HttpClient) {
        this.http.get(`${environment.config.url}`).subscribe(value => {

            this.azCognitiveServiceKey = value['cognitiveServiceApiKey'];
            this.subject.next(this);
            this.subject.complete();
        }, error => {
            this.subject.error(error);
        });
    }

    isConfigInitialized(): AsyncSubject<ConfigService> {
        return this.subject;
    }

    getAzCognitiveServiceKey(): string {
        return this.azCognitiveServiceKey;
    }

}

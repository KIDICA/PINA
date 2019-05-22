import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {AppRouteModule} from './app.routing';

// Views
import {PinaHeaderComponent} from './core/components';
import {RecognitionEmotionComponent} from './views/recognition-emotion';
import {RecognitionPersonComponent} from './views/recognition-person';
import {LoginComponent} from './views/login';
import {TrainingComponent} from './views/training';
import {IntroductionComponent} from './views/introduction';
import {HighscoreComponent} from './views/highscore';
import {ConfigurationComponent} from './views/config';

import {CustomAdalGuard} from '@app/core/guards/customAdal.guard';
import {ConfigService, CustomAdalService} from '@app/services';
import {CustomAdalInterceptor} from '@app/core/interceptor/customAdal.interceptor';
import {NgxSpinnerModule} from 'ngx-spinner';
import {PinaAlertModule} from '@app/core/modules';

import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateMessageFormatCompiler} from 'ngx-translate-messageformat-compiler';
import {GaugesModule} from 'ng-canvas-gauges';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    NgxSpinnerModule,
    PinaAlertModule,
    ReactiveFormsModule,
    FormsModule,
    GaugesModule,
    TranslateModule.forRoot({
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler
      },
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    AppRouteModule
  ],
  declarations: [
    AppComponent,
    PinaHeaderComponent,
    RecognitionEmotionComponent,
    RecognitionPersonComponent,
    IntroductionComponent,
    ConfigurationComponent,
    LoginComponent,
    TrainingComponent,
    HighscoreComponent
  ],
  providers: [
    CustomAdalService,
    CustomAdalGuard,
    ConfigService,
    {provide: HTTP_INTERCEPTORS, useClass: CustomAdalInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/');
}

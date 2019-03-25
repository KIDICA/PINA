import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {AppRouteModule} from './app.routing';

import {PinaFooterComponent, PinaHeaderComponent, PersonDataComponent, SimpleDialogComponent} from './core/components';
import {HomeComponent} from './views/home';
import {LoginComponent} from './views/login';
import {TrainingComponent} from './views/training';

import {CustomAdalGuard} from '@app/core/guards/customAdal.guard';
import {ConfigService, CustomAdalService} from '@app/services';
import {CustomAdalInterceptor} from '@app/core/interceptor/customAdal.interceptor';
import {NgxSpinnerModule} from 'ngx-spinner';
import {PinaAlertModule} from '@app/core/modules';

import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import {TranslateCompiler, TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {TranslateMessageFormatCompiler} from 'ngx-translate-messageformat-compiler';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    NgxSpinnerModule,
    PinaAlertModule,
    ReactiveFormsModule,
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
    PinaFooterComponent,
    HomeComponent,
    LoginComponent,
    TrainingComponent,
    PersonDataComponent,
    SimpleDialogComponent
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

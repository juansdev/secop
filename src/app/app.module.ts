import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import * as echarts from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// Components
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HomeComponent } from './components/home/home.component';
import { SeeDataComponent } from './components/see-data/see-data.component';
import { PredictiveModelComponent, DragDropDialog, CalculateDialog, ResultDialog } from './components/predictive-model/predictive-model.component';
import { SharedModule } from './components/shared/shared.module';
import { FooterComponent } from './layouts/footer/footer.component';
import { ProgressComponent } from './layouts/progress/progress.component';
import { ExtensionPanelComponent } from './components/see-data/extension-panel/extension-panel.component';

// Directive
import { DndDirective } from './directive/dnd.directive';
import { InfoGeneralComponent } from './components/see-data/info-general/info-general.component';

// Factory function required during AOT compilation
export function httpTranslateLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SeeDataComponent,
    PredictiveModelComponent,
    CalculateDialog,
    FooterComponent,
    ResultDialog,
    DragDropDialog,
    DndDirective,
    ProgressComponent,
    ExtensionPanelComponent,
    InfoGeneralComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    }),
    SharedModule,
    NgxEchartsModule.forRoot({
      echarts
    }),
    HttpClientModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: httpTranslateLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

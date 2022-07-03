import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import * as echarts from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HomeComponent } from './components/home/home.component';
import { SeeDataComponent } from './components/see-data/see-data.component';
import { PredictiveModelComponent, DragDropDialog, CalculateDialog, ResultDialog } from './components/predictive-model/predictive-model.component';
import { SharedModule } from './components/shared/shared.module';
import { FooterComponent } from './layouts/footer/footer.component';
import { FormFieldsComponent } from './components/predictive-model/form-fields/form-fields.component';
import { ProgressComponent } from './layouts/progress/progress.component';
import { ExtensionPanelComponent } from './components/see-data/extension-panel/extension-panel.component';

// Directive
import { DndDirective } from './directive/dnd.directive';
import { InfoGeneralComponent } from './components/see-data/info-general/info-general.component';
import { ToolsDirective } from './directive/tools.directive';

@NgModule({
  declarations: [
    ToolsDirective,
    AppComponent,
    HomeComponent,
    SeeDataComponent,
    PredictiveModelComponent,
    CalculateDialog,
    FooterComponent,
    FormFieldsComponent,
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
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    SharedModule,
    NgxEchartsModule.forRoot({
      echarts
    }),
    HttpClientModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

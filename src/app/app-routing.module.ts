import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { PredictiveModelComponent } from './components/predictive-model/predictive-model.component';
import { SeeDataComponent } from './components/see-data/see-data.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'ver_datos', component: SeeDataComponent },
  { path: 'modelo_predictivo', component: PredictiveModelComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

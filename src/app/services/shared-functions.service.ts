import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { first, map, shareReplay } from 'rxjs/operators';
import { lastValueFrom, Observable } from 'rxjs';
import { CalculateDialog, ResultDialog } from '../components/predictive-model/predictive-model.component';
import { SecopLocalService } from './secop/secop-local.service';
import { TranslateService } from '@ngx-translate/core';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class SharedFunctionsService {

  constructor(public translate: TranslateService , public dialog: MatDialog, private observer: BreakpointObserver, private _secopLocalService: SecopLocalService) { }

  isHandset$: Observable<boolean> = this.observer.observe(Breakpoints.Handset)
    .pipe(first(),
      map(result => result.matches),
      shareReplay()
    );

  camelize(str: string): string {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toUpperCase() : `|${word.toUpperCase()}`;
    }).replace(/\s+/g, '').replace(/\|+/g, ' ');
  }

  getDataLocalOrRam(name_data: string): string {
    let data: any;
    if (this._secopLocalService.getErrorLoad) {
      if (name_data === 'dataByDepartmentsAndYear') {
        data = this._secopLocalService.getDataByDepartmentsAndYearRAM();
        data = Object.keys(data).length ? data : this._secopLocalService.getDataByDepartmentsAndYearLocal;
      }
      else if (name_data === 'maxValueByAddition') {
        data = this._secopLocalService.getMaxValueByAdditionRAM();
        data = Object.keys(data).length ? data : this._secopLocalService.getMaxValueByAdditionLocal;
      }
      else if (name_data = 'graphicValuesDepartmentsByYear') {
        data = this._secopLocalService.getGraphicValuesDepartmentsByYearRAM();
        data = Object.keys(data).length ? data : this._secopLocalService.getGraphicValuesDepartmentsByYearLocal;
      }
      else if (name_data = 'FieldsPredictiveModel') {
        data = this._secopLocalService.getFieldsPredictiveModelRAM();
        data = Object.keys(data).length ? data : this._secopLocalService.getFieldsPredictiveModelLocal;
      }
    }
    else {
      if (name_data === 'dataByDepartmentsAndYear') {
        data = this._secopLocalService.getDataByDepartmentsAndYearLocal;
      }
      else if (name_data === 'maxValueByAddition') {
        data = this._secopLocalService.getMaxValueByAdditionLocal;
      }
      else if (name_data === 'graphicValuesDepartmentsByYear') {
        data = this._secopLocalService.getGraphicValuesDepartmentsByYearLocal;
      }
      else if (name_data === 'FieldsPredictiveModel') {
        data = this._secopLocalService.getFieldsPredictiveModelLocal;
      }
    }
    return data;
  }

  setDataLocalOrRam(name_data: string, data: any): void {
    if (this._secopLocalService.getErrorLoad) {
      console.warn('Almacenamiento en memoria local alcanzada. Utilizando memoria RAM en su lugar.');
      if (name_data === 'dataByDepartmentsAndYear') {
        this._secopLocalService.setDataByDepartmentsAndYearRAM(JSON.stringify(data));
      }
      else if (name_data === 'maxValueByAddition') {
        this._secopLocalService.setMaxValueByAdditionRAM(JSON.stringify(data));
      }
      else if (name_data === 'graphicValuesDepartmentsByYear') {
        this._secopLocalService.setGraphicValuesDepartmentsByYearRAM(JSON.stringify(data));
      }
      else if (name_data === 'FieldsPredictiveModel') {
        this._secopLocalService.setFieldsPredictiveModelRAM(JSON.stringify(data));
      }
    }
    else {
      if (name_data === 'dataByDepartmentsAndYear') {
        try {
          this._secopLocalService.setDataByDepartmentsAndYearLocal = this._secopLocalService.setDataByDepartmentsAndYearLocal ? this._secopLocalService.setDataByDepartmentsAndYearLocal + JSON.stringify(data) : JSON.stringify(data);
        } catch (error) {
          if (error instanceof DOMException) {
            this._secopLocalService.setErrorLoad = 'error_exceded_cuota_limit';
            this._secopLocalService.setDataByDepartmentsAndYearRAM(JSON.stringify(data));
          }
          else {
            console.error(error);
          }
        }
      }
      else if (name_data === 'maxValueByAddition') {
        try {
          this._secopLocalService.setMaxValueByAdditionLocal = this._secopLocalService.setMaxValueByAdditionLocal ? this._secopLocalService.setMaxValueByAdditionLocal + JSON.stringify(data) : JSON.stringify(data);
        } catch (error) {
          if (error instanceof DOMException) {
            this._secopLocalService.setErrorLoad = 'error_exceded_cuota_limit';
            this._secopLocalService.setMaxValueByAdditionRAM(JSON.stringify(data));
          }
          else {
            console.error(error);
          }
        }
      }
      else if (name_data === 'graphicValuesDepartmentsByYear') {
        try {
          this._secopLocalService.setGraphicValuesDepartmentsByYearLocal = this._secopLocalService.setGraphicValuesDepartmentsByYearLocal ? this._secopLocalService.setGraphicValuesDepartmentsByYearLocal + JSON.stringify(data) : JSON.stringify(data);
        } catch (error) {
          if (error instanceof DOMException) {
            this._secopLocalService.setErrorLoad = 'error_exceded_cuota_limit';
            this._secopLocalService.setGraphicValuesDepartmentsByYearRAM(JSON.stringify(data));
          }
          else {
            console.error(error);
          }
        }
      }
      else if (name_data === 'FieldsPredictiveModel') {
        try {
          this._secopLocalService.setFieldsPredictiveModelLocal = this._secopLocalService.setFieldsPredictiveModelLocal ? this._secopLocalService.setFieldsPredictiveModelLocal + JSON.stringify(data) : JSON.stringify(data);
        } catch (error) {
          if (error instanceof DOMException) {
            this._secopLocalService.setErrorLoad = 'error_exceded_cuota_limit';
            this._secopLocalService.setFieldsPredictiveModelRAM(JSON.stringify(data));
          }
          else {
            console.error(error);
          }
        }
      }
    }
  }

  async showMessagePredictive(array_contract: Array<string>, message_result: string, message_results: Array<string> = [], index_contract: number = 0) {
    await lastValueFrom(this.isHandset$.pipe(map((isHandset) => {
      const dialog = this.dialog.open(ResultDialog, {
        width: isHandset ? '100%' : '75%',
        height: index_contract ? '90%' : 'auto',
        data: {
          result: message_result.replace(' contract_name', ''),
          results: message_results,
          number_forms: array_contract.length
        }
      });
      index_contract = 0;
    })));
  }

  async simulateProgressBar(dialogRef: MatDialogRef<CalculateDialog>, array_contract: Array<string>, results_prediction: Array<boolean> = [true]): Promise<void> {
    const duration = 100;
    const steps = (1 / duration) * 100;
    let result_positive: string = 'ACCORDING TO THE CHARACTERISTICS SELECTED FOR THE CONTRACT contract_name IS UNLIKELY THAT IT HAS BUDGET ADDITION';
    let result_negative: string = 'ACCORDING TO THE CHARACTERISTICS SELECTED FOR THE CONTRACT contract_name IS VERY LIKELY THAT IT HAS BUDGET ADDITION';
    const get_current_lang = await this.translate.currentLang;
    if(get_current_lang === 'es') {
      result_positive = 'SEGUN LAS CARACTERISTICAS SELECCIONADAS PARA EL CONTRATO contract_name ES MUY POCO PROBABLE QUE TENGA ADICIÓN PRESUPUESTAL';
      result_negative = 'SEGUN LAS CARACTERISTICAS SELECCIONADAS PARA EL CONTRATO contract_name ES MUY PROBABLE QUE TENGA ADICIÓN PRESUPUESTAL';
    }
    let progress_timer = 0;
    let index_contract = 0;
    let results: Array<string> = [];
    let progress: number = 0;
    let progress_class: string = '';

    const timer = setInterval(() => {
      progress_timer++;
      progress += steps;
      progress_class = `width: ${progress}%`;
      dialogRef.componentInstance.data = {
        progress: parseFloat(progress.toPrecision(4)),
        progress_class: progress_class,
        number_form: array_contract[index_contract]
      }
      const result = results_prediction[index_contract] ?
        result_negative.replace('contract_name', array_contract[index_contract]) :
        result_positive.replace('contract_name', array_contract[index_contract]);
      if (progress_timer >= duration) {
        if (index_contract != array_contract.length - 1) {
          results.push(result);
          index_contract++;
          progress_timer = 0;
          progress = 0;
          progress_class = `width: ${progress}%`;
          dialogRef.componentInstance.data = {
            progress: parseFloat(progress.toPrecision(4)),
            progress_class: progress_class,
            number_form: array_contract[index_contract]
          }
        }
        else {
          if (index_contract) {
            results.push(result);
          }
          clearInterval(timer);
          dialogRef.close();
          // Agregar resultDialog
          this.showMessagePredictive(array_contract, result, results, index_contract);
        }
      }
    });

    await lastValueFrom(dialogRef.afterClosed().pipe(map(() => {
      clearInterval(timer);
    })));
  }

}

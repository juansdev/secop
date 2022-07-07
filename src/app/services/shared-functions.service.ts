import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { first, map, shareReplay } from 'rxjs/operators';
import { lastValueFrom, Observable } from 'rxjs';
import { CalculateDialog, ResultDialog } from '../components/predictive-model/predictive-model.component';
import { SecopLocalService } from './secop/secop-local.service';
import { TranslateService } from '@ngx-translate/core';
import { SecopService } from './secop/secop.service';

export interface ValueByFields {
  [key: string]: Array<string>;
}

@Injectable({
  providedIn: 'root'
})
export class SharedFunctionsService {

  constructor(public translate: TranslateService , public dialog: MatDialog, private observer: BreakpointObserver, private _secopLocalService: SecopLocalService, private _secopService: SecopService) { }

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
    const get_current_lang = this.translate.currentLang;
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

  async loadFielsPredictiveModel(fields_predictive_model: ValueByFields): Promise<ValueByFields> {
    if(!Object.keys(fields_predictive_model).length){
      fields_predictive_model = await lastValueFrom(this._secopService.getFieldsPredictiveModel().pipe(map(async (data_fields_predictive_model: any) => {
        const values_fields_predictive_model: Array<any> = Object.values(data_fields_predictive_model);
        for (let index = 0; index < values_fields_predictive_model.length; index++) {
          let value_fields: any = values_fields_predictive_model[index];
          if(['rangoTiempos', 'rangoContratos'].includes(Object.keys(data_fields_predictive_model)[index])){
            let arr_value_fields = Array.from({length: value_fields.length}, () => {});
            value_fields.forEach((value: any) => {
              arr_value_fields[value['id']-1] = value;
            });
            value_fields = arr_value_fields;
          }
          else {
          }
          let name_field = '';
          for (let index = 0; index < value_fields.length; index++) {
            const value_field = value_fields[index];
            if(!index) {
              name_field = Object.keys(value_field).filter(key => key !== 'id')[0];
              fields_predictive_model[this.camelize(name_field)] = [];
            }
            fields_predictive_model[this.camelize(name_field)].push(value_field[name_field]);
          }
        }
        fields_predictive_model['Departamento Entidad'] = [];
        fields_predictive_model['Departamento Ejecución'] = [];
        let name_departments: any = this._secopLocalService.getDepartments ? this._secopLocalService.getDepartments.split(';').sort() : [];
        if(!name_departments.length){
          await lastValueFrom(this._secopService.getDepartments().pipe(map((data_name_departments: any)=>{
            for (const key in data_name_departments) {
              if (Object.prototype.hasOwnProperty.call(data_name_departments, key)) {
                const department = data_name_departments[key];
                name_departments.push(department.departamentoEjecucion);
              }
            }
            name_departments.sort();
            this._secopLocalService.setDepartments = name_departments;
            for (let index = 0; index < name_departments.length; index++) {
              const department = name_departments[index];
              fields_predictive_model['Departamento Entidad'].push(department);
              fields_predictive_model['Departamento Ejecución'].push(department);
            }
            this.setDataLocalOrRam('FieldsPredictiveModel', fields_predictive_model);
          })));
        }
        else {
          for (let index = 0; index < name_departments.length; index++) {
            const department = name_departments[index];
            fields_predictive_model['Departamento Entidad'].push(department);
            fields_predictive_model['Departamento Ejecución'].push(department);
          }
          this.setDataLocalOrRam('FieldsPredictiveModel', fields_predictive_model);
        }
        return fields_predictive_model;
      })));
    }
    return fields_predictive_model;
  }

  predictiveModelTranslationValue(data: any, field_value: string = '', is_title: boolean = true): string {
    if(typeof data === 'object') {
      if(is_title){
        return data['title'];
      }
      else{
        const number = field_value.match(/NIVEL \d+$/g)?.[0];
        let range: any = field_value.match(/(años|año|meses|mes|dias)/g);
        if(!range){
          range = [];
        }
        field_value.match(/ hasta /g) ? range?.push(field_value.match(/ hasta /g)?.[0]) : false;
        if(number){
          let temp_field_value = field_value.replace(number, '');
          return data['fields'][temp_field_value+'NIVEL']+' '+(number.replace('NIVEL',''));
        }
        else if(range.length) {
          let field_value_translated = field_value;
          for (let index = 0; index < range.length; index++) {
            let range_selected = range[index];
            console.log(field_value_translated);
            console.log(range_selected.replace(/\s/g, ''));
            console.log(data['fields']);
            console.log(data['fields'][range_selected.replace(/\s/g, '')]);
            field_value_translated = field_value_translated.replace(range_selected.replace(/\s/g, ''), data['fields'][range_selected.replace(/\s/g, '')]);
          }
          return field_value_translated;
        }
        else {
          if(data['fields'][field_value]){
            return data['fields'][field_value];
          }
          return field_value;
        }
      }
    }
    if(!is_title){
      return field_value;
    }
    return data;
  }

}

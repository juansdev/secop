import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { first, map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CalculateDialog, ResultDialog } from '../components/predictive-model/predictive-model.component';
import { SecopLocalService } from './secop/secop-local.service';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class SharedFunctionsService {

  constructor(public dialog: MatDialog, private observer: BreakpointObserver, private _secopLocalService: SecopLocalService) { }

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
      else if(name_data === 'maxValueByAddition') {
        data = this._secopLocalService.getMaxValueByAdditionRAM();
        data = Object.keys(data).length ? data : this._secopLocalService.getMaxValueByAdditionLocal;
      }
      else if(name_data = 'graphicValuesDepartmentsByYear') {
        data = this._secopLocalService.getGraphicValuesDepartmentsByYearRAM();
        data = Object.keys(data).length ? data : this._secopLocalService.getGraphicValuesDepartmentsByYearLocal;
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
    }
    return data;
  }

  setDataLocalOrRam(name_data: string, data: any): void {
    if (this._secopLocalService.getErrorLoad) {
      console.log('error_exceded_cuota_limit');
      if (name_data === 'dataByDepartmentsAndYear') {
        this._secopLocalService.setDataByDepartmentsAndYearRAM(JSON.stringify(data));
      }
      else if (name_data === 'maxValueByAddition') {
        this._secopLocalService.setMaxValueByAdditionRAM(JSON.stringify(data));
      }
      else if (name_data === 'graphicValuesDepartmentsByYear') {
        this._secopLocalService.setGraphicValuesDepartmentsByYearRAM(JSON.stringify(data));
      }
    }
    else {
      if (name_data === 'dataByDepartmentsAndYear') {
        try {
          this._secopLocalService.setDataByDepartmentsAndYearLocal = this._secopLocalService.setDataByDepartmentsAndYearLocal ? this._secopLocalService.setDataByDepartmentsAndYearLocal+JSON.stringify(data) : JSON.stringify(data);
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
          this._secopLocalService.setMaxValueByAdditionLocal = this._secopLocalService.setMaxValueByAdditionLocal ? this._secopLocalService.setMaxValueByAdditionLocal+JSON.stringify(data) : JSON.stringify(data);
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
          this._secopLocalService.setGraphicValuesDepartmentsByYearLocal = this._secopLocalService.setGraphicValuesDepartmentsByYearLocal ? this._secopLocalService.setGraphicValuesDepartmentsByYearLocal+JSON.stringify(data) : JSON.stringify(data);
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
    }
  }

  simulateProgressBar(dialogRef: MatDialogRef<CalculateDialog>, arrayContract: Array<string>): void {
    const duration = 100;
    const steps = (1 / duration) * 100;
    const result: string = 'EL CONTRATO contract_name TIENE UNA PROBABILIDAD MUY boolean_probability DE QUE SE AGREGUE ADICIÓN PRESUPUESTAL';
    let progress_timer = 0;
    let index_contract = 0;
    let results: Array<string> = [];
    let progress: number = 0;
    let progress_class: string = '';

    var timer = setInterval(() => {
      progress_timer++;
      progress += steps;
      progress_class = `width: ${progress}%`;
      dialogRef.componentInstance.data = {
        progress: parseFloat(progress.toPrecision(4)),
        progress_class: progress_class,
        number_form: arrayContract[index_contract]
      }
      if (progress_timer >= duration) {
        if (index_contract != arrayContract.length - 1) {
          results.push(result.replace('contract_name', arrayContract[index_contract]).replace('boolean_probability', 'MENOR'));
          index_contract++;
          progress_timer = 0;
          progress = 0;
          progress_class = `width: ${progress}%`;
          dialogRef.componentInstance.data = {
            progress: parseFloat(progress.toPrecision(4)),
            progress_class: progress_class,
            number_form: arrayContract[index_contract]
          }
        }
        else {
          if (index_contract) {
            results.push(result.replace('contract_name', arrayContract[index_contract]).replace('boolean_probability', 'MENOR'));
          }
          clearInterval(timer);
          dialogRef.close();
          const suscribeIsHandset = this.isHandset$.subscribe((isHandset) => {
            const dialog = this.dialog.open(ResultDialog, {
              width: isHandset ? '100%' : '75%',
              height: index_contract ? '90%' : 'auto',
              data: {
                result: result.replace(' contract_name', '').replace('boolean_probability', 'MENOR'),
                results: results,
                number_forms: arrayContract.length
              }
            });
            const id_dialog = /[0-9]/g.exec(dialog.id)?.[0];
            if (isHandset) {
              $('#cdk-overlay-' + id_dialog).css("max-width", "initial");
              $('#cdk-overlay-' + id_dialog).addClass('overflow-auto', 'max-width-dialog');
            }
          });
          index_contract = 0;
        }
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      clearInterval(timer);
    });
  }

}

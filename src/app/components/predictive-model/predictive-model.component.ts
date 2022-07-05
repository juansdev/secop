import { HttpEventType } from '@angular/common/http';
import { Component, Inject, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { lastValueFrom, map } from 'rxjs';
import { SecopLocalService } from 'src/app/services/secop/secop-local.service';
import { SecopService } from 'src/app/services/secop/secop.service';
import { SharedFunctionsService } from '../../services/shared-functions.service';

interface ValueByFields {
  [key: string]: Array<string>;
}

export interface calculateData {
  progress: number;
  progress_class: string;
  number_form: string;
}

export interface calculateData {
  progress: number;
  progress_class: string;
  number_form: string;
}

export interface dialogResultData {
  result: string;
  results: Array<string>;
  number_forms: number;
}

@Component({
  selector: 'app-predictive-model',
  templateUrl: './predictive-model.component.html',
  styleUrls: ['./predictive-model.component.css']
})
export class PredictiveModelComponent implements OnInit {

  public fields_prectivie_model: ValueByFields = {};
  public countContract: string = '001';
  public arrayContract: Array<string> = [this.countContract];
  public form: FormGroup = new FormGroup({});

  constructor(private dialog: MatDialog, private _secopService: SecopService, private _secopLocalService: SecopLocalService, public sharedFunctionsService: SharedFunctionsService, private fb: FormBuilder) {
    this.fields_prectivie_model = this.sharedFunctionsService.getDataLocalOrRam('FieldsPredictiveModel') ? JSON.parse(this.sharedFunctionsService.getDataLocalOrRam('FieldsPredictiveModel')) : {};
  }

  async ngOnInit(): Promise<void> {
    if(!Object.keys(this.fields_prectivie_model).length){
      await lastValueFrom(this._secopService.getFieldsPredictiveModel().pipe(map(async (data_fields_predictive_model: any) => {
        const fields_predictive_model = Object.values(data_fields_predictive_model);
        for (let index = 0; index < fields_predictive_model.length; index++) {
          const value_fields: any = fields_predictive_model[index];
          let name_field = '';
          for (let index = 0; index < value_fields.length; index++) {
            const value_field = value_fields[index];
            if(!index) {
              name_field = Object.keys(value_field).filter(key => key !== 'id')[0];
              this.fields_prectivie_model[this.sharedFunctionsService.camelize(name_field)] = [];
            }
            this.fields_prectivie_model[this.sharedFunctionsService.camelize(name_field)].push(value_field[name_field]);
          }
        }
        this.fields_prectivie_model['Departamento Entidad'] = [];
        this.fields_prectivie_model['Departamento Ejecución'] = [];
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
              this.fields_prectivie_model['Departamento Entidad'].push(department);
              this.fields_prectivie_model['Departamento Ejecución'].push(department);
            }
            this.sharedFunctionsService.setDataLocalOrRam('FieldsPredictiveModel', this.fields_prectivie_model);
          })));
        }
        else {
          for (let index = 0; index < name_departments.length; index++) {
            const department = name_departments[index];
            this.fields_prectivie_model['Departamento Entidad'].push(department);
            this.fields_prectivie_model['Departamento Ejecución'].push(department);
          }
          this.sharedFunctionsService.setDataLocalOrRam('FieldsPredictiveModel', this.fields_prectivie_model);
        }
      })));
    }
  }

  ngDoCheck()	{
    const amount_controlers = (Object.keys(this.form.controls).length/Object.keys(this.fields_prectivie_model).length);
    if(amount_controlers !== this.arrayContract.length || !Object.keys(this.form.controls).length){
      const fields_form: any = this.form.controls;
      for (let index = 0; index < this.arrayContract.length; index++) {
        const contract = this.arrayContract[index];
        for (let index = 0; index < Object.keys(this.fields_prectivie_model).length; index++) {
          const name_field = Object.keys(this.fields_prectivie_model)[index];
          fields_form[contract+'_'+name_field] = [fields_form[contract+'_'+name_field] ? fields_form[contract+'_'+name_field].value : null, [Validators.required]]
        }
      }
      this.form = this.fb.group(fields_form);
    }
  }

  async onSubmit(form: any): Promise<void> {
    const form_values = form.value;
    let numeric_keys: any = Object.keys(form_values);
    numeric_keys.forEach((e: string, i: number)=>{
      numeric_keys[i] = e.match(/^[0-9]+_/g)?.[0];
    });
    numeric_keys = [...new Set(numeric_keys)];
    const form_values_by_numeric: any = [];
    for (let index_numeric_key = 0; index_numeric_key < numeric_keys.length; index_numeric_key++) {
      const numeric_key = numeric_keys[index_numeric_key];
      form_values_by_numeric.push({});
      for (let index = 0; index < Object.keys(form_values).length; index++) {
        const key = Object.keys(form_values)[index];
        if(key.match(numeric_key)?.[0]){
          form_values_by_numeric[index_numeric_key][key.replace(numeric_key,'')] = form_values[key];
        }
      }
    }
    const results_prediction: Array<boolean> = [];
    for (let index = 0; index < form_values_by_numeric.length; index++) {
      const form_values_by_numeric_contract = form_values_by_numeric[index];
      let new_form_values = form_values_by_numeric_contract;
      await lastValueFrom(this._secopService.postFormPredictiveModel(new_form_values)).then((result: any)=> {
        results_prediction.push(!!parseInt(result['data']));
      }
      ).catch((error: any)=>{
        console.error(error);
      });
    }
    if(results_prediction.length) {
      this.openProbabilityGenerator(results_prediction);
    }
  }

  private number_contract(number: string): string {
    return number.length <= 2 ? (number.length == 1 ? '00' + number : '0' + number) : number;
  }

  clickCountContract(): void {
    const result: string = (parseInt(this.countContract) + 1).toString();
    this.countContract = this.number_contract(result);
    this.arrayContract.push(this.countContract);
  }

  openProbabilityGenerator(results_prediction: Array<boolean> = [true]): void {
    const dialogRef: MatDialogRef<CalculateDialog> = this.dialog.open(CalculateDialog, {
      width: this.sharedFunctionsService.isHandset$ ? '100%' : '75%',
      data: {
        progress: 0,
        progress_class: 'width: 0%',
        number_form: this.arrayContract[0]
      }
    });
    this.sharedFunctionsService.simulateProgressBar(dialogRef, this.arrayContract, results_prediction);
  }

  openDragDrop(): void {
    this.dialog.open(DragDropDialog, {
      width: this.sharedFunctionsService.isHandset$ ? '100%' : '75%'
    });
  }

}

@Component({
  selector: 'drag-drop-dialog',
  templateUrl: 'dialog/drag-drop-dialog.html',
  styleUrls: ['./predictive-model.component.css']
})
export class DragDropDialog implements OnInit {

  @ViewChild("fileDropRef", { static: false }) fileDropEl: any = null;
  file: any;
  file_loaded: boolean = false;

  constructor(
    private dialogRef: MatDialogRef<DragDropDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private sharedFunctionsService: SharedFunctionsService,
    private _secopService: SecopService
  ) { }

  ngOnInit(): void {
    const input = document.getElementById('fileDropRef');

    input?.addEventListener('change', event => {
      const result = (event.target as HTMLInputElement).files;
      this.fileBrowseHandler(result);
    });
  }

  /**
   * on file drop handler
   */
  onFileDropped($event: any) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files: any) {
    this.prepareFilesList(files);
  }

  deleteFile() {
    if (this.file.progress < 100) {
      return;
    }
    this.file = '';
  }

  /**
   * Simulate the upload process
   */
   uploadFilesSimulator() {
    setTimeout(() => {
      const progressInterval = setInterval(() => {
        if (this.file.progress >= 100) {
          clearInterval(progressInterval);
          this.file_loaded = true;
        } else {
          this.file.progress += 25;
        }
      }, 200);
    }, 1000);
  }

  /**
   * Update data this.file with file
   * @param file (File)
   */
  async prepareFilesList(file: any) {
    this.file_loaded = false;
    file[0].progress = 0;
    this.file = file[0];
    this.fileDropEl.nativeElement.value = "";
    this.uploadFilesSimulator();
  }

  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: any, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  async onSubmit() {
    await lastValueFrom(this._secopService.postFileExcel(this.file)).then((result: any)=> {
        const contracts = result['body']['contracts'];
        this.openProbabilityGenerator(contracts);
      }
    ).catch((error: any)=>{
      console.error(error);
      this.sharedFunctionsService.showMessagePredictive(['Error'], error['error']['errorMessage']);
    });
  }

  openProbabilityGenerator(excel_results_prediction = {}): void {
    // Crear nombre a las filas de excel que corresponda a un contrato
    let contracts_excel: Array<string> = [];
    Object.keys(excel_results_prediction).forEach((n_fila, _) => contracts_excel.push('DE LA FILA N. '+n_fila));
    let results_prediction: Array<boolean> = [];
    Object.values(excel_results_prediction).forEach((result: any)=> {
      results_prediction.push(!!parseInt(result));
    });
    const dialogRef: MatDialogRef<CalculateDialog> = this.dialog.open(CalculateDialog, {
      width: this.sharedFunctionsService.isHandset$ ? '100%' : '75%',
      data: {
        progress: 0,
        progress_class: 'width: 0%',
        number_form: contracts_excel
      }
    });
    this.sharedFunctionsService.simulateProgressBar(dialogRef, contracts_excel, results_prediction);
  }

}

@Component({
  selector: 'calculate-dialog',
  templateUrl: 'dialog/calculate-dialog.html',
  styleUrls: ['./predictive-model.component.css']
})
export class CalculateDialog {
  constructor(
    private dialogRef: MatDialogRef<CalculateDialog>,
    @Inject(MAT_DIALOG_DATA) public data: calculateData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'result-dialog',
  templateUrl: 'dialog/result-dialog.html',
  styleUrls: ['./predictive-model.component.css']
})
export class ResultDialog {
  constructor(
    private dialogRef: MatDialogRef<ResultDialog>,
    @Inject(MAT_DIALOG_DATA) public data: dialogResultData,
  ) { }

  onNoClick(): void {
    this.dialogRef.close();
  }
}

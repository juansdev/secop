import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
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

  public translate_fields_predictive_model: any = {
    "Departamento Ejecución": "Execution Department",
    "Departamento Entidad": "Department Entity",
    "Modalidad De Contratacion": {
      "title": "Modality of contracting",
      "fields": {
        "Concurso de diseño Arquitectónico": "Architectural Design Contest",
        "Selección Abreviada de Menor Cuantía (Ley 1150 de 2007)": "Abbreviated Selection of Minor Amount (Law 1150 of 2007)",
        "Selección Abreviada del literal h del numeral 2 del artículo 2 de la Ley 1150 de 2007": "Abbreviated selection of literal h of numeral 2 of article 2 of Law 1150 of 2007",
        "Contratación Directa (Ley 1150 de 2007)": "Direct Contracting (Law 1150 of 2007)",
        "Selección Abreviada servicios de Salud": "Abbreviated Selection Health Services",
        "Otras Formas de Contratación Directa": "Other Forms of Direct Hiring",
        "Asociación Público Privada": "Public Private Partnership",
        "Licitación obra pública": "Public works tender",
        "Licitación Pública": "Public tender",
        "Contratos y convenios con más de dos partes": "Contracts and agreements with more than two parties",
        "Contratación Mínima Cuantía": "Minimum Amount Hiring",
        "Concurso de Méritos con Lista Corta": "Merit Contest with Short List",
        "Régimen Especial": "Special regime",
        "Concurso de Méritos Abierto": "Open Merit Contest",
        "Subasta": "Auction"
      }
    },
    "Objeto A Contratar": {
      "title":"Object to Hire",
      "fields": {
        "Equipo Médico, Accesorios y Suministros": "Medical Equipment, Accessories and Supplies",
        "Productos para Relojería, Joyería y Piedras Preciosas": "Products for Watches, Jewelry and Precious Stones",
        "Artículos Domésticos, Suministros y Productos Electrónicos de Consumo": "Household Items, Supplies and Consumer Electronics",
        "Servicios de Minería, Petróleo y Gas": "Mining, Oil and Gas Services",
        "Material Vivo Vegetal y Animal, Accesorios y Suministros": "Plant and Animal Live Material, Accessories and Supplies",
        "Componentes y Suministros de Manufactura": "Components and Manufacturing Supplies",
        "Servicios Políticos y de Asuntos Cívicos": "Political and Civic Affairs Services",
        "Servicios Públicos y Servicios Relacionados con el Sector Público": "Public Services and Services Related to the Public Sector",
        "Servicios Editoriales, de Diseño, de Artes Graficas y Bellas Artes": "Editorial, Design, Graphic Arts and Fine Arts Services",
        "Servicios Basados en Ingeniería, Investigación y Tecnología": "Services Based on Engineering, Research and Technology",
        "Servicios Personales y Domésticos": "Personal and Domestic Services",
        "Servicios de Edificación, Construcción de Instalaciones y Mantenimiento": "Building Services, Facilities Construction and Maintenance",
        "Medicamentos y Productos Farmacéuticos": "Medicines and Pharmaceutical Products",
        "Equipos, Suministros y Accesorios para Deportes y Recreación": "Equipment, Supplies and Accessories for Sports and Recreation",
        "Maquinaria y Accesorios para Generación y Distribución de Energía": "Machinery and Accessories for Power Generation and Distribution",
        "Maquinaria, Accesorios y Suministros para Manejo, Acondicionamiento y Almacenamiento de Materiales": "Machinery, Accessories and Supplies for Handling, Conditioning and Storage of Materials",
        "Materiales Combustibles, Aditivos para Combustibles, Lubricantes y Anticorrosivos": "Fuel Materials, Fuel Additives, Lubricants and Anticorrosives",
        "Maquinaria y Accesorios para Agricultura, Pesca, Silvicultura y Fauna": "Machinery and Accessories for Agriculture, Fishing, Forestry and Fauna",
        "Servicios de Viajes, Alimentación, Alojamiento y Entretenimiento": "Travel, Food, Accommodation and Entertainment Services",
        "Ropa, Maletas y Productos de Aseo Personal": "Clothes, Suitcases and Personal Care Products",
        "Servicios de Limpieza, Descontaminación y Tratamiento de Residuos": "Cleaning, Decontamination and Waste Treatment Services",
        "Servicios de Producción Industrial y Manufactura": "Industrial Production and Manufacturing Services",
        "Equipos y Suministros de Defensa, Orden Publico, Proteccion, Vigilancia y Seguridad": "Equipment and Supplies for Defense, Public Order, Protection, Surveillance and Security",
        "Difusión de Tecnologías de Información y Telecomunicaciones": "Diffusion of Information Technologies and Telecommunications",
        "Servicios Financieros y de Seguros": "Financial and Insurance Services",
        "Servicios de Defensa Nacional, Orden Publico, Seguridad y Vigilancia": "National Defense Services, Public Order, Security and Surveillance",
        "Publicaciones Impresas, Publicaciones Electronicas y Accesorios": "Printed Publications, Electronic Publications and Accessories",
        "Herramientas y Maquinaria General": "Tools and General Machinery",
        "Servicios Educativos y de Formación": "Educational and Training Services",
        "Alimentos, Bebidas y Tabaco": "Food, Drinks and Tobacco",
        "Equipos y Suministros para Limpieza": "Equipment and Supplies for Cleaning",
        "Materiales de Resina, Colofonia, Caucho, Espuma, Película y Elastómericos": "Resin, Rosin, Rubber, Foam, Film and Elastomeric Materials",
        "Instrumentos Musicales, Juegos, Artes, Artesanías y Equipo educativo, Materiales, Accesorios y Suministros": "Musical Instruments, Games, Arts, Crafts and Educational Equipment, Materials, Accessories and Supplies",
        "Componentes y Equipos para Distribución y Sistemas de Acondicionamiento": "Components and Equipment for Distribution and Conditioning Systems",
        "Componentes y Suministros Electrónicos": "Electronic Components and Supplies",
        "Servicios de Transporte, Almacenaje y Correo": "Transport, Storage and Mail Services",
        "Maquinaria y Accesorios para Construcción y Edificación": "Machinery and Accessories for Construction and Building",
        "Equipos de Oficina, Accesorios y Suministros": "Office Equipment, Accessories and Supplies",
        "Terrenos, Edificios, Estructuras y Vías": "Land, Buildings, Structures and Roads",
        "Servicios de Salud": "Health services",
        "Componentes, Accesorios y Suministros de Sistemas Eléctricos e Iluminación": "Components, Accessories and Supplies for Electrical Systems and Lighting",
        "Vehículos Comerciales, Militares y Particulares, Accesorios y Componentes": "Commercial, Military and Private Vehicles, Accessories and Components",
        "Maquinaria, Equipo y Suministros para la Industria de Servicios": "Machinery, Equipment and Supplies for the Service Industry",
        "Servicios de Gestion, Servicios Profesionales de Empresa y Servicios Administrativos": "Management Services, Professional Business Services and Administrative Services",
        "Componentes y Suministros para Estructuras, Edificación, Construcción y Obras Civiles": "Components and Supplies for Structures, Building, Construction and Civil Works",
        "Equipos y Suministros de Laboratorio, de Medición, de Observación y de Pruebas": "Laboratory, Measurement, Observation and Testing Equipment and Supplies",
        "Organizaciones y Clubes": "Organizations and Clubs",
        "Material Químico incluyendo Bioquímicos y Materiales de Gas": "Chemical Material including Biochemical and Gas Materials",
        "Servicios de Contratacion Agrícola, Pesquera, Forestal y de Fauna": "Agricultural, Fishing, Forestry and Fauna Contracting Services",
        "Servicios Medioambientales": "Environmental Services",
        "Maquinaria y Accesorios para Manufactura y Procesamiento Industrial": "Machinery and Accessories for Manufacturing and Industrial Processing",
        "Equipos y Suministros para Impresión, Fotografia y Audiovisuales": "Equipment and Supplies for Printing, Photography and Audiovisuals",
        "Materiales y Productos de Papel": "Materials and Paper Products",
        "Material Mineral, Textil y  Vegetal y Animal No Comestible": "Non-edible Mineral, Textile, Vegetable and Animal Material",
        "Maquinaria y Accesorios de Minería y Perforación de Pozos": "Machinery and Accessories for Mining and Well Drilling",
        "Muebles, Mobiliario y Decoración": "Furniture, Furnishings and Decoration"
      }
    },
    "Orden Entidad": {
      "title": "Order Entity",
      "fields": {
        "NACIONAL CENTRALIZADO": "NATIONAL CENTRALIZED",
        "TERRITORIAL DEPARTAMENTAL DESCENTRALIZADO": "DECENTRALIZED DEPARTMENTAL TERRITORIAL",
        "AREA METROPOLITANA": "METROPOLITAN AREA",
        "TERRITORIAL DISTRITAL MUNICIPAL NIVEL": "TERRITORIAL DISTRICT MUNICIPAL LEVEL",
        "TERRITORIAL DEPARTAMENTAL CENTRALIZADO": "CENTRALIZED DEPARTMENTAL TERRITORIAL",
        "DISTRITO CAPITAL": "CAPITAL DISTRICT",
        "NACIONAL DESCENTRALIZADO": "DECENTRALIZED NATIONAL"
      }
    },
    "Rango Tiempo Contratos": {
      "title": "Time Range Contracts",
      "fields": {
        "hasta": "until"
      }
    },
    "Rango Val Contratos": {
      "title": "Range Values Contracts",
      "fields": {
        "hasta": "until"
      }
    }
  };

  public fields_predictive_model: ValueByFields = {};
  public countContract: string = '001';
  public arrayContract: Array<string> = [this.countContract];
  public form: FormGroup = new FormGroup({});

  constructor(public translate: TranslateService, private dialog: MatDialog, private _secopService: SecopService, private _secopLocalService: SecopLocalService, public sharedFunctionsService: SharedFunctionsService, private fb: FormBuilder) {
    this.fields_predictive_model = this.sharedFunctionsService.getDataLocalOrRam('FieldsPredictiveModel') ? JSON.parse(this.sharedFunctionsService.getDataLocalOrRam('FieldsPredictiveModel')) : {};
  }

  async ngOnInit(): Promise<void> {
    if(!Object.keys(this.fields_predictive_model).length){
      await lastValueFrom(this._secopService.getFieldsPredictiveModel().pipe(map(async (data_fields_predictive_model: any) => {
        const fields_predictive_model = Object.values(data_fields_predictive_model);
        for (let index = 0; index < fields_predictive_model.length; index++) {
          const value_fields: any = fields_predictive_model[index];
          let name_field = '';
          for (let index = 0; index < value_fields.length; index++) {
            const value_field = value_fields[index];
            if(!index) {
              name_field = Object.keys(value_field).filter(key => key !== 'id')[0];
              this.fields_predictive_model[this.sharedFunctionsService.camelize(name_field)] = [];
            }
            this.fields_predictive_model[this.sharedFunctionsService.camelize(name_field)].push(value_field[name_field]);
          }
        }
        this.fields_predictive_model['Departamento Entidad'] = [];
        this.fields_predictive_model['Departamento Ejecución'] = [];
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
              this.fields_predictive_model['Departamento Entidad'].push(department);
              this.fields_predictive_model['Departamento Ejecución'].push(department);
            }
            this.sharedFunctionsService.setDataLocalOrRam('FieldsPredictiveModel', this.fields_predictive_model);
          })));
        }
        else {
          for (let index = 0; index < name_departments.length; index++) {
            const department = name_departments[index];
            this.fields_predictive_model['Departamento Entidad'].push(department);
            this.fields_predictive_model['Departamento Ejecución'].push(department);
          }
          this.sharedFunctionsService.setDataLocalOrRam('FieldsPredictiveModel', this.fields_predictive_model);
        }
      })));
    }
  }

  ngDoCheck()	{
    const amount_controlers = (Object.keys(this.form.controls).length/Object.keys(this.fields_predictive_model).length);
    if(amount_controlers !== this.arrayContract.length || !Object.keys(this.form.controls).length){
      const fields_form: any = this.form.controls;
      for (let index = 0; index < this.arrayContract.length; index++) {
        const contract = this.arrayContract[index];
        for (let index = 0; index < Object.keys(this.fields_predictive_model).length; index++) {
          const name_field = Object.keys(this.fields_predictive_model)[index];
          fields_form[contract+'_'+name_field] = [fields_form[contract+'_'+name_field] ? fields_form[contract+'_'+name_field].value : null, [Validators.required]]
        }
      }
      this.form = this.fb.group(fields_form);
    }
  }

  translationValue(data: any, field_value: string = '', is_title: boolean = true): string {
    if(typeof data === 'object') {
      if(is_title){
        return data['title'];
      }
      else{
        const number = field_value.match(/NIVEL \d+$/g)?.[0];
        const range = field_value.match(/ hasta /g)?.[0];
        if(number){
          let temp_field_value = field_value.replace(number, '');
          return data['fields'][temp_field_value+'NIVEL']+' '+(number.replace('NIVEL',''));
        }
        else if(range) {
          return field_value.replace(range, ` ${data['fields'][range.replace(/\s/g, '')]} `);
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

import { Component, Input, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import { registerMap, init } from "echarts";
import { SecopService } from "src/app/services/secop/secop.service";
import { SecopLocalService } from 'src/app/services/secop/secop-local.service';

import {
  TitleComponentOption,
  ToolboxComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
  GeoComponentOption
} from 'echarts/components';
import { MapSeriesOption } from 'echarts/charts';
import { SharedFunctionsService } from 'src/app/services/shared-functions.service';
import { lastValueFrom, map } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

type EChartsOption = echarts.ComposeOption<
  | TitleComponentOption
  | ToolboxComponentOption
  | TooltipComponentOption
  | VisualMapComponentOption
  | GeoComponentOption
  | MapSeriesOption
>;

@Component({
  selector: 'app-see-data',
  templateUrl: './see-data.component.html',
  styleUrls: ['./see-data.component.css']
})
export class SeeDataComponent implements OnInit {

  @ViewChild('infoGeneral', { static: false }) infoGeneral: any;
  @ViewChild('loadDate', { static: false }) loadDate: any;

  public department_selected: string = '';
  public myMap: any;
  public name_departments: Array<string> = [];
  public array_years: Array<string> = ['2017', '2018', '2019', '2020', '2021'];
  public year_selected: string = '';
  public loaded_date: any = {};

  constructor(public translate: TranslateService, private _secopService: SecopService, private _secopLocalService: SecopLocalService, private _sharedFunctionsService: SharedFunctionsService) {
    lastValueFrom(translate.onLangChange.pipe(map((lang:any)=>{
      const current_lang = lang.lang;
      const current_options_map = this.myMap.getOption();
      current_options_map['title'][0]['text'] = current_lang==='en' || !current_lang ? 'Map of Colombia (2022)' : 'Mapa de Colombia (2022)';
      current_options_map['title'][0]['subtext'] = current_lang==='en' || !current_lang ? 'Through the interactive map,\n you can view the information related to the\n number of contracts with addition, filter them by\n year and departments.' : 'Mediante el mapa interactivo,\n puede visualizar la información relacionada a la cantidad\n de contratos con adición, filtrarlos\n por año y departamentos.';
      current_options_map['series'][0]['name'] = current_lang==='en' || !current_lang ? 'Contracts with Addendum' : 'Contratos con Adición';
      current_options_map['visualMap'][0]['text'][0] = current_lang==='en' || !current_lang ? 'High' : 'Alto';
      current_options_map['visualMap'][0]['text'][1] = current_lang==='en' || !current_lang ? 'Low' : 'Bajo';
      this.myMap.setOption(current_options_map);
    })));
  }

  async ngOnInit(): Promise<void> {
    await this.mapFunction();
    const dataByDepartmentsAndYear = this._sharedFunctionsService.getDataLocalOrRam('dataByDepartmentsAndYear') ? JSON.parse(this._sharedFunctionsService.getDataLocalOrRam('dataByDepartmentsAndYear')) : {};
    if(dataByDepartmentsAndYear){
      const array_years_loaded: any = this.array_years.filter((year: string) => Object.keys(dataByDepartmentsAndYear).includes(year));
      array_years_loaded.forEach((year_loaded: number) => {
        if(this.name_departments.length === Object.keys(dataByDepartmentsAndYear[year_loaded]).length){
          this.loaded_date[year_loaded] = true;
        }
      });
    }
    this.array_years.forEach((year: any)=> {
      if(!this.loaded_date[year]) {
        this.loaded_date[year] = false;
      }
    });
    if(Object.values(this.loaded_date).every(Boolean)) {
      this.loaded_date['Todos'] = true;
    }
    else {
      this.loaded_date['Todos'] = false;
    }
  }

  updateLoadDate(year: string): void {
    if(!Object.values(this.loaded_date).every(Boolean)){
      if(year === 'Todos'){
        for (const key in this.loaded_date) {
          if (Object.prototype.hasOwnProperty.call(this.loaded_date, key)) {
            this.loaded_date[key] = true;
          }
        }
      }
      else {
        this.loaded_date[year] = !this.loaded_date[year];
      }
    }
  }

  setDepartmentSelected(department_selected: string): void {
    this.department_selected = department_selected;
  }

  private async mapFunction(): Promise<void> {
    const chartDom = document.getElementById('main_map');
    this.myMap = init(chartDom!);
    let map_options: EChartsOption;
    this.myMap.showLoading();

    return await lastValueFrom(this._secopService.getMapColombia().pipe(map(
      async (colombiaJson: any) => {
        this.myMap.hideLoading();
        registerMap('Colombia', colombiaJson);
        map_options = {
          title: {
            text: this.translate.currentLang==='en' || !this.translate.currentLang ? 'Map of Colombia (2022)' : 'Mapa de Colombia (2022)',
            subtext: this.translate.currentLang==='en' || !this.translate.currentLang ? 'Through the interactive map,\n you can view the information related to the\n number of contracts with addition, filter them by\n year and departments.' : 'Mediante el mapa interactivo,\n puede visualizar la información relacionada a la cantidad\n de contratos con adición, filtrarlos\n por año y departamentos.',
            sublink: 'https://gist.github.com/john-guerra/43c7656821069d00dcbc',
            left: 'right'
          },
          tooltip: {
            trigger: 'item',
            showDelay: 0,
            transitionDuration: 0.2
          },
          visualMap: {
            left: 'right',
            min: 0,
            max: 0,
            inRange: {
              color: [
                '#C4C7FF',
                '#BABEFF',
                '#A5AAFF',
                '#9297FF',
                '#8188FF',
                '#6D74FF',
                '#5E66FF',
                '#4B54FF',
                '#3640FF',
                '#2731FF',
                '#000CFF'
              ]
            },
            text: ['High', 'Low'],
            calculable: true
          },
          toolbox: {
            show: true,
            left: 'left',
            top: 'top',
            feature: {
              dataView: { readOnly: false },
              restore: {},
              saveAsImage: {}
            }
          },
          series: [
            {
              name: 'Contracts with Addendum',
              type: 'map',
              roam: true,
              map: 'Colombia',
              emphasis: {
                label: {
                  show: true
                }
              },
              data: []
            }
          ]
        };
        this.myMap.on('click', (params: any) => {
          this.setDepartmentSelected(params.name);
        });
        // Load data from local storage for map
        let new_option_map: any = map_options;
        const data = new_option_map['series'][0]['data'];
        const name_departments = this._secopLocalService.getDepartments;
        if(!name_departments){
            await lastValueFrom(this._secopService.getDepartments().pipe(map((data_name_departments: any)=>{
              for (const key in data_name_departments) {
                if (Object.prototype.hasOwnProperty.call(data_name_departments, key)) {
                  const department = data_name_departments[key];
                  this.name_departments.push(department.departamentoEjecucion);
                  data.push({name: department.departamentoEjecucion, value: 0});
                }
              }
              this.name_departments.sort();
              this._secopLocalService.setDepartments = this.name_departments;
              this.myMap.setOption(new_option_map);
            })));
        }
        else {
          this.name_departments = name_departments.split(';').sort();
          let max_value: number = 0;
          for (let index = 0; index < this.name_departments.length; index++) {
            const name_department = this.name_departments[index];
            const max_value_by_addition: any = JSON.parse(this._sharedFunctionsService.getDataLocalOrRam('maxValueByAddition'));
            if(max_value_by_addition){
              let data_updated = {name: name_department, value: 0};
              let max_value_by_department: number = 0;
              for (const year in max_value_by_addition) {
                if (Object.prototype.hasOwnProperty.call(max_value_by_addition, year)) {
                  const value_by_year = max_value_by_addition[year];
                  if(Object.keys(max_value_by_addition[year]).includes(name_department)){
                    const value = value_by_year[name_department]['conAdiciones'];
                    max_value_by_department+=value;
                    data_updated['value']+=value;
                  }
                  else {
                    continue;
                  }
                }
              }
              max_value = max_value >= max_value_by_department ? max_value : max_value_by_department;
              data.push(data_updated);
            }
            else {
              data.push({name: name_department, value: 0});
            }
          }
          // Todos los años de departamentos actualmente cargados en local storage
          this._secopLocalService.setMaxValueByAdditionTotalMapRAM(max_value.toString());
          new_option_map['visualMap']['max'] = max_value;
          this.myMap.setOption(new_option_map);
        }
        this.myMap.resize();
      })));
  }

}

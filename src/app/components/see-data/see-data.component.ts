import { Component, Input, OnInit, ViewChild } from '@angular/core';
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
import { InfoGeneralComponent } from './info-general/info-general.component';

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

  constructor(private _secopService: SecopService, private _secopLocalService: SecopLocalService, private _sharedFunctionsService: SharedFunctionsService) {
    for (let index = 0; index < this.array_years.length; index++) {
      const year = this.array_years[index];
      this.loaded_date[year] = false;
    }
    this.loaded_date['Todos'] = false;
  }

  ngOnInit(): void {
    this.mapFunction();
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

  private mapFunction(): void {
    const chartDom = document.getElementById('main_map');
    this.myMap = init(chartDom!);
    let map_options: EChartsOption;
    this.myMap.showLoading();

    this._secopService.getMapColombia().subscribe(
      (colombiaJson: any) => {
        this.myMap.hideLoading();
        registerMap('Colombia', colombiaJson);
        map_options = {
          title: {
            text: 'Mapa de Colombia (2022)',
            subtext: 'Datos extraidos de gist.github.com/john-guerra',
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
                '#313695',
                '#4575b4',
                '#74add1',
                '#abd9e9',
                '#e0f3f8',
                '#ffffbf',
                '#fee090',
                '#fdae61',
                '#f46d43',
                '#d73027',
                '#a50026'
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
              name: 'Contratos con Adición',
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
          this._secopService.getDepartments().subscribe((data_name_departments: any)=>{
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
          });
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
      });
  }

}

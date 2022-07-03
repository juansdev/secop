import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SecopService } from 'src/app/services/secop/secop.service';
import { SharedFunctionsService } from 'src/app/services/shared-functions.service';
import { use, init } from 'echarts/core';
import { GridComponent, GridComponentOption, LegendComponent, LegendComponentOption, TooltipComponent, TooltipComponentOption } from 'echarts/components';
import { BarChart, BarSeriesOption, LineChart, LineSeriesOption, PieChart, PieSeriesOption } from 'echarts/charts';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { SecopLocalService } from 'src/app/services/secop/secop-local.service';
import { lastValueFrom, map } from 'rxjs';
declare var $: any;

use([GridComponent, TooltipComponent, LegendComponent, PieChart, BarChart, LineChart, CanvasRenderer, UniversalTransition, LabelLayout]);

type EChartsOption = echarts.ComposeOption<
  GridComponentOption | TooltipComponentOption | LegendComponentOption | PieSeriesOption | BarSeriesOption | LineSeriesOption
>;

interface ValuesByYear {
  [any: number]: {
    [any: string] : any
  };
}

@Component({
  selector: 'app-info-general',
  templateUrl: './info-general.component.html',
  styleUrls: ['./info-general.component.css']
})
export class InfoGeneralComponent {

  @Input() myMap: any;
  @Input() department_selected: string = '';
  @Input() year_selected: string = '';
  @Input() array_years: Array<string> = [];

  public is_load: boolean = false;
  public graphic_values_departments_by_year: ValuesByYear;
  private options_map_changed: boolean = false;
  private graphics_rendered: Array<string> = [];

  public parseInt = parseInt;
  public array_departments_selected: Array<string> = [];
  public array_fields: Array<string> = [];
  public array_name_graphics: Array<string> = ['barChart','pieChart'];

  private fields_for_graphics: any = {
    'Marcacion Adiciones': 'adiciones',
    'Tipo De Contrato': 'contratos',
    'Modalidad de Contratacion': 'modalidad',
    'Orden Entidad': 'orden'
  };

  private array_departments_by_map: Array<string> = [];


  constructor(public _sharedFunctionsService: SharedFunctionsService, private _secopService: SecopService, private _secopLocalService: SecopLocalService) {
    const graphic_values_departments_by_year = JSON.parse(this._sharedFunctionsService.getDataLocalOrRam('graphicValuesDepartmentsByYear'));
    this.graphic_values_departments_by_year = graphic_values_departments_by_year ? graphic_values_departments_by_year : {};
  }

  async ngOnChanges(changes: SimpleChanges) {
    if(this.myMap.getOption()){
      let department_selected = changes['department_selected']?.currentValue;
      let year_selected = changes['year_selected']?.currentValue;
      if(department_selected !== undefined || year_selected !== undefined){
        this.department_selected = department_selected ? department_selected : this.department_selected;
        const changed_department = this.department_selected===department_selected;
        const changed_year = this.year_selected===year_selected;
        if(changed_department && !this.array_departments_selected.includes(this.department_selected)) {
          this._updateArrayDepartmentsSelected();
        }
        this.year_selected = year_selected !== undefined ? year_selected : this.year_selected;
        if(!this.year_selected) {
          let data_by_departments: any = this._sharedFunctionsService.getDataLocalOrRam('dataByDepartmentsAndYear');
          data_by_departments = data_by_departments ? JSON.parse(data_by_departments) : {};
          this._updateAllInfoDepartmentsByYear(data_by_departments, this.year_selected);
        }
        else {
          await this._loadInfoDepartmentSelectedByYear(changed_year);
        }
      }
    }
  }

  ngDoCheck()	{
    if(this.options_map_changed) {
      this._updateMaxValueInMap(this.options_map_changed);
    }
  }

  ngAfterViewChecked() {
    let option_map = this.myMap.getOption();
    if(option_map && !this.array_departments_by_map.length) {
      for (let index = 0; index < option_map['series'][0]['data'].length; index++) {
        const name_department = option_map['series'][0]['data'][index]['name'];
        this.array_departments_by_map.push(name_department);
      }
    }
  }

  onResize() {
    this.myMap.resize();
  }

  public loadAllInfoDepartmentsByYear(): void {
    let data_by_departments: any = this._sharedFunctionsService.getDataLocalOrRam('dataByDepartmentsAndYear');
    data_by_departments = data_by_departments ? JSON.parse(data_by_departments) : {};
    this._updateAllInfoDepartmentsByYear(data_by_departments, this.year_selected, true);
  }

  public createGraphicWithValues(year: string, field: string, index_field: string): void {
    const graphic_values_departments_by_year: any = this.graphic_values_departments_by_year;
    const value_field = graphic_values_departments_by_year[parseInt(year)][field];
    let label_x: Array<string> = [];
    let data: Array<number> = [];
    let data_pie: any = [];
    for (const key in value_field) {
      if (Object.prototype.hasOwnProperty.call(value_field, key)) {
        const value = value_field[key];
        label_x.push(key);
        data.push(value);
        data_pie.push({value: value, name: key});
      }
    }
    for (let index = 0; index < this.array_name_graphics.length; index++) {
      const type_graphic = this.array_name_graphics[index];
      const id_element_for_render = `graphic_${type_graphic}_${index_field}`;
      const chartDom = document.getElementById(id_element_for_render)!;
      if(chartDom && !this.graphics_rendered.includes(id_element_for_render)) {
        const myChart = init(chartDom);
        this.graphics_rendered.push(id_element_for_render);
        let option: EChartsOption;
        if(type_graphic === 'lineChart') {
          option = {
            xAxis: {
              type: 'category',
              data: label_x
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                data: data,
                type: 'line'
              }
            ]
          };
          option && myChart.setOption(option);
        }
        else if(type_graphic === 'barChart') {
          option = {
            xAxis: {
              type: 'category',
              splitLine: { show: false },
              data: label_x
            },
            yAxis: {
              type: 'value'
            },
            series: [
              {
                type: 'bar',
                stack: 'Total',
                label: {
                  show: true,
                  position: 'inside'
                },
                data: data.length === 2 ?
                [
                  data[0],
                  {
                    value: data[1],
                    itemStyle: {
                      color: '#a90000'
                    }
                  }
                ] : data
              }
            ]
          };
          if(data.length !== 2){
            option['tooltip'] = {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow'
              },
              formatter: function (params: any) {
                const tar = params[0];
                return tar.name + ' : ' + tar.value;
              }
            }
          }
          option && myChart.setOption(option);
        }
        else if(type_graphic === 'pieChart') {
          option = {
            legend: {
              orient: 'vertical',
              left: 'left'
            },
            series: [
              {
                name: this._sharedFunctionsService.camelize(field),
                type: 'pie',
                radius: '50%',
                data: data_pie,
                emphasis: {
                  itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                  }
                }
              }
            ]
          };
          option && myChart.setOption(option);
        }
        let observer = new ResizeObserver(function(mutations) {
          myChart.resize();
        });
        let child: any = document.querySelector('#'+id_element_for_render);
        observer.observe(child);
      }
    }
  }

  private _updateArrayDepartmentsSelected(): void {
    let data_by_departments: any = JSON.parse(this._sharedFunctionsService.getDataLocalOrRam('dataByDepartmentsAndYear'));
    if(data_by_departments){
      let array_of_arrays: any = [];
      for (let index = 0; index < Object.values(data_by_departments).length; index++) {
        const values: any = Object.values(data_by_departments)[index];
        const list_departments: any = Object.keys(values);
        array_of_arrays.push(list_departments);
      }
      array_of_arrays = [...new Set([].concat.apply([], array_of_arrays))];
      this.array_departments_selected = array_of_arrays;
    }
    if(!this.array_departments_selected.includes(this.department_selected)){
      this.array_departments_selected.push(this.department_selected);
    };
  }

  private async _loadInfoDepartmentSelectedByYear(changed_year: boolean): Promise<void> {
    let dataByDepartments: any = this._sharedFunctionsService.getDataLocalOrRam('dataByDepartmentsAndYear');
    dataByDepartments = dataByDepartments ? JSON.parse(dataByDepartments) : {};
    if(!this.department_selected && this.year_selected) {
      this._updateAllInfoDepartmentsByYear(dataByDepartments, this.year_selected);
    }
    else {
      this.array_fields = [];
      const array_years = Object.keys(dataByDepartments);
      // Verificar si año no existe en dataByDepartmentsAndYear
      if(Object.keys(dataByDepartments).length ? !array_years.includes(this.year_selected) && !(this.array_years.length === array_years.length) : true){
        this.is_load = true;
        return await lastValueFrom(this._secopService.getDataByDepartmentsAndYear(this.department_selected, this.year_selected).pipe(
          map((data_department: any)=>{
            if(!this.year_selected) {
              for (let index = 0; index < data_department.length; index++) {
                const value_department_by_year = data_department[index];
                const year = value_department_by_year['anno'];
                dataByDepartments[year] = dataByDepartments[year] ? dataByDepartments[year] : {[this.department_selected]:{}};
                dataByDepartments[year][this.department_selected] = value_department_by_year;
              }
            }
            else if(!this.department_selected) {
              for (let index = 0; index < data_department.length; index++) {
                const value_department_by_year = data_department[index];
                const department = value_department_by_year['departamento'];
                dataByDepartments[this.year_selected] = dataByDepartments[this.year_selected] ? dataByDepartments[this.year_selected] : {[department]:{}};
                dataByDepartments[this.year_selected][department] = value_department_by_year;
              }
            }
            else {
              dataByDepartments[this.year_selected] = dataByDepartments[this.year_selected] ? dataByDepartments[this.year_selected] : {[this.department_selected]:{}};
              dataByDepartments[this.year_selected][this.department_selected] = data_department;
            }
            this._sharedFunctionsService.setDataLocalOrRam('dataByDepartmentsAndYear', dataByDepartments);
            const info_department_selected = data_department;
            this._updateInfoDepartmentSelected(info_department_selected);
          })
        )).finally(()=>{
          this.is_load = false;
        });
      }
      else{
        // Verificar si departamento no existe en año
        const department_exist_in_year = this.year_selected
        ?
        (Object.keys(dataByDepartments[this.year_selected]).length ? Object.keys(dataByDepartments[this.year_selected]).includes(this.department_selected) : false)
        : false;
        if(!department_exist_in_year) {
          this.is_load = true;
          return await lastValueFrom(this._secopService.getDataByDepartmentsAndYear(this.department_selected, this.year_selected).pipe(
            map((data_department: any)=>{
              if(!this.year_selected) {
                for (let index = 0; index < data_department.length; index++) {
                  const value_department_by_year = data_department[index];
                  const year = value_department_by_year['anno'];
                  dataByDepartments[year] = dataByDepartments[year] ? dataByDepartments[year] : {[this.department_selected]:{}};
                  dataByDepartments[year][this.department_selected] = value_department_by_year;
                }
              }
              else if(!this.department_selected) {
                for (let index = 0; index < data_department.length; index++) {
                  const value_department_by_year = data_department[index];
                  const department = value_department_by_year['departamento'];
                  dataByDepartments[this.year_selected] = dataByDepartments[this.year_selected] ? dataByDepartments[this.year_selected] : {[department]:{}};
                  dataByDepartments[this.year_selected][department] = value_department_by_year;
                }
              }
              else {
                dataByDepartments[this.year_selected] = dataByDepartments[this.year_selected] ? dataByDepartments[this.year_selected] : {[this.department_selected]:{}};
                dataByDepartments[this.year_selected][this.department_selected] = data_department;
              }
              this._sharedFunctionsService.setDataLocalOrRam('dataByDepartmentsAndYear', dataByDepartments);
              const info_department_selected = data_department;
              this._updateInfoDepartmentSelected(info_department_selected);
            })
          )).finally(()=>{
            this.is_load = false;
          });
        }
        // Si existe año y departamento en dataByDepartments
        else {
          if(changed_year) {
            this._updateAllInfoDepartmentsByYear(dataByDepartments, this.year_selected);
          }
          else {
            const info_department_selected = dataByDepartments[this.year_selected][this.department_selected];
            this._updateInfoDepartmentSelected(info_department_selected);
          }
        }
      }
    }
  }

  private _getFullField(field: string): any {
    const words_by_field = this._sharedFunctionsService.camelize(field).split(' ');
    for (let index = 0; index < words_by_field.length; index++) {
      const word = words_by_field[index].toLowerCase();
      if(Object.values(this.fields_for_graphics).includes(word)) {
        return Object.keys(this.fields_for_graphics)[Object.values(this.fields_for_graphics).indexOf(word)];
      }
    }
  }

  private async _updateAllInfoDepartmentsByYear(data_by_departments: any, year_selected: string, load_all_departments: boolean = false): Promise<void> {
    let list_name_departments_selected = this.array_departments_selected;
    list_name_departments_selected = load_all_departments ? this.array_departments_by_map.filter((val) => this.array_departments_selected.indexOf(val) === -1) : list_name_departments_selected;
    if(year_selected) {
      for (let index = 0; index < list_name_departments_selected.length; index++) {
        const name_department = list_name_departments_selected[index];
        let info_department_selected = Object.keys(data_by_departments).length ? data_by_departments[year_selected] : {[year_selected]: {}};
        info_department_selected = info_department_selected[name_department];
        if(!info_department_selected) {
          const department_selected_original = this.department_selected;
          this.department_selected = name_department;
          await this._loadInfoDepartmentSelectedByYear(false);
          this.department_selected = department_selected_original;
        }
        else {
          this._updateInfoDepartmentSelected(info_department_selected);
        }
      }
    }
    else {
      let array_departments_with_all_data_years: any = [];
      const array_departments_with_data: any = [];
      const array_departments_without_data: any = {
        'without_year': [],
        'without_department_in_year': []
      };
      for (let index = 0; index < this.array_years.length; index++) {
        const year = this.array_years[index];
        for (let index = 0; index < list_name_departments_selected.length; index++) {
          const name_department = list_name_departments_selected[index];
          let exist_data_department = data_by_departments[year];
          exist_data_department = exist_data_department ? (exist_data_department[name_department] ? 2 : 1) : 0;
          if(exist_data_department!=2) {
            if(exist_data_department === 0){
              array_departments_without_data['without_year'].push(name_department);
            }
            else {
              array_departments_without_data['without_department_in_year'].push(name_department);
            }
          }
        }
      }
      array_departments_with_all_data_years = array_departments_without_data['without_year'].concat(array_departments_without_data['without_department_in_year']);
      array_departments_with_all_data_years = [...new Set(array_departments_with_all_data_years)];
      array_departments_with_all_data_years = list_name_departments_selected.filter((val) => array_departments_with_all_data_years.indexOf(val) === -1);
      if(array_departments_with_all_data_years.length){
        for (let index = 0; index < array_departments_with_all_data_years.length; index++) {
          const department_with_all_data_year = array_departments_with_all_data_years[index];
          for (let index = 0; index < this.array_years.length; index++) {
            const year = this.array_years[index];
            array_departments_with_data.push(data_by_departments[year][department_with_all_data_year]);
          }
        }
        this._updateInfoDepartmentSelected(array_departments_with_data);
      }
      if(array_departments_without_data['without_year'].length){
        // Arreglar problema de async, await.
        const name_departments: any = [...new Set(array_departments_without_data['without_year'])];
        // Debe permitir iterar el arreglo en un subscription, esperar que se reciba respuesta de la peticion y continuar con el siguiente...
        for (let index = 0; index < name_departments.length; index++) {
          const name_department = name_departments[index];
          const department_selected_original = this.department_selected;
          this.department_selected = name_department;
          await this._loadInfoDepartmentSelectedByYear(false);
          this.department_selected = department_selected_original;
        }
      }
      if(array_departments_without_data['without_department_in_year'].length){
        // Arreglar problema de async, await.
        const name_departments: any = [...new Set(array_departments_without_data['without_department_in_year'])];
        // Debe permitir iterar el arreglo en un subscription, esperar que se reciba respuesta de la peticion y continuar con el siguiente...
        for (let index = 0; index < name_departments.length; index++) {
          const name_department = name_departments[index];
          for (let index = 0; index < this.array_years.length; index++) {
            const year = this.array_years[index];
            let exist_data_department = data_by_departments[year];
            if(!exist_data_department[name_department]){
              const department_selected_original = this.department_selected;
              const year_selected_original = this.year_selected;
              this.department_selected = name_department;
              this.year_selected = year;
              await this._loadInfoDepartmentSelectedByYear(false);
              this.department_selected = department_selected_original;
              this.year_selected = year_selected_original;
            }
          }
        }
      }
    }
  }

  private _updateInfoDepartmentSelected(info_department_selected: any): void {
    let department_selected: string = '';
    if(!Array.isArray(info_department_selected)) {
      info_department_selected = [info_department_selected];
    }
    for (let index = 0; index < info_department_selected.length; index++) {
      const contract = info_department_selected[index];
      const year_contract: number = parseInt(contract['anno']);
      this.graphic_values_departments_by_year[year_contract] = this.graphic_values_departments_by_year[year_contract] ? this.graphic_values_departments_by_year[year_contract] : {};
      // Loop by contract
      for (const field in contract) {
        if (Object.prototype.hasOwnProperty.call(contract, field)) {
          if (['anno', 'id', 'departamento'].includes(field)) {
            if(!department_selected && field === 'departamento') {
              department_selected = contract[field];
            }
            continue;
          }
          else if (Object.prototype.hasOwnProperty.call(contract, field)) {
            let graphic_values_departments = this.graphic_values_departments_by_year[year_contract];
            const field_used = this._getFullField(field);
            if(index === 0) {
              this.array_fields.push(field_used);
            }
            if(!graphic_values_departments[field_used]){
              graphic_values_departments[field_used] = graphic_values_departments[field_used] ? graphic_values_departments[field_used] : {};
            }
            const values_for_graphics = graphic_values_departments[field_used];
            values_for_graphics[field] = contract[field];
            this.graphic_values_departments_by_year[year_contract] = graphic_values_departments;
          }
        }
      }
    }
    this._sharedFunctionsService.setDataLocalOrRam('graphicValuesDepartmentsByYear', this.graphic_values_departments_by_year);
    this._updateValueInMapByDepartmentSelected(department_selected, 'Marcacion Adiciones');
  }

  private _verifyIfDataSaveInMaxValue(max_value_by_addition: any, year: number, name_department_selected: string, field_to_sum: string): any {
    if(Object.keys(max_value_by_addition).length){
      if(Object.keys(max_value_by_addition).includes(year.toString())){
        if(Object.keys(max_value_by_addition[year]).includes(name_department_selected)) {
          return [max_value_by_addition, max_value_by_addition[year][name_department_selected]['conAdiciones']];
        }
      }
    }
    let graphic_values_departments_by_year: any = this.graphic_values_departments_by_year;
    // Agregar dato a max_value_by_addition
    if(!Object.keys(max_value_by_addition).includes(year.toString())){
      max_value_by_addition[year.toString()] = {};
    }
    max_value_by_addition[year.toString()][name_department_selected] = {
      'conAdiciones': graphic_values_departments_by_year[year][field_to_sum]['conAdiciones']
    }
    // Si no esta guardado...
    if(Object.keys(graphic_values_departments_by_year[year]).includes(field_to_sum)) {
      return [max_value_by_addition, graphic_values_departments_by_year[year][field_to_sum]['conAdiciones']];
    }
  }

  private _updateValueInMapByDepartmentSelected(name_department_selected: string, field_to_sum: string): void {
    let graphic_values_departments_by_year: any = this.graphic_values_departments_by_year;
    let option_map = this.myMap.getOption();
    const index_department_selected = this.array_departments_by_map.map(e => e.toLowerCase()).indexOf(name_department_selected.toLowerCase());
    if(index_department_selected) {
      let sum_total_field: number = 0;
      let new_option_map = option_map;
      const department = option_map['series'][0]['data'][index_department_selected];
      if(field_to_sum === 'Marcacion Adiciones') {
        let max_value_by_addition = JSON.parse(this._sharedFunctionsService.getDataLocalOrRam('maxValueByAddition'));
        max_value_by_addition = max_value_by_addition ? max_value_by_addition : {};
        // Si hay año seleccionado...
        if(this.year_selected) {
          const year: number = parseInt(this.year_selected);
          const data_max_value = this._verifyIfDataSaveInMaxValue(max_value_by_addition, year, name_department_selected, field_to_sum);
          max_value_by_addition = data_max_value[0];
          sum_total_field += data_max_value[1];
        }
        else {
          for (let index = 0; index < Object.keys(graphic_values_departments_by_year).length; index++) {
            // Verificar si dato ya esta guardado
            const year: number = parseInt(Object.keys(graphic_values_departments_by_year)[index]);
            const data_max_value = this._verifyIfDataSaveInMaxValue(max_value_by_addition, year, name_department_selected, field_to_sum);
            max_value_by_addition = data_max_value[0];
            sum_total_field += data_max_value[1];
          }
        }
        this._sharedFunctionsService.setDataLocalOrRam('maxValueByAddition', max_value_by_addition);
      }
      department['value'] = sum_total_field;
      new_option_map['series'][0]['data'][index_department_selected] = department;
      this.myMap.setOption(new_option_map);
      this.options_map_changed = true;
    }
  }

  private _updateMaxValueInMap(changed_year: boolean): void {
    let option_map = this.myMap.getOption();
    let new_option_map = option_map;
    let max_value_current = this._secopLocalService.getMaxValueByAdditionTotalMapRAM();
    // El maximo de todos los valores del mapa despues de que se haya actualizado al cambiar de año.
    let max_value_updated = option_map['series'][0]['data'].map((element_data:any)=>parseInt(element_data['value']));
    max_value_updated = Math.max.apply(null, max_value_updated);
    if(changed_year){
      this._secopLocalService.setMaxValueByAdditionTotalMapRAM(max_value_updated.toString());
    }
    else {
      if(parseInt(max_value_current) < max_value_updated.toString() || !max_value_current) {
        this._secopLocalService.setMaxValueByAdditionTotalMapRAM(max_value_updated.toString());
      }
    }
    new_option_map['visualMap'][0]['max'] = max_value_updated;
    new_option_map['visualMap'][0]['range'][1] = max_value_updated;
    this.myMap.setOption(new_option_map);
    this.options_map_changed = false;
  }

}

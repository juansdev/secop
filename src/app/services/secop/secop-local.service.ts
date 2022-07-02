import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SecopLocalService {

  private data_by_departments_and_year_RAM: string = '';
  private max_value_by_addition_RAM: string = '';
  private max_value_by_addition_total_map_RAM: string = '';
  private graphic_values_departments_by_year_RAM: string = '';

  constructor() { }

  public set setDepartments(departments: Array<string>) {
    localStorage.setItem('departments', departments.join(';'));
  }

  public get getDepartments() {
    return localStorage.getItem('departments');
  }

  public set setErrorLoad(error_load: string) {
    localStorage.setItem('error_load', error_load);
  }

  public get getErrorLoad() {
    return localStorage.getItem('error_load');
  }

  public setMaxValueByAdditionTotalMapRAM(max_value_by_addition_total_map: string) {
    this.max_value_by_addition_total_map_RAM = max_value_by_addition_total_map;
  }

  public getMaxValueByAdditionTotalMapRAM(): string {
    return this.max_value_by_addition_total_map_RAM;
  }

  // Se ejecutara primero hasta lanzar el "error exceded cuota limit"

  public set setDataByDepartmentsAndYearLocal(data_by_departments_and_year: string) {
    localStorage.setItem('data_by_departments_and_year', data_by_departments_and_year);
  }

  public get getDataByDepartmentsAndYearLocal() {
    return localStorage.getItem('data_by_departments_and_year');
  }

  public set setMaxValueByAdditionLocal(max_value_by_addition: string) {
    localStorage.setItem('max_value_by_addition', max_value_by_addition);
  }

  public get getMaxValueByAdditionLocal() {
    return localStorage.getItem('max_value_by_addition');
  }

  public set setGraphicValuesDepartmentsByYearLocal(graphic_values_departments_by_year: string) {
    console.log('graphic_values_departments_by_year');
    console.log(graphic_values_departments_by_year);
    localStorage.setItem('graphic_values_departments_by_year', graphic_values_departments_by_year);
  }

  public get getGraphicValuesDepartmentsByYearLocal() {
    return localStorage.getItem('graphic_values_departments_by_year');
  }

  // Se ejecutara despues para guardar datos en Memoria RAM

  public setDataByDepartmentsAndYearRAM(data_by_departments_and_year: string) {
    this.data_by_departments_and_year_RAM = data_by_departments_and_year;
  }

  public getDataByDepartmentsAndYearRAM(): string {
    return this.data_by_departments_and_year_RAM;
  }

  public setMaxValueByAdditionRAM(max_value_by_addition: string) {
    this.max_value_by_addition_RAM = max_value_by_addition;
  }

  public getMaxValueByAdditionRAM(): string {
    return this.max_value_by_addition_RAM;
  }

  public setGraphicValuesDepartmentsByYearRAM(graphic_values_departments_by_year: string) {
    this.graphic_values_departments_by_year_RAM = graphic_values_departments_by_year;
  }

  public getGraphicValuesDepartmentsByYearRAM(): string {
    return this.graphic_values_departments_by_year_RAM;
  }

}

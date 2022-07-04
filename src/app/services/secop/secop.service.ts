import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { global } from 'src/app/services/global';

@Injectable({
  providedIn: 'root'
})
export class SecopService {

  private _token_forest_eastus: string = 'Bearer QsiuUHgtvw32IzBtuLb2dwS4UIkAo68i';

  constructor(private _http: HttpClient) {
  }

  // Frontend

  getMapColombia():Observable<any> {
    let headers = new HttpHeaders().set("Content-Type","application/json");
    return this._http.get(global.url_frontend + 'assets/json/colombia.json', {headers:headers});
  }

  // Backend (Secop)

  getDepartments():Observable<any> {
    let headers = new HttpHeaders().set("Content-Type","application/json");
    return this._http.get(global.url_backend_secop + 'departamentos', {headers:headers});
  }

  getDataByDepartmentsAndYear(department_selected: string = '', year: string = ''):Observable<any> {
    let headers = new HttpHeaders().set("Content-Type","application/json");
    return this._http.get(global.url_backend_secop + `report?departamento=${department_selected}&anno=${year}`, {headers:headers});
  }

  postFileExcel(file_excel: File):any {
    let body = new FormData();
    body.append("file", file_excel);
    return this._http.post(global.url_backend_secop+"upload", body ,{
      reportProgress: true,
      observe: 'events'
    });
  }

  getFieldsPredictiveModel():Observable<any> {
    let headers = new HttpHeaders().set("Content-Type","application/json");
    return this._http.get(global.url_backend_secop + 'listas', {headers:headers});
  }

  postFormPredictiveModel(form: any):Observable<any> {
    let params = JSON.stringify(form);
    let headers = new HttpHeaders().set("Content-Type","application/json")
                                    .set("Authorization",this._token_forest_eastus);
    return this._http.post(global.url_backend_secop+'predict',params,{headers:headers});
  }

}

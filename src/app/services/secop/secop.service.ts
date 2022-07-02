import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { global } from 'src/app/services/global';

@Injectable({
  providedIn: 'root'
})
export class SecopService {

  url_frontend: string;
  url_backend: string;

  constructor(private _http: HttpClient) {
    this.url_backend = global.url_backend;
    this.url_frontend = global.url_frontend;
  }

  // Frontend

  getMapColombia():Observable<any> {
    let headers = new HttpHeaders().set("Content-Type","application/json");
    return this._http.get(global.url_frontend + 'assets/json/colombia.json', {headers:headers});
  }

  // Backend

  getDepartments():Observable<any> {
    let headers = new HttpHeaders().set("Content-Type","application/json");
    return this._http.get(global.url_backend + 'departamentos', {headers:headers});
  }

  getDataByDepartmentsAndYear(department_selected: string = '', year: string = ''):Observable<any> {
    let headers = new HttpHeaders().set("Content-Type","application/json");
    return this._http.get(global.url_backend + `report?departamento=${department_selected}&anno=${year}`, {headers:headers});
  }

  getFieldsPredictiveModel():Observable<any> {
    let headers = new HttpHeaders().set("Content-Type","application/json");
    return this._http.get(global.url_backend + 'listas', {headers:headers});
  }

  postFileExcel(file_excel: File):any {
    let body = new FormData();
    body.append("file", file_excel);
    return this._http.post(global.url_backend+"upload", body ,{
      reportProgress: true,
      observe: 'events'
    }).pipe(
      catchError(this.errorMgmt)
    );
  }

  errorMgmt(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      console.error(error);
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }

}

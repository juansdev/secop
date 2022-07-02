import { Component, OnInit } from '@angular/core';
import { SecopService } from 'src/app/services/secop/secop.service';
import { SharedFunctionsService } from 'src/app/services/shared-functions.service';

interface ValueByFields {
  [key: string]: Array<string>;
}

@Component({
  selector: 'app-form-fields',
  templateUrl: './form-fields.component.html',
  styleUrls: ['./form-fields.component.css']
})
export class FormFieldsComponent implements OnInit {

  value_by_fields: ValueByFields = {};

  constructor(public sharedFunctionsService: SharedFunctionsService, public _secopService: SecopService) { }

  ngOnInit(): void {
    this._secopService.getFieldsPredictiveModel().subscribe((data_fields_predictive_model: any) => {
      const fields_predictive_model = Object.values(data_fields_predictive_model);
      for (let index = 0; index < fields_predictive_model.length; index++) {
        const value_fields: any = fields_predictive_model[index];
        let name_field = '';
        for (let index = 0; index < value_fields.length; index++) {
          const value_field = value_fields[index];
          if(!index) {
            name_field = Object.keys(value_field).filter(key => key !== 'id')[0];
            this.value_by_fields[name_field] = [];
          }
          this.value_by_fields[name_field].push(value_field[name_field]);
        }
      }
    });
  }

}

import { HttpEventType } from '@angular/common/http';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SecopService } from 'src/app/services/secop/secop.service';
import { SharedFunctionsService } from '../../services/shared-functions.service';

export interface dragDropData {

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

  countContract: string = '001';
  arrayContract: Array<string> = [this.countContract];

  constructor(private dialog: MatDialog, private _sharedFunctionsService: SharedFunctionsService) {
  }

  ngOnInit(): void {
  }

  private number_contract(number: string): string {
    return number.length <= 2 ? (number.length == 1 ? '00' + number : '0' + number) : number;
  }

  clickCountContract(): void {
    const result: string = (parseInt(this.countContract) + 1).toString();
    this.countContract = this.number_contract(result);
    this.arrayContract.push(this.countContract);
  }

  openProbabilityGenerator(): void {
    const dialogRef: MatDialogRef<CalculateDialog> = this.dialog.open(CalculateDialog, {
      width: this._sharedFunctionsService.isHandset$ ? '100%' : '75%',
      data: {
        progress: 0,
        progress_class: 'width: 0%',
        number_form: this.arrayContract[0]
      }
    });
    this._sharedFunctionsService.simulateProgressBar(dialogRef, this.arrayContract);
  }

  openDragDrop(): void {
    this.dialog.open(DragDropDialog, {
      width: '75%'
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
    @Inject(MAT_DIALOG_DATA) public data: dragDropData,
    private dialog: MatDialog,
    private _sharedFunctionsService: SharedFunctionsService,
    private _secopService: SecopService
  ) { }

  ngOnInit(): void {
    const input = document.getElementById('fileDropRef');

    input?.addEventListener('change', event => {
      const result = (event.target as HTMLInputElement).files;
      console.log('result');
      console.log(result);
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
  uploadFilesSimulator(): any {
    this._secopService.postFileExcel(this.file).subscribe(
      (event: any) => {
        switch (event.type) {
          case HttpEventType.Sent:
            console.log('Request has been made!');
            break;
          case HttpEventType.ResponseHeader:
            console.log('Response header has been received!');
            break;
          case HttpEventType.UploadProgress:
            var eventTotal = event.total ? event.total : 0;
            this.file.progress = Math.round(event.loaded / eventTotal * 100);
            console.log(`Uploaded! ${this.file.progress}%`);
            break;
          case HttpEventType.Response:
            console.log('Image Upload Successfully!', event.body);
            this.file_loaded = true;
            setTimeout(() => {
              this.file.progress = 0;
            }, 1500);
            // this.uploadFilesSimulator(index + 1);
        }
      });
  }

  /**
   * Update data this.file with file
   * @param file (File)
   */
  async prepareFilesList(file: any) {
    file[0].progress = 0;
    this.file = file[0];
    console.log(this.file);
    this.fileDropEl.nativeElement.value = "";
    await this.uploadFilesSimulator();
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

  openProbabilityGenerator(): void {
    let file_names: Array<string> = [];
    const name: string = this.file.name;
    file_names.push(name);

    const dialogRef: MatDialogRef<CalculateDialog> = this.dialog.open(CalculateDialog, {
      width: this._sharedFunctionsService.isHandset$ ? '100%' : '75%',
      data: {
        progress: 0,
        progress_class: 'width: 0%',
        number_form: file_names
      }
    });
    this._sharedFunctionsService.simulateProgressBar(dialogRef, file_names);
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

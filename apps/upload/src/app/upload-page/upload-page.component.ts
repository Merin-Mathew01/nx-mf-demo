import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent, NavbarComponent } from '@nx-demo/shared/ui'
import { ApiService } from '@nx-demo/shared/data-access'
import { CellCloseEvent, CreateFormGroupArgs, KENDO_GRID } from '@progress/kendo-angular-grid';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';


@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, KENDO_GRID, ReactiveFormsModule, DropDownsModule],
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.scss',
})
export class UploadPageComponent {
  fb = inject(FormBuilder)

  selectedFile: File | null = null;
  api = inject(ApiService)

  gridData = signal<any[]>([])
  columns = signal<any[]>([])

  docId = ''

  columnGroups = [
    {
      title: 'Config 1',
      groupColor: '#1976D2',
      columnColor: '#BBDEFB',
      columns: ['AlarmName', 'VarName', 'Age']
    },
    {
      title: 'Config 2',
      groupColor: '#388E3C',
      columnColor: '#C8E6C9',
      columns: ['Gender', 'Department', 'Index', 'Timestamp']
    },
    {
      title: 'Config 3',
      groupColor: '#F57C00',
      columnColor: '#FFE0B2',
      columns: ['Status', 'Calcno', 'Availability']
    },
    {
      title: 'Config 4',
      groupColor: '#f500cc',
      columnColor: '#f3bffa',
      columns: ['Verified', 'Approved', 'Reviewed']
    }
  ];

  validationRules: Record<string, any[]> = {
    AlarmName: [
      Validators.required,
      Validators.maxLength(20)
    ],
    VarName: [
      Validators.required,
      Validators.pattern(/^[A-Za-z]+$/)
    ],
    Age: [
      Validators.required,
      Validators.min(18),
      Validators.max(100)
    ],
    Gender: [
      Validators.required,
    ],
    Department: [
      Validators.required,
    ],
    Index: [
      Validators.required,
    ],
    Timestamp: [
      Validators.required,
    ],
    Status: [
      Validators.required,
    ],
    Calcno: [
      Validators.required,
    ],
    Availability: [
      Validators.required,
    ],

  }

  yesNoOptions = ['--Select--', 'Yes', 'No']

  createFormGroup = (args: CreateFormGroupArgs): FormGroup => {
    const item = args.dataItem;
    const group: any = {};

    Object.keys(item).forEach(key => {
      group[key] = new FormControl(item[key], this.validationRules[key] || [])
    })

    return this.fb.group(group)
  }



  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      this.selectedFile = input.files[0];
    }
  }

  removeFile(): void {
    this.selectedFile = null;
  }

  upload(): void {
    if (!this.selectedFile) {
      return;
    }
    console.log('Uploading:', this.selectedFile);
    this.api.uploadExcelAPI(this.selectedFile).subscribe({
      next: (res: any) => {
        console.log(res);
        this.docId = res.documentId
        // Get first sheet
        const sheet = res.sheets[0];

        // Get rows
        const rows = sheet.rows;
        const updatedData = rows.map((row: any) => ({
          ...row.data,
          rowIndex: row.rowIndex,
          Verified: 'No',
          Approved: 'No',
          Reviewed: 'No'
        }))
        this.gridData.set(updatedData)
        console.log(this.gridData());
        if (updatedData.length > 0) {
          this.columns.set(Object.keys(updatedData[0]))
          console.log(this.columns());

        }
        this.selectedFile = null;
      }, error: (reason) => {
        console.log(reason);
      }
    })
  }

  cellCloseHandler(event: CellCloseEvent) {
    if (event.formGroup.valid) {
      Object.assign(event.dataItem, event.formGroup.value);

      this.gridData.set([...this.gridData()]);
    }
  }

  saveData() {
    const dataToSave = this.gridData()
    this.api.updateExceldata(this.docId,dataToSave).subscribe({
      next: (res) => {
        alert("updated successfully..")
        console.log('Saved successfully', res);
      },
      error: (err) => {
        console.error('Save failed', err);
      }
    })
  }
}




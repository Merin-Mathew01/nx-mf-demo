import { Component, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent, NavbarComponent } from '@nx-demo/shared/ui'
import { ApiService } from '@nx-demo/shared/data-access'
import { CellCloseEvent, CreateFormGroupArgs, GridComponent, KENDO_GRID, RowClassArgs } from '@progress/kendo-angular-grid';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { Router } from '@angular/router';
import { switchMap, timer } from 'rxjs';
import { PopupModule } from '@progress/kendo-angular-popup';
import { SignalrService } from '@nx-demo/shared/data-access'



@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, KENDO_GRID, ReactiveFormsModule, DropDownsModule, PopupModule],
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.scss',
})
export class UploadPageComponent {
  @ViewChild('grid') grid!: GridComponent;
  fb = inject(FormBuilder)

  selectedFile: File | null = null;
  api = inject(ApiService)
  signalr = inject(SignalrService)


  gridData = signal<any[]>([])
  columns = signal<any[]>([])

  docId!: string;
  sheetName!: string;
  sheetIndex!: number;

  editableRow: number | null = null;
  editingRows = signal<any[]>([]);
  hoveredRowIndex: number | null = null;
  editFormGroup!: FormGroup;


  route = inject(Router)

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

  currentUser = sessionStorage.getItem('username');



  showPopup = false;

  popupAnchor!: HTMLElement;

  hoveredRow: any = null;

  hoveredGridRow = -1;

  hideTimer: any;

  popupPinned = false;


  ngOnInit() {

    const id = sessionStorage.getItem('docId');

    if (id) {
      this.docId = id;
      this.getExcelData();
      this.initializeSignalR()
    }

    // timer(0, 10000)
    //   .pipe(
    //     switchMap(() =>
    //       this.api.getEditing(this.docId)
    //     )
    //   )
    //   .subscribe((result: any) => {

    //     this.editingRows.set(result.editingRows);

    //     console.log(this.editingRows());


    //   });


  }

  createFormGroup = (args: CreateFormGroupArgs): FormGroup => {

    const item = args.dataItem;

    const group: any = {};

    Object.keys(item).forEach(key => {
      group[key] = new FormControl(
        item[key],
        this.validationRules[key] || []
      );
    });

    return this.fb.group(group);
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
        sessionStorage.setItem('docId', this.docId)
        // Get first sheet
        const sheet = res.sheets[0];
        this.sheetName = sheet.sheetName;
        this.sheetIndex = sheet.sheetIndex;
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



  saveData() {
    const rows = this.gridData().map((row: any) => {
      // Remove rowIndex from data object
      const { rowIndex, ...data } = row;
      return { rowIndex, data };
    });
    const payload = {
      sheets: [
        {
          sheetName: this.sheetName,
          sheetIndex: this.sheetIndex,
          rows
        }
      ]
    };
    this.api.updateExceldata(this.docId, payload).subscribe({
      next: (res) => {
        alert("updated successfully..")
        this.route.navigateByUrl('/reports')
        console.log('Saved successfully', res);
      },
      error: (err) => {
        console.error('Save failed', err);
      }
    })
  }

  getExcelData() {
    this.api.getExceldata(this.docId).subscribe({
      next: (res: any) => {
        console.log(res);
        const sheet = res.sheets[0];
        this.sheetName = sheet.sheetName;
        this.sheetIndex = sheet.sheetIndex;
        const data = sheet.rows.map((row: any) => ({
          ...row.data,
          rowIndex: row.rowIndex,
          Verified: row.data.Verified ?? 'No',
          Approved: row.data.Approved ?? 'No',
          Reviewed: row.data.Reviewed ?? 'No'
        }));

        this.gridData.set(data);

        if (data.length) {
          this.columns.set(Object.keys(data[0]));
          console.log(this.columns());


        }
      },
      error: (err) => {
        console.error(err);
      }
    })

  }

  editRow(data: any, gridRowIndex: number) {

    this.api.editRow(this.docId, this.sheetIndex, data.rowIndex).subscribe({
      next: () => {
        this.popupPinned = true;

        this.editableRow = data.rowIndex;

        this.editFormGroup = this.createFormGroup({
          dataItem: data,
          isNew: false
        } as CreateFormGroupArgs);

        this.grid.editRow(gridRowIndex, this.editFormGroup);
        setTimeout(() => {

          const cell = document.querySelector(
            `.k-grid tbody tr:nth-child(${gridRowIndex + 1}) td`
          ) as HTMLElement;

          if (cell) {
            this.popupAnchor = cell;
            this.showPopup = false;

            setTimeout(() => {
              this.showPopup = true;
            });
          }

        });

        // Refresh editing rows immediately
        this.api.getEditing(this.docId).subscribe((result: any) => {
          this.editingRows.set(result.editingRows);
          // console.log('editingRows:', this.editingRows);
          // console.log('isEditedByMe:', this.isEditedByMe(this.hoveredRow));
        });

      },

      error: err => {

        alert("This row is already being edited.");
        console.log(err);


      }

    });

  }

  public rowClass = (args: RowClassArgs) => {

    return {
      'editing-row': this.editingRows().some((x: any) =>
        x.sheetIndex === this.sheetIndex &&
        x.rowIndex === args.dataItem.rowIndex
      )
    };

  };

  // isEditedByMe(row: any): boolean {
  //   console.log('Checking row:', row.rowIndex);

  //   console.log(this.editingRows);

  //   return this.editingRows.some((x: any) =>
  //     x.sheetIndex === this.sheetIndex &&
  //     x.rowIndex === row.rowIndex &&
  //     x.userName.toLowerCase() === this.currentUser?.toLowerCase()
  //   );

  // }

  isEditedByMe(row: any): boolean {

    // console.log("Current User:", this.currentUser);
    // console.log("Hovered Row:", row);
    // console.log("Editing Rows:", this.editingRows());

    const result = this.editingRows().some((x: any) => {
      const match =
        x.sheetIndex === this.sheetIndex &&
        x.rowIndex === row.rowIndex &&
        x.userName.toLowerCase() === this.currentUser?.toLowerCase();

      // console.log("Match:", match);

      return match;
    });

    // console.log("Final Result:", result);

    return result;
  }

  getEditingUser(row: any) {

    return this.editingRows().find((x: any) =>
      x.sheetIndex === this.sheetIndex &&
      x.rowIndex === row.rowIndex
    );

  }

  isLockedByOther(row: any): boolean {

    const editingUser = this.getEditingUser(row);

    return !!editingUser &&
      editingUser.userName.toLowerCase() !== this.currentUser?.toLowerCase();

  }

  saveRow(dataItem: any, gridRowIndex: number) {

    const updatedRow = this.editFormGroup.value
    console.log(updatedRow);


    const { rowIndex, ...rowData } = updatedRow;

    const reqBody = { data: rowData };
    console.log(reqBody);


    this.api.saveRow(this.docId, this.sheetIndex, rowIndex, reqBody).subscribe({

      next: (res: any) => {
        console.log(res);

        alert("Row saved successfully.");

        this.grid.closeRow(gridRowIndex);
        this.popupPinned = false;
        this.showPopup = false;
        this.editableRow = null;


        this.getExcelData();

      },

      error: (err) => {

        console.error(err);

        alert("Failed to save row.");

      }

    });

  }

  cancelEdit(dataItem: any, gridRowIndex: number) {

    this.api.cancelRow(this.docId, this.sheetIndex, dataItem.rowIndex).subscribe({

      next: () => {

        // Close Kendo edit mode
        this.grid.closeRow(gridRowIndex);

        // Clear your editing state
        this.popupPinned = false;
        this.showPopup = false;
        this.editableRow = null;

        // Refresh editing locks
        this.api.getEditing(this.docId).subscribe((result: any) => {
          this.editingRows.set(result.editingRows);
        });

      },

      error: (err) => {

        console.error(err);

        alert("Unable to cancel editing.");

      }

    });

  }

  // showRowActions(
  //   event: MouseEvent,
  //   dataItem: any,
  //   rowIndex: number
  // ) {
  //   clearTimeout(this.hideTimer);

  //   // Anchor to the TD element instead of the inner DIV
  //   this.popupAnchor = (event.currentTarget as HTMLElement).closest('td') as HTMLElement;

  //   this.hoveredRow = dataItem;
  //   this.hoveredGridRow = rowIndex;

  //   this.showPopup = true;

  //   // console.log('Popup anchor:', this.popupAnchor);
  // }

  showRowActions(event: MouseEvent, dataItem: any, rowIndex: number) {
  if (this.isEditingAnyRow() && dataItem.rowIndex !== this.editableRow) {
    return;
  }

  clearTimeout(this.hideTimer);

  // Anchor to the whole row, not the individual cell
  this.popupAnchor = (event.currentTarget as HTMLElement).closest('tr') as HTMLElement;

  this.hoveredRow = dataItem;
  this.hoveredGridRow = rowIndex;
  this.showPopup = true;
}

  hideRowActions() {

    if (this.popupPinned) {
      return;
    }

    this.hideTimer = setTimeout(() => {

      this.showPopup = false;

    }, 200);

  }

  keepPopupOpen() {

    clearTimeout(this.hideTimer);

  }

  isEditingAnyRow(): boolean {
    return this.editableRow !== null;
  }

  initializeSignalR() {

    this.signalr.startConnection()
      .then(() => {
        console.log('SignalR Connected');
        return this.signalr.joinDocument(this.docId);
      })
      .then(() => {
        console.log('Joined document');

        this.api.getEditing(this.docId).subscribe((result: any) => {

          this.editingRows.set(result.editingRows);

          console.log('Current Editors:', this.editingRows());

          this.registerSignalREvents();

        });

      })
      .catch(err => console.error(err));

  }
  registerSignalREvents() {

    this.signalr.onRowLocked((data: any) => {

      console.log('Row Locked:', data);

      this.editingRows.update(rows => {

        const exists = rows.some(r =>
          r.sheetIndex === data.sheetIndex &&
          r.rowIndex === data.rowIndex
        );

        if (exists) {
          return rows;
        }

        return [...rows, data];
      });

    });

    this.signalr.onRowUnlocked((data: any) => {

      console.log('Row Unlocked:', data);

      this.editingRows.update(rows =>
        rows.filter(r =>
          !(r.sheetIndex === data.sheetIndex &&
            r.rowIndex === data.rowIndex)
        )
      );

    });

  }

}




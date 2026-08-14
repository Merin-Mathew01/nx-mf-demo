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

  isLoading = signal(false)


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
  currentUserId = sessionStorage.getItem('currentUserId');


  showPopup = false;

  popupAnchor!: HTMLElement;

  hoveredRow: any = null;

  hoveredGridRow = -1;

  hideTimer: any;

  // popupPinned = false;
  hoveredColIndex: number | null = null;

  documentVersion = signal<string>("");

  pollingInterval: any = null;

  connectionState = this.signalr.connectionState; 


  ngOnInit() {

    const id = sessionStorage.getItem('docId');

    if (id) {
      this.docId = id;
      this.getExcelData(() => this.initializeSignalR())
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

  ngOnDestroy() {
    this.stopPolling()

    if (this.docId) {
      this.signalr.leaveDocument(this.docId)
        .catch(err => console.error(err));
    }
    this.signalr.removeListeners();
    this.signalr.stopConnection()
      .catch(err => console.error(err));
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
    this.isLoading.set(true);
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
        this.isLoading.set(false);
        console.log(this.gridData());
        if (updatedData.length > 0) {
          this.columns.set(Object.keys(updatedData[0]))
          console.log(this.columns());

        }
        this.selectedFile = null;
      }, error: (reason) => {
        console.log(reason);
        this.isLoading.set(false);
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

  getExcelData(onComplete?: () => void) {
    this.isLoading.set(true);
    this.api.getExceldata(this.docId).subscribe({
      next: (res: any) => {
        console.log(res);
        const sheet = res.sheets[0];
        this.sheetName = sheet.sheetName;
        this.sheetIndex = sheet.sheetIndex;
        this.documentVersion.set(res.versionNumber);

        const data = sheet.rows.map((row: any) => ({
          ...row.data,
          rowIndex: row.rowIndex,
          Verified: row.data.Verified ?? 'No',
          Approved: row.data.Approved ?? 'No',
          Reviewed: row.data.Reviewed ?? 'No'
        }));

        this.gridData.set(data);
        this.isLoading.set(false);

        if (data.length) {
          this.columns.set(Object.keys(data[0]));
          console.log(this.columns());


        }
        onComplete?.();
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    })

  }

  // editRow(data: any, gridRowIndex: number) {

  //   this.api.editRow(this.docId, this.sheetIndex, data.rowIndex).subscribe({
  //     next: () => {
  //       this.popupPinned = true;

  //       this.editableRow = data.rowIndex;

  //       this.editFormGroup = this.createFormGroup({
  //         dataItem: data,
  //         isNew: false
  //       } as CreateFormGroupArgs);


  //       this.grid.editRow(gridRowIndex, this.editFormGroup);
  //       setTimeout(() => {
  //         const row = this.grid.wrapper.nativeElement.querySelectorAll('tbody tr')[gridRowIndex];
  //         const firstCell = row.querySelector('td');

  //         if (firstCell) {
  //           this.popupAnchor = firstCell;
  //         }
  //       });


  //       // Refresh editing rows immediately
  //       this.api.getEditing(this.docId).subscribe((result: any) => {
  //         this.editingRows.set(result.editingRows);
  //         // console.log('editingRows:', this.editingRows);
  //         // console.log('isEditedByMe:', this.isEditedByMe(this.hoveredRow));
  //       });

  //     },

  //     error: err => {

  //       alert("This row is already being edited.");
  //       console.log(err);


  //     }

  //   });

  // }

  editRow(data: any, gridRowIndex: number) {
    this.api.editRow(this.docId, this.sheetIndex, data.rowIndex).subscribe({
      next: () => {
        // this.popupPinned = true;
        this.editableRow = data.rowIndex;
        this.editFormGroup = this.createFormGroup({
          dataItem: data,
          isNew: false
        } as CreateFormGroupArgs);

        this.grid.editRow(gridRowIndex, this.editFormGroup);

        // wait for Kendo to re-render this row in edit-template mode,
        // then re-anchor the popup to the SAME cell position (now a fresh DOM node)
        setTimeout(() => {
          const tbodyRows = this.grid.wrapper.nativeElement.querySelectorAll('tbody tr');
          const row = tbodyRows[gridRowIndex];
          if (row && this.hoveredColIndex !== null) {
            const cell = row.children[this.hoveredColIndex] as HTMLElement;
            if (cell) {
              this.popupAnchor = cell;
            }
          }
        });

        this.api.getEditing(this.docId).subscribe((result: any) => {
          this.editingRows.set(result.editingRows);
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
        if (res.versionNumber != "") {
          this.documentVersion.set(res.versionNumber);
        }

        this.grid.closeRow(gridRowIndex);
        // this.popupPinned = false;
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
        // this.popupPinned = false;
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

  //   // If another row is being edited, don't show popup there
  //   if (this.isEditingAnyRow() && !this.isEditedByMe(dataItem)) {
  //     return;
  //   }

  //   clearTimeout(this.hideTimer);

  //   // Anchor popup to the hovered cell
  //   this.popupAnchor = (event.currentTarget as HTMLElement).closest('td') as HTMLElement;

  //   this.hoveredRow = dataItem;
  //   this.hoveredGridRow = rowIndex;

  //   this.showPopup = true;
  // }

  showRowActions(event: MouseEvent, dataItem: any, rowIndex: number) {

    clearTimeout(this.hideTimer);

    const cell = (event.currentTarget as HTMLElement).closest('td') as HTMLElement;
    this.popupAnchor = cell;

    // remember which column this was, so we can re-find it after edit-mode re-render
    const row = cell?.closest('tr');
    this.hoveredColIndex = row ? Array.from(row.children).indexOf(cell) : null;

    this.hoveredRow = dataItem;
    this.hoveredGridRow = rowIndex;
    this.showPopup = true;
  }

  hideRowActions() {
    // keep popup open only if the row I'm CURRENTLY hovering is the one I'm editing
    if (this.hoveredRow && this.isEditedByMe(this.hoveredRow)) {
      return;
    }

    this.hideTimer = setTimeout(() => {
      this.showPopup = false;
    }, 150);
  }

  // hideRowActions() {

  //   // Keep popup visible while editing
  //   if (this.popupPinned) {
  //     return;
  //   }

  //   this.hideTimer = setTimeout(() => {
  //     this.showPopup = false;
  //   }, 150);

  // }

  keepPopupOpen() {

    clearTimeout(this.hideTimer);

  }

  isEditingAnyRow(): boolean {

    return this.editingRows().some((x: any) =>
      x.userName.toLowerCase() === this.currentUser?.toLowerCase()
    );

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
          this.restoreOwnEditState()

        });

      })
      .catch(err => {// item 7: initial connection failed — fall back to polling instead of dead-ending
        console.error('SignalR failed to start, falling back to polling', err);
        this.startPolling();
      })

    // item 3/4/5: react to reconnect lifecycle
    this.signalr.onReconnecting(() => {
      console.log('Reconnecting...');
      this.startPolling(); // cover the gap while the socket is down
    });

    this.signalr.onReconnected(() => {
      console.log('Reconnected — rejoining document and reconciling');
      this.stopPolling();

      this.signalr.joinDocument(this.docId)
        .then(() => {
          this.api.getEditing(this.docId).subscribe((result: any) => {
            this.editingRows.set(result.editingRows);
            this.restoreOwnEditState();
          });
        })
        .catch(err => console.error('Failed to rejoin document after reconnect', err));
    });

    this.signalr.onClose(() => {
      console.log('Connection permanently closed');
      this.startPolling();
    });

  }

  private startPolling() {
    if (this.pollingInterval) {
      return;
    }
    this.pollingInterval = setInterval(() => {
      this.api.getEditing(this.docId).subscribe((result: any) => {
        this.editingRows.set(result.editingRows);
      });
    }, 10000);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

  }

  restoreOwnEditState() {
    const myLock = this.editingRows().find((x: any) =>
      x.sheetIndex === this.sheetIndex &&
      x.userName.toLowerCase() === this.currentUser?.toLowerCase()
    );

    if (!myLock) {
      return;
    }

    setTimeout(() => {
      const data = this.gridData();
      const gridRowIndex = data.findIndex((r: any) => r.rowIndex === myLock.rowIndex);

      if (gridRowIndex === -1) {
        return;
      }

      const dataItem = data[gridRowIndex];

      // this.popupPinned = true;
      this.editableRow = dataItem.rowIndex;

      this.editFormGroup = this.createFormGroup({
        dataItem,
        isNew: false
      } as CreateFormGroupArgs);

      this.grid.editRow(gridRowIndex, this.editFormGroup);

      // wait for edit-template DOM to actually render before anchoring
      setTimeout(() => {
        const tbodyRows = this.grid.wrapper.nativeElement.querySelectorAll('tbody tr');
        const row = tbodyRows[gridRowIndex];

        if (row) {
          const firstCell = row.querySelector('td');
          if (firstCell) {
            this.popupAnchor = firstCell;
          }
        }

        this.hoveredRow = dataItem;
        this.hoveredGridRow = gridRowIndex;
        this.showPopup = true;
      });
    });
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

    this.signalr.onRowUpdated((event: any) => {
      console.log('Row Updated:', event);

      // 1. Only act on events for the currently open document
      if (event.documentId !== this.docId) {
        return;
      }
      // 2. Only act on the sheet currently displayed
      if (event.sheetIndex !== this.sheetIndex) {
        return;
      }

      // always track the latest version, even for my own event (though I skip re-patching below)
      this.documentVersion.set(event.versionNumber);


      if (event.updatedByUserId === this.currentUserId) {
        return; // I already have this data from the save API response
      }

      this.gridData.update(rows =>
        rows.map(row =>
          row.rowIndex === event.rowIndex
            ? { ...row, ...event.data, rowIndex: event.rowIndex }
            : row
        )
      );
    });

  }

}




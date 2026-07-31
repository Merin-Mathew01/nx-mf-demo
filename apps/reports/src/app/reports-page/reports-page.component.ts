import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FooterComponent, NavbarComponent} from '@nx-demo/shared/ui'
import { KENDO_GRID, KENDO_GRID_EXCEL_EXPORT } from '@progress/kendo-angular-grid';
import { ExcelExportData } from '@progress/kendo-angular-excel-export';
import { ApiService } from '@nx-demo/shared/data-access'
import { fileExcelIcon, SVGIcon } from "@progress/kendo-svg-icons";
import { ChartsModule } from '@progress/kendo-angular-charts';




@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule,NavbarComponent,FooterComponent,KENDO_GRID,KENDO_GRID_EXCEL_EXPORT,ChartsModule],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
})
export class ReportsPageComponent {

  api = inject(ApiService)

  gridData = signal<any[]>([])
  columns = signal<any[]>([])

  columnGroups = [
    {
      title: 'Config 1',
      groupColor: '#2519d2',
      columnColor: '#3996e2',
      columns: ['AlarmName', 'VarName', 'Age']
    },
    {
      title: 'Config 2',
      groupColor: '#215a24',
      columnColor: '#6ca56e',
      columns: ['Gender', 'Department', 'Index', 'Timestamp']
    },
    {
      title: 'Config 3',
      groupColor: '#F57C00',
      columnColor: '#d8a65a',
      columns: ['Status', 'Calcno', 'Availability']
    },
    {
      title: 'Config 4',
      groupColor: '#f500cc',
      columnColor: '#cf74db',
      columns: ['Verified', 'Approved', 'Reviewed']
    }
  ];

  docId!: string;

  fileExcelIcon: SVGIcon = fileExcelIcon;

  statusChartData: any[] = [];
  departmentCategories: string[] = [];
  departmentValues: number[] = [];

  ngOnInit(){
   this.docId = sessionStorage.getItem('docId') || "";
     
    this.getExcelData()
  }

  getExcelData(){
    this.api.getExceldata(this.docId).subscribe({
    next: (res: any) => {
      console.log(res);
      const sheet = res.sheets[0];
      const data = sheet.rows.map((row: any) => ({
        ...row.data,
        rowIndex: row.rowIndex
      }));

      this.gridData.set(data);
      this.prepareStatusChart()
      this.prepareDepartmentChart()

      if (data.length) {
        this.columns.set(Object.keys(data[0]));
      }
    },
    error: (err) => {
      console.error(err);
    }
  })

  }

  // FN TO store data for excel export
  allData = (): ExcelExportData => {
    return { data: this.gridData() }
  }

  prepareStatusChart() {

  const counts: Record<string, number> = {};

  this.gridData().forEach((row: any) => {
    const status = row.Status;

    counts[status] = (counts[status] || 0) + 1;
  });

  this.statusChartData = Object.keys(counts).map(status => ({
    category: status,
    value: counts[status]
  }));

  console.log(this.statusChartData);
}

prepareDepartmentChart() {

  const counts: Record<string, number> = {};

  this.gridData().forEach((row: any) => {
    const department = row.Department;
    counts[department] = (counts[department] || 0) + 1;
  });

  this.departmentCategories = Object.keys(counts);
  this.departmentValues = Object.values(counts);
}
}

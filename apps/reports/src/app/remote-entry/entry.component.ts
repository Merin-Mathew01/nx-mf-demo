import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsPageComponent } from '../reports-page/reports-page.component';

@Component({
  standalone: true,
  imports: [CommonModule, ReportsPageComponent],
  selector: 'app-reports-entry',
  template: `<app-reports-page></app-reports-page>`,
})
export class RemoteEntryComponent {}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadPageComponent } from '../upload-page/upload-page.component';

@Component({
  standalone: true,
  imports: [CommonModule, UploadPageComponent],
  selector: 'app-upload-entry',
  template: `<app-upload-page></app-upload-page>`,
})
export class RemoteEntryComponent {}

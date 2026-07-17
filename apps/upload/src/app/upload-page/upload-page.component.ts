import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent, NavbarComponent } from '@nx-demo/shared/ui'
import {ApiService} from '@nx-demo/shared/data-access'


@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.scss',
})
export class UploadPageComponent {
  selectedFile: File | null = null;
  api = inject(ApiService)
  gridData = signal<any[]>([])


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

    // Call your upload service here
    this.api.uploadExcelAPI(this.selectedFile).subscribe({
        next: (res: any) => {
          this.gridData.set(res)
          console.log(this.gridData());
        }, error: (reason) => {
          console.log(reason);
        }
      })
  }
}
  



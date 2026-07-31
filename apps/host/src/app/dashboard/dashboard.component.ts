import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FooterComponent, NavbarComponent} from '@nx-demo/shared/ui'
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '@nx-demo/shared/data-access';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,NavbarComponent,RouterLink,FooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  documents: any[] = [];
  api = inject(ApiService)
  router = inject(Router)

  ngOnInit(){
    this.getAllUploadedDocuments()
  }

  getAllUploadedDocuments(){
    this.api.getAllUploadedDocuments().subscribe((res:any)=>{
      console.log(res);
      this.documents=res
    })
  }

  openFile(file: any) {
    sessionStorage.setItem('docId',file.documentId)
    this.router.navigateByUrl('/upload');
  }
}

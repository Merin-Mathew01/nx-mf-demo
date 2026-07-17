import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FooterComponent, NavbarComponent} from '@nx-demo/shared/ui'
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,NavbarComponent,RouterLink,FooterComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  
}

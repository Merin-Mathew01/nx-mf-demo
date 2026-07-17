import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FooterComponent, NavbarComponent} from '@nx-demo/shared/ui'


@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule,NavbarComponent,FooterComponent],
  templateUrl: './reports-page.component.html',
  styleUrl: './reports-page.component.scss',
})
export class ReportsPageComponent {}

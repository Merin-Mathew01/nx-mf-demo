import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'lib-navbar',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
   // to store and display user details
  username = ""
  route = inject(Router)

  ngOnInit() {
    this.username = sessionStorage.getItem('username') || ''
  }

  logout(){
    sessionStorage.clear()
    this.route.navigateByUrl('/')
  }
}

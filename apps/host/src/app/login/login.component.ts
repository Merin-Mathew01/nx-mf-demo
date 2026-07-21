import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {ApiService} from '@nx-demo/shared/data-access'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {

  fb = inject(FormBuilder)
  loginForm:FormGroup
  route = inject(Router)
  api = inject(ApiService)

  constructor(){
    this.loginForm = this.fb.group({
      username:['',[Validators.required,Validators.pattern('[a-zA-Z ]*')]],
      password:['',[Validators.required,Validators.pattern('[a-zA-Z0-9@#$& ]*'),Validators.minLength(6)]],
    }
    )
  }

  login(){
    if(this.loginForm.valid){
      this.api.loginAPI(this.loginForm.value).subscribe({
        next:((res:any)=>{
          const username = this.loginForm.value.username
          sessionStorage.setItem('username',username)
          alert(res.message)
          this.route.navigateByUrl('/dashboard')
        }),
        error:(reason)=>{
          console.log(reason);
        }
      })
    }else{
      alert("Form Invalid")
    }
  }


  logout(){
    sessionStorage.clear()
    this.route.navigateByUrl('/')
  }

}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  http = inject(HttpClient)
  server_url="http://10.15.51.152:5002/api"

// login api
loginAPI(body:any){
  return this.http.post( `${this.server_url}/test`,body)
}

// upload excel and read data
uploadExcelAPI(file:File){
  const formData = new FormData()
  formData.append('file',file)
  return this.http.post(`${this.server_url}/excel/readdata`,formData)
}

}

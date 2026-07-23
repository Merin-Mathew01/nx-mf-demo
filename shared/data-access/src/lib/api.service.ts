import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  http = inject(HttpClient)
  // server_url="http://10.15.51.152:5002/api"
  server_url="http://10.15.51.152:5284/api"

// login api
loginAPI(body:any){
  return this.http.post( `${this.server_url}/auth/login`,body)
}

// upload excel and read data
uploadExcelAPI(file:File){
  const formData = new FormData()
  formData.append('file',file)
  const token = sessionStorage.getItem('token');
  return this.http.post(`${this.server_url}/excel-documents/upload`,formData,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
}

updateExceldata(documentId: string,editedData :any) {
  const token = sessionStorage.getItem('token');
  return this.http.put(
    `${this.server_url}/excel-documents/${documentId}`,editedData,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}



}

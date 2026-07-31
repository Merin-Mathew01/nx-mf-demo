import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  http = inject(HttpClient)
  // server_url="http://10.15.51.152:5002/api"
  server_url="http://10.15.51.152:5284/api"
  // server_url="http://10.15.51.144:5284/api"

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
  return this.http.post(
    `${this.server_url}/excel-documents/${documentId}/versions`,editedData,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
}

getExceldata(documentId: string){
  const token = sessionStorage.getItem('token');
  return this.http.get(`${this.server_url}/excel-documents/${documentId}`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
}

getAllUploadedDocuments(){
  const token = sessionStorage.getItem('token');
  return this.http.get(`${this.server_url}/excel-documents`,{
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
}

editRow(documentId: string,sheetIndex: number,rowIndex: number) {
  const token = sessionStorage.getItem('token');
  return this.http.post(`${this.server_url}/excel-documents/${documentId}/sheets/${sheetIndex}/rows/${rowIndex}/edit`,{},
    {headers: {
        Authorization: `Bearer ${token}`
      }}
  );
}


getEditing(documentId: string){
  const token = sessionStorage.getItem('token');
  return this.http.get(`${this.server_url}/excel-documents/${documentId}/editing`,
    {headers: {
        Authorization: `Bearer ${token}`
      }}
  );
}

saveRow(documentId: string,sheetIndex: number,rowIndex: number,data:any) {
  const token = sessionStorage.getItem('token');
  return this.http.post(`${this.server_url}/excel-documents/${documentId}/sheets/${sheetIndex}/rows/${rowIndex}/save`,data,
    {headers: {
        Authorization: `Bearer ${token}`
      }}
  );
}
}
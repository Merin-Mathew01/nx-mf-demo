import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  http = inject(HttpClient)
  // server_url="http://10.15.51.152:5002/api"
  // server_url="http://10.15.51.152:5284/api"
  // server_url="http://10.15.51.144:5884/api"
  server_url="http://10.15.51.144:3457/api"

// login api
loginAPI(body:any){
  return this.http.post( `${this.server_url}/auth/login`,body)
}

// upload excel and read data
uploadExcelAPI(file:File){
  const formData = new FormData()
  formData.append('file',file)
  return this.http.post(`${this.server_url}/excel-documents/upload`,formData)
}

updateExceldata(documentId: string,editedData :any) {
  return this.http.post(
    `${this.server_url}/excel-documents/${documentId}/versions`,editedData);
}

getExceldata(documentId: string){
  return this.http.get(`${this.server_url}/excel-documents/${documentId}`)
}

getAllUploadedDocuments(){
  return this.http.get(`${this.server_url}/excel-documents`)
}

editRow(documentId: string,sheetIndex: number,rowIndex: number) {
  return this.http.post(`${this.server_url}/excel-documents/${documentId}/sheets/${sheetIndex}/rows/${rowIndex}/edit`,{});
}


getEditing(documentId: string){
  return this.http.get(`${this.server_url}/excel-documents/${documentId}/editing`);
}

saveRow(documentId: string,sheetIndex: number,rowIndex: number,data:any) {
  return this.http.post(`${this.server_url}/excel-documents/${documentId}/sheets/${sheetIndex}/rows/${rowIndex}/save`,data);
}

cancelRow(documentId: string, sheetIndex: number, rowIndex: number) {
  return this.http.post(
    `${this.server_url}/excel-documents/${documentId}/sheets/${sheetIndex}/rows/${rowIndex}/cancel`,{});

}
}
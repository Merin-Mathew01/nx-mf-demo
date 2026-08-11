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
  server_url="http://10.15.51.144:5444/api"

// login api
loginAPI(body:any){
  return this.http.post( `${this.server_url}/auth/login`,body)
}

// upload excel and read data
uploadExcelAPI(file:File){
  const formData = new FormData()
  formData.append('file',file)
  const accessToken = sessionStorage.getItem('accessToken');
  return this.http.post(`${this.server_url}/excel/upload`,formData,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
}

updateExceldata(documentId: string,editedData :any) {
  const accessToken = sessionStorage.getItem('accessToken');
  return this.http.post(
    `${this.server_url}/excel-documents/${documentId}/versions`,editedData,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );
}

getExceldata(documentId: string){
  const accessToken = sessionStorage.getItem('accessToken');
  return this.http.get(`${this.server_url}/excel-documents/${documentId}`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
}

getAllUploadedDocuments(){
  const accessToken = sessionStorage.getItem('accessToken');
  return this.http.get(`${this.server_url}/excel-documents`,{
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
}

editRow(documentId: string,sheetIndex: number,rowIndex: number) {
  const accessToken = sessionStorage.getItem('accessToken');
  return this.http.post(`${this.server_url}/excel-documents/${documentId}/sheets/${sheetIndex}/rows/${rowIndex}/edit`,{},
    {headers: {
        Authorization: `Bearer ${accessToken}`
      }}
  );
}


getEditing(documentId: string){
  const accessToken = sessionStorage.getItem('accessToken');
  return this.http.get(`${this.server_url}/excel-documents/${documentId}/editing`,
    {headers: {
        Authorization: `Bearer ${accessToken}`
      }}
  );
}

saveRow(documentId: string,sheetIndex: number,rowIndex: number,data:any) {
  const accessToken = sessionStorage.getItem('accessToken');
  return this.http.post(`${this.server_url}/excel-documents/${documentId}/sheets/${sheetIndex}/rows/${rowIndex}/save`,data,
    {headers: {
        Authorization: `Bearer ${accessToken}`
      }}
  );
}

cancelRow(documentId: string, sheetIndex: number, rowIndex: number) {
  const accessToken = sessionStorage.getItem('accessToken');
  return this.http.post(
    `${this.server_url}/excel-documents/${documentId}/sheets/${sheetIndex}/rows/${rowIndex}/cancel`,{},
    {
      headers: {
        Authorization: `Bearer ${accessToken }`
      }
    }
  );

}
}
// import { Injectable } from '@angular/core';
// import * as signalR from '@microsoft/signalr';

// @Injectable({
//   providedIn: 'root'
// })
// export class SignalrService {

//    private hubConnection!: signalR.HubConnection;

//   startConnection() {
//     this.hubConnection = new signalR.HubConnectionBuilder()
//       .withUrl('http://10.15.51.144:5884/excelHub') 
//       .withAutomaticReconnect()
//       .build();

//     return this.hubConnection.start();
//   }

//   stopConnection() {
//     return this.hubConnection.stop();
//   }

//   joinDocument(documentId: string) {
//     return this.hubConnection.invoke('JoinDocument', documentId);
//   }

//   leaveDocument(documentId: string) {
//     return this.hubConnection.invoke('LeaveDocument', documentId);
//   }

//   onRowLocked(callback: (data: any) => void) {
//     this.hubConnection.on('RowLocked', callback);
//   }

//   onRowUnlocked(callback: (data: any) => void) {
//     this.hubConnection.on('RowUnlocked', callback);
//   }
// }

// // import { Injectable } from '@angular/core';
// // import {
// //   HubConnection,
// //   HubConnectionBuilder,
// //   HubConnectionState,
// //   LogLevel,
// // } from '@microsoft/signalr';

// // @Injectable({
// //   providedIn: 'root',
// // })
// // export class SignalrService {
// //   private hubConnection: HubConnection | null = null;
// //   private hubUrl = 'http://10.15.51.144:5884/excelHub'; // pull from environment/config token instead

// //   get connectionState(): HubConnectionState | null {
// //     return this.hubConnection?.state ?? null;
// //   }

// //   startConnection(): Promise<void> {
// //     if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected) {
// //       return Promise.resolve(); // already connected/connecting — don't spin up a second one
// //     }

// //     this.hubConnection = new HubConnectionBuilder()
// //       .withUrl(this.hubUrl)
// //       .withAutomaticReconnect()
// //       .configureLogging(LogLevel.Warning)
// //       .build();

// //     this.hubConnection.onreconnected(() => {
// //       // re-join whatever document(s) were active before the drop
// //       // e.g. re-invoke JoinDocument here if you're tracking current documentId
// //     });

// //     this.hubConnection.onclose((err) => {
// //       console.warn('SignalR connection closed', err);
// //     });

// //     return this.hubConnection.start();
// //   }

// //   stopConnection(): Promise<void> {
// //     return this.hubConnection?.stop() ?? Promise.resolve();
// //   }

// //   joinDocument(documentId: string) {
// //     this.assertConnected();
// //     return this.hubConnection!.invoke('JoinDocument', documentId);
// //   }

// //   leaveDocument(documentId: string) {
// //     this.assertConnected();
// //     return this.hubConnection!.invoke('LeaveDocument', documentId);
// //   }

// //   onRowLocked(callback: (data: any) => void) {
// //     this.hubConnection?.on('RowLocked', callback);
// //   }

// //   onRowUnlocked(callback: (data: any) => void) {
// //     this.hubConnection?.on('RowUnlocked', callback);
// //   }

// //   private assertConnected() {
// //     if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
// //       throw new Error('SignalR hub is not connected. Call startConnection() first.');
// //     }
// //   }
// // }
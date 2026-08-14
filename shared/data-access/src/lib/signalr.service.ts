import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
export type ConnectionState = 'connected' | 'reconnecting' | 'disconnected';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {

  private hubConnection!: signalR.HubConnection;


  // item 6: connection-state signal for the UI badge
  connectionState = signal<ConnectionState>('disconnected');

  startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://10.15.51.144:3457/excelHub', {
        accessTokenFactory: () => sessionStorage.getItem('token') ?? '', withCredentials: false
      })
      // .withUrl('http://10.15.51.152:5284/excelHub',{
      //   accessTokenFactory: () => sessionStorage.getItem('token') ?? '',withCredentials: false
      // }) 
      .withAutomaticReconnect({
        // item 2: uncapped backoff — keeps retrying forever at 30s intervals
        // instead of SignalR's default (0/2/10/30s then permanently gives up)
        nextRetryDelayInMilliseconds: retryContext => {
          const delays = [0, 2000, 5000, 10000, 20000];
          return delays[retryContext.previousRetryCount] ?? 30000;
        }
      })
      .build();

    // item 1: lifecycle handlers, updating the shared state signal
    this.hubConnection.onreconnecting(() => {
      console.log('SignalR reconnecting...');
      this.connectionState.set('reconnecting');
    });

    this.hubConnection.onreconnected(() => {
      console.log('SignalR reconnected');
      this.connectionState.set('connected');
    });

    this.hubConnection.onclose(() => {
      console.log('SignalR closed');
      this.connectionState.set('disconnected');
    });

    return this.hubConnection.start()
      .then(() => {
        this.connectionState.set('connected');
      })
      .catch(err => {
        this.connectionState.set('disconnected');
        throw err; // let the component catch this and start polling (item 7)
      });
  
}



stopConnection() {
  if (this.hubConnection && this.hubConnection.state !== signalR.HubConnectionState.Disconnected) {
    return this.hubConnection.stop();
  }
  return Promise.resolve();
}

joinDocument(documentId: string) {
  return this.hubConnection.invoke('JoinDocument', documentId);
}

leaveDocument(documentId: string) {
  return this.hubConnection.invoke('LeaveDocument', documentId);
}

// item 1: expose hooks so the component can react (join, reconcile, polling)
onReconnecting(callback: () => void) {
  this.hubConnection.onreconnecting(callback);
}

onReconnected(callback: () => void) {
  this.hubConnection.onreconnected(callback);
}

onClose(callback: () => void) {
  this.hubConnection.onclose(callback);
}

onRowLocked(callback: (data: any) => void) {
  this.hubConnection.on('RowLocked', callback);
}

onRowUnlocked(callback: (data: any) => void) {
  this.hubConnection.on('RowUnlocked', callback);
}

onRowUpdated(callback: (data: any) => void) {
  this.hubConnection.on('RowUpdated', callback);
}

removeListeners() {
  this.hubConnection.off('RowLocked');
  this.hubConnection.off('RowUnlocked');
  this.hubConnection.off('RowUpdated');
}
}

// import { Injectable } from '@angular/core';
// import {
//   HubConnection,
//   HubConnectionBuilder,
//   HubConnectionState,
//   LogLevel,
// } from '@microsoft/signalr';

// @Injectable({
//   providedIn: 'root',
// })
// export class SignalrService {
//   private hubConnection: HubConnection | null = null;
//   private hubUrl = 'http://10.15.51.144:5884/excelHub'; // pull from environment/config token instead

//   get connectionState(): HubConnectionState | null {
//     return this.hubConnection?.state ?? null;
//   }

//   startConnection(): Promise<void> {
//     if (this.hubConnection && this.hubConnection.state !== HubConnectionState.Disconnected) {
//       return Promise.resolve(); // already connected/connecting — don't spin up a second one
//     }

//     this.hubConnection = new HubConnectionBuilder()
//       .withUrl(this.hubUrl)
//       .withAutomaticReconnect()
//       .configureLogging(LogLevel.Warning)
//       .build();

//     this.hubConnection.onreconnected(() => {
//       // re-join whatever document(s) were active before the drop
//       // e.g. re-invoke JoinDocument here if you're tracking current documentId
//     });

//     this.hubConnection.onclose((err) => {
//       console.warn('SignalR connection closed', err);
//     });

//     return this.hubConnection.start();
//   }

//   stopConnection(): Promise<void> {
//     return this.hubConnection?.stop() ?? Promise.resolve();
//   }

//   joinDocument(documentId: string) {
//     this.assertConnected();
//     return this.hubConnection!.invoke('JoinDocument', documentId);
//   }

//   leaveDocument(documentId: string) {
//     this.assertConnected();
//     return this.hubConnection!.invoke('LeaveDocument', documentId);
//   }

//   onRowLocked(callback: (data: any) => void) {
//     this.hubConnection?.on('RowLocked', callback);
//   }

//   onRowUnlocked(callback: (data: any) => void) {
//     this.hubConnection?.on('RowUnlocked', callback);
//   }

//   private assertConnected() {
//     if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
//       throw new Error('SignalR hub is not connected. Call startConnection() first.');
//     }
//   }
// }
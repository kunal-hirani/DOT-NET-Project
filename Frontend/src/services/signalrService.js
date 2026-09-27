import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  startConnection() {
    if (this.connection) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5000/hubs/election', {
        accessTokenFactory: () => localStorage.getItem('voting_token') || ''
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.connection.onreconnecting(() => {
      this.isConnected = false;
      this.notifyStatusChange(false);
    });

    this.connection.onreconnected(() => {
      this.isConnected = true;
      this.notifyStatusChange(true);
    });

    this.connection.onclose(() => {
      this.isConnected = false;
      this.notifyStatusChange(false);
    });

    this.connection
      .start()
      .then(() => {
        this.isConnected = true;
        this.notifyStatusChange(true);
        console.log('SignalR Hub Connected successfully.');
      })
      .catch((err) => {
        console.error('SignalR Connection Error: ', err);
        this.isConnected = false;
        this.notifyStatusChange(false);
      });
  }

  joinElection(electionId) {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('JoinElectionGroup', electionId).catch(console.error);
    }
  }

  joinAdminDashboard() {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      this.connection.invoke('JoinAdminDashboard').catch(console.error);
    }
  }

  onVoteUpdate(callback) {
    if (this.connection) {
      this.connection.off('ReceiveVoteUpdate');
      this.connection.on('ReceiveVoteUpdate', callback);
    }
  }

  onDashboardUpdate(callback) {
    if (this.connection) {
      this.connection.off('ReceiveDashboardUpdate');
      this.connection.on('ReceiveDashboardUpdate', callback);
    }
  }

  onStatusChange(listener) {
    this.listeners.set(listener, listener);
  }

  offStatusChange(listener) {
    this.listeners.delete(listener);
  }

  notifyStatusChange(status) {
    this.listeners.forEach((callback) => callback(status));
  }

  stopConnection() {
    if (this.connection) {
      this.connection.stop();
      this.connection = null;
      this.isConnected = false;
    }
  }
}

export const signalRService = new SignalRService();

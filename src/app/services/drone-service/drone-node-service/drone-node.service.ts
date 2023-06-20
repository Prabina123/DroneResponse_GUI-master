import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { io } from 'socket.io-client';


@Injectable({
  providedIn: 'root'
})

export class DroneNodeService {
  socket: any;

  constructor() {
    this.setupSocketConnection();
  }

  setupSocketConnection() {
    let connectionOptions = {
      'forceNew': true,
      'reconnectionAttempts': Infinity,  // Avoid having user reconnect manually in order to prevent dead clients after a server restart
      'timeout': 10000,                  // Before connect_error and connect_timeout are emitted.
      'transports': ['websocket']
    };
    this.socket = io(environment.DRONE_SOCKET_ENDPOINT, connectionOptions);
  }
}

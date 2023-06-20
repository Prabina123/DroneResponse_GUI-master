import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class MapNodeService {
  socket: any;

  constructor() {
    this.setupSocketConnection();
  }

  setupSocketConnection() {
    let connectionOptions = {
      'forceNew': true,
      'reconnectionAttempts': Infinity, //avoid having user reconnect manually in order to prevent dead clients after a server restart
      'timeout': 10000,                  //before connect_error and connect_timeout are emitted.
      'transports': ['websocket']
    };
    this.socket = io(environment.MAP_SOCKET_ENDPOINT, connectionOptions);
  }

}

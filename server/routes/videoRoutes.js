// Import event names
const events = require('../events');
const logger = require('../logger/logger')

const WebSocket = require('ws');
const SOCKET_PORT = 6001;

// Import service for videos
const VideoService = require('../services/videoService');
const videoService = new VideoService();

// Set up websocket server
let socketServer = new WebSocket.Server({ port: SOCKET_PORT, perMessageDeflate: false });
socketServer.connectionCount = 0;

// Add new socket when a drone connects to the application
const newConnection = (server, socket, upgradeReq) => {
  server.connectionCount++;
  let droneID = (upgradeReq || socket.upgradeReq).url.substr(1);
  videoService.setSocketByID(droneID, socket);

  logger.info(
    'New WebSocket Connection: ',
    (upgradeReq || socket.upgradeReq).socket.remoteAddress,
    (upgradeReq || socket.upgradeReq).headers['user-agent'],
    '(' + server.connectionCount + ' total)'
  );
};

const closeConnection = (server) => {
  server.connectionCount--;
  logger.info(
    `Disconnected WebSocket (${server.connectionCount} total)`
  );
};

// Add new socket on connections
socketServer.on(events.CONNECTION, (socket, upgradeReq) => {
  newConnection(socketServer, socket, upgradeReq);

  socket.on(events.END, (code, message) => {
    closeConnection(socketServer);
  });
});

module.exports = socketServer;

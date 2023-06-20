const logger = require('./logger/logger');

// Check current environment
require('dotenv').config();
logger.info(`Server operating in ${process.env.MODE} mode`);

// Import event names
const events = require('./events');

// Set ports
const CLIENT_SOCKET_PORT = 6002;
const DRONE_SOCKET_PORT = 6003;
const STREAM_PORT = 8081;
const AR_CLIENT_SOCKET_PORT = 7001;

// Import libraries and services
const io = require('socket.io');
const http = require('http');
const mqtt = require('mqtt');
const VideoService = require('./services/videoService');
const videoService = new VideoService();

// MongoDB
const mongoose = require('mongoose');
// const configDB = require('./data/config/database');

mongoose.connect(process.env.MONGODB_URI, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
}, (err) => {
  if (err) {
    logger.error(`${err}: Cannot connect to MongoDB; Please check MongoDB connection string in the MONGODB_URI enviroment variable`);
  } else {
    logger.info(`Successfully connected to MongoDB at address ${process.env.MONGODB_URI}`);
  }
});


const hostname = '0.0.0.0';
const port = 8081;
// Create HTTP Server
const httpServer = http.createServer(function (req, res) {
  let droneID = req.url.substr(1);

  logger.info(`Stream connected: ${req.socket.remoteAddress}:${req.socket.remotePort}`);

  req.on(events.DATA, (data) => {
    let toSockets = videoService.getSocketByID(droneID);
    if (toSockets) {
      for (let socket of toSockets) {
        socket.send(data);
      }
    }
  });

  req.on(events.END, () => {
    logger.info(`Stream ended: ${droneID}`);
  });
}).listen(port, hostname, () => {
  logger.info(`Server running at http://${hostname}:${port}/`);
}).on('connection', () => {
  logger.info(`A client connected to http://${hostname}:${port}/`);
});


const clientIo = io(httpServer).listen(CLIENT_SOCKET_PORT);
const droneIo = io(httpServer).listen(DRONE_SOCKET_PORT);
const arIO = io(httpServer).listen(AR_CLIENT_SOCKET_PORT);

const droneMQTT = mqtt.connect(process.env.MQTT_BROKER_ADDRESS);

// Import route files
const mapRoutes = require('./routes/mapRoutes')(clientIo, droneMQTT);
const weatherRoutes = require('./routes/weatherRoutes')(clientIo);
const droneRoutes = require('./routes/droneRoutes')(droneIo, droneMQTT);
const missionRoutes = require('./routes/missionRoutes')(clientIo);
const videoRoutes = require('./routes/videoRoutes');
const flightRoutes = require('./routes/flightRoutes')(clientIo);
const regionRoutes = require('./routes/regionRoutes')(clientIo);
const arRoutes = require('./routes/arRoutes')(arIO, clientIo);
// const drPOIRoutes = require('./routes/arRoutes')(clientIo);


// Keep the socket open for streaming
httpServer.headersTimeout = 0;
httpServer.listen(STREAM_PORT)
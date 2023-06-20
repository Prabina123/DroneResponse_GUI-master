// Import event names
const events = require('../events');
const logger = require('../logger/logger')

// Import service for maps
const MapService = require('../services/mapService');
const mapService = new MapService();

module.exports = (io, mqttClient) => {
  // Update new user with map data
  const newUser = (socket) => {
    socket.emit(events.MAP_NEW_USER, mapService.getDataForAllLayers());
  };

  // Update layers when an object is created
  const drawObjects = (data) => {
    mapService.setDataByLayer(data.layer, data.geojson);
    io.emit(events.MAP_DRAW_OBJECTS, mapService.getDataByLayer(data.layer));
  };

  io.on(events.CONNECTION, (socket) => {
    logger.info('User connected');

    // Listen for new users
    socket.on(events.ON_MAP_LOAD, () => {
      newUser(socket);
    });

    // Listen for object creation
    socket.on(events.ON_MAP_CREATION, (data) => {
      drawObjects(data);
    });

    socket.on(events.DISCONNECT, () => {
      logger.info('User disconnected');
    });

    socket.on(events.ON_MISSION, (data) => {
      logger.info(`Mission received from DroneResponse UI: ${data}`);
      mqttClient.publish('microservice/mission-spec', data);
    })
  });
};

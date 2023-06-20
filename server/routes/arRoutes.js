// Import event names
const events = require('../events');
const logger = require('../logger/logger');

// Import service for AR
const ARService = require('../services/arService');
const arService = new ARService();

module.exports = (io, drio) => {
  // Add new object in the virtual world
  const addObject = (socket, virtualObjectData) => {
    arService.addVirtualObject(virtualObjectData);
    logger.info(JSON.parse(virtualObjectData));
    logger.info('Syncing this new object with all clients');
    socket.broadcast.emit(events.SYNC_OBJECT, JSON.parse(virtualObjectData));

    // synchronize drone response client with this new virtual object
    drio.emit(events.SYNC_OBJECT, JSON.parse(virtualObjectData));
  }

  const getVirtualWorld = (socket, drio) => {
    let vWorld = arService.getAllVirtualObjects()
    logger.info('Ready to sync the world with Unity and Droneresponse Clients');
    if (vWorld.length > 0) {
      logger.info('Sending data to the unity client');
      logger.info(`Number of entities: ${vWorld.length}`);
      socket.emit(events.SYNC_WORLD, { Entries: vWorld });
    }
  }

  io.on(events.CONNECTION, (socket) => {
    logger.info('Unity Client connected');
    getVirtualWorld(socket, drio);

    // Listen for object creation from unity
    socket.on(events.ADD_OBJECT, (virtualObject) => {
      addObject(socket, virtualObject);
    });

    socket.on(events.DISCONNECT, () => {
      logger.info('Unity Client disconnected');
    });

  });

  drio.on(events.CONNECTION, (socket) => {
    let vWorld = arService.getAllVirtualObjects();
    if (vWorld.length > 0) {
      socket.emit(events.SYNC_WORLD, { Entries: vWorld });
    }
  });
};

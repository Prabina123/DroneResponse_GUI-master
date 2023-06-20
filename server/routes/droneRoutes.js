// Import event names
const events = require('../events');
const logger = require('../logger/logger');
require('dotenv').config();

// Import service for drones
const DroneService = require('../services/droneService');
const droneService = new DroneService();

module.exports = (io, client) => {
  const updateDrones = () => {
    io.emit(events.DRONE_UPDATE, droneService.getAllDrones());
  };

  // Adds new drone to server and client
  const newDrone = (data) => {
    droneService.addNewDrone(data);
    io.emit(events.DRONE_ADD, droneService.getDroneByID(data.uavid));
  };

  const newMockDrone = (data) => {
    droneService.addNewDrone(data);
    io.emit(events.DRONE_ADD, droneService.getDroneByID(data.uavid));
  }

  const updateDrone = (data) => {
    droneService.updateDrone(data);
    updateDrones();
  };

  // Removes drone from server and client
  const removeDrone = (data) => {
    io.emit(events.DRONE_REMOVE, data.uavid);
    droneService.removeDroneByID(data.uavid);
    droneService.removeStatusByID(data.uavid);
    updateDrones();
  };

  // Sends state changes to viz
  const stateChanged = (data) => {
    io.emit(events.STATE_CHANGED, data);
  }

  // Runs commands on the drone (possibly refactor to use a map/dictionary)
  const runCommand = (cmd, drones, data) => {
    if (cmd === events.SET_GEOFENCE) {
      for (let id of drones) {
        updateGeoFence(id, data);
      }
    }
    if (cmd.endsWith('arm')) {
      for (let id of drones) {
        armCmd = {
          'command': 'setArmed',
          'uavid': id,
          'timestamp': Date.now(),
          'msgid': 5,
          'data': {
            'armed': cmd == 'arm' ? true : false
          }
        }
        io.emit(events.ARM_DRONE, armCmd)
      }
    }
  };

  // Command functions
  const updateGeoFence = (id, data) => {
    logger.info('Adding geofence');
    toSockets = droneService.getSocketByID(id);
    if (toSockets) {
      for (let socket of toSockets) {
        socket.emit(events.DRONE_GEOFENCE, data);
      }
    }
  };

  const updateArmingStatus = (data) => {
    droneService.addStatusByID(data.uavid, data);
    io.emit(events.UPDATE_STATUS, data);
  };

  const updateAllStatuses = () => {
    statusList = droneService.getAllStatuses();
    for (let drone of statusList) {
      for (let data of drone) {
        io.emit(events.UPDATE_STATUS, data);
      }
    }
  };

  // Set up MQTT client
  client.on(events.MQTT_CONNECT, () => {
    logger.info(`Successfully connected to MQTT broker at ${process.env.MQTT_BROKER_ADDRESS}`);

    client.subscribe(events.ON_NEW_DRONE, (err) => {
      if (err) {
        logger.error('Unable to subscribe to new_drone topic');
      }
    });

    client.subscribe(events.ON_ARMING_STATUS_UPDATE, (err) => {
      if (err) {
        logger.error('Unable to subscribe to arming_status_update topic');
      }
    });

    client.subscribe(events.ON_UPDATE_DRONE, (err) => {
      if (err) {
        logger.error('Unable to subscribe to update_drone topic');
      }
    });

    client.subscribe(events.ON_DRONE_DISCONNECT, (err) => {
      if (err) {
        logger.error('Unable to subscribe to drone_disconnect topic');
      }
    });

    client.subscribe(events.ON_STATE_CHANGED, (err) => {
      if (err) {
        logger.error('Unable to subscribe to state_changed topic');
      }
    });

  });


  client.on('message', (topic, message) => {
    // Workaround that replaces NaN with null in the JSON string
    // let data = JSON.parse(yourString.replace(/\bNaN\b/g, "null"));

    // Try/catch block to catch cases when an invalid JSON string is sent from the drone
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      console.log(`Error parsing drone JSON string: ${e}`);
      return;
    }

    if (topic == events.ON_NEW_DRONE) {
      newDrone(data);
    }
    else if (topic == events.ON_ARMING_STATUS_UPDATE) {
      updateArmingStatus(data);
    }
    else if (topic == events.ON_UPDATE_DRONE) {
      updateDrone(data);
    }
    else if (topic == events.ON_DRONE_DISCONNECT) {
      removeDrone(data);
    }
    else if (topic == events.ON_STATE_CHANGED) {
      stateChanged(data);
    }
  });

  // Messages from DroneResponse UI
  io.on(events.CONNECTION, (socket) => {
    // Update new client with drones
    socket.on(events.DRONE_LOAD, () => {
      updateDrones();
    });

    // Commands from client
    socket.on(events.ON_DRONE_COMMAND, (data) => {
      let cmd = data.type;
      let drones = data.uavids;
      let info = data.info;
      runCommand(cmd, drones, info);
    });

    // Sends alerts for detected objects
    socket.on(events.ON_DRONE_ALERT, (data) => {
      io.emit(events.DRONE_SEND_ALERT,
        { type: data.type, uavid: data.data.uavid, data: data.data }
      );
    });

    // Disconnect alerts on undetected
    socket.on(events.OFF_DRONE_ALERT, (data) => {
      io.emit(events.DRONE_REMOVE_ALERT,
        { type: data.type, uavid: data.uavid }
      );
    });

    // Create new mission for graphviz from json file sent in
    socket.on(events.ON_STATE_CHANGED, (data) => {
      newMission(data);
    });

    // Update drones from GCS
    socket.on(events.ON_UPDATE_DRONE, (data) => {
      updateDrone(data);
    });

    // Get arming status updates from GCS
    socket.on(events.ON_LOAD_ARMING_STATUSES, () => {
      updateAllStatuses();
    });

    // Removes drones on disconnect
    socket.on(events.ON_DRONE_DISCONNECT, (data) => {
      logger.info('Disconnecting drone');
      droneService.removeSocketByID(data.uavid);
      removeDrone(data);
    });

    socket.on(events.NEW_DRONE_MISSION, (data) => {
      let mission = data.mission;
      let topic = data.topic;
      client.publish(topic, mission);
    });
  });

  if (process.env.MODE == 'DEBUG') {
    const mock_drones = require('../mock_data/drones.json')
    drones = mock_drones['drones']
    drones.forEach(drone => {
      logger.debug('Adding mock drone');
      newMockDrone(drone)
    });
  }
};

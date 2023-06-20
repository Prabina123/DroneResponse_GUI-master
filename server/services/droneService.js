const DroneData = require('../data/droneData');
const droneData = new DroneData();

module.exports = class DroneService {
  getAllDrones() {
    return droneData.getDrones();
  }

  getDroneByID(uavid) {
    return droneData.getDrone(uavid);
  }

  addNewDrone(drone) {
    return droneData.addDrone(drone);
  }

  updateDrone(drone) {
    // if (this.getDroneByID(drone.uavid)) {
    //   return droneData.addDrone(drone);
    // }
    return droneData.addDrone(drone);
  }

  removeDroneByID(uavid) {
    return droneData.removeDrone(uavid);
  }

  getSocketByID(uavid) {
    return droneData.getDroneSocket(uavid);
  }

  setSocketByID(uavid, socket) {
    droneData.setDroneSocket(uavid, socket);
  }

  removeSocketByID(uavid) {
    droneData.removeDroneSocket(uavid);
  }

  addStatusByID(uavid, data) {
    droneData.addStatus(uavid, data);
  }

  removeStatusByID(uavid) {
    droneData.removeStatus(uavid);
  }

  getAllStatuses() {
    return droneData.getStatuses();
  }
};

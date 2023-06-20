module.exports = class DroneData {
  constructor() {
    this.drones = {};
    this.sockets = {};
    this.statuses = {};
  }

  getDrones() {
    return Object.values(this.drones);
  }

  getDrone(uavid) {
    return this.drones[uavid];
  }

  addDrone(drone) {
    return this.drones[drone.uavid] = drone;
  }

  removeDrone(uavid) {
    delete this.drones[uavid];
  }

  getDroneSocket(id) {
    return this.sockets[id];
  }

  setDroneSocket(id, socket) {
    if (!this.sockets[id]) {
      this.sockets[id] = [];
    }
    this.sockets[id].push(socket);
  }

  removeDroneSocket(id) {
    delete this.sockets[id];
  }

  addStatus(uavid, data) {
    if (!this.statuses[uavid]) {
      this.statuses[uavid] = [];
    }
    this.statuses[uavid].push(data);
  }

  getStatuses() {
    return Object.values(this.statuses);
  }

  removeStatus(uavid) {
    delete this.statuses[uavid];
  }
};

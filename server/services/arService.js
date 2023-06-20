const ARData = require('../data/arData');
const arData = new ARData();

module.exports = class ARService {
  addNewClient(client) {
    arData.addNewClient(client);
  }

  removeClient(clientId) {
    arData.removeClient(clientId);
  }

  getClientById(id) {
    client = arData.getClientById(id);
  }

  addVirtualObject(virtualObject) {
    arData.addVirtualObject(virtualObject);
  }

  getAllVirtualObjects() {
    return arData.getAllVirtualObjects();
  }
};
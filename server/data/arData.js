module.exports = class ARData {
  constructor() {
    this.virtualObjects = []
  }

  // Virtual Object Data
  getAllVirtualObjects() {
    return this.virtualObjects;
  }

  addVirtualObject(virtualObject) {
    this.virtualObjects.push(JSON.parse(virtualObject));
  }
};

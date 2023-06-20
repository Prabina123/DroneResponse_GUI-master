const MapData = require('../data/mapData');
const mapData = new MapData();

module.exports = class MapService {
  getDataByLayer(layer) {
    return mapData.getLayer(layer);
  }

  getDataForAllLayers() {
    return mapData.getAllLayers();
  }

  setDataByLayer(layer, data) {
    return mapData.setLayer(layer, data);
  }
};

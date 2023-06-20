const geojsonTemplate = {
  type: 'FeatureCollection',
  features: []
};

module.exports = class MapData {
  constructor() {
    this.geojson = {
      truck: geojsonTemplate,
      home: geojsonTemplate,
      polygon: geojsonTemplate,
      search: geojsonTemplate,
      drone: geojsonTemplate,
      tails: geojsonTemplate,
      heads: geojsonTemplate,
      startingPoints: geojsonTemplate,
      routeLines: geojsonTemplate,
      routePoints: geojsonTemplate,
      waypoints: JSON
    };
  }

  getAllLayers() {
    return this.geojson;
  }

  getLayer(layer) {
    return { layer: layer, geojson: this.geojson[layer] };
  }

  setLayer(layer, data) {
    this.geojson[layer] = data;
  }
};

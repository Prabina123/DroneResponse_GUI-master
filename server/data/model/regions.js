const mongoose = require('mongoose')

const regionSchema = new mongoose.Schema({
  name: String,
  multiLineData: Object,
  startingPoints: Object,
  layerGeojson: Object,
  searchGeojson: Object,
  polygonNumber: String,
  altitude: Number,
  speed: Number,
  created: {
    type: Date,
    default: Date.now
  }
});

const Region = mongoose.model('regions', regionSchema);
module.exports = Region;

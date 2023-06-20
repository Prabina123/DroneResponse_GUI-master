const mongoose = require('mongoose');

const missionJsonSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  droneCount: Number,
  missionList: [String]
});

const MissionJson = mongoose.model('MissionJson', missionJsonSchema);

module.exports = MissionJson;
const mongoose = require('mongoose');
const MissionJson = require('./model/missionJson');
const logger = require('../logger/logger');

module.exports = class MissionData {
  async getMissions() {
    // Return all missions from the database
    let missions = await MissionJson.find({}).catch((err) => {
      logger.error(`Could not fetch missions from database: ${err}`);
    });
    if (missions == undefined) {
      return;
    }

    return missions; 
  }

  async addMission(mission) {
    const newMission = new MissionJson(mission)
    await newMission.save().then(() => {
      MissionJson.findOne({ name: mission.name }, (error, _) => {
        if (error) {
          logger.error(`Failed to save mission ${mission.name} in the database\n error: ${error}`);
        } else {
          logger.info(`New mission ${mission.name} added successfully`);
        }
      });
    }).catch((error) => {
      logger.error(`Error saving mission:\n ${error.message}`);
    });
  }

  async removeMission(name) {
    // Finds and deletes a mission by its ID
    await MissionJson.deleteOne({ name: name }, (error, _) => {
      if (error) {
        logger.error(`Failed to remove mission ${name} from the database`);
      }
      else {
        logger.info(`Mission ${name} removed successfully from the database`);
      }
    });
  }
}
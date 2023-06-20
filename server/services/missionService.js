const MissionData = require('../data/missionData');
const missionData = new MissionData();

module.exports = class MissionService {
  async getAllMissions() {
    return await missionData.getMissions();
  }

  async addNewMission(mission) {
    await missionData.addMission(mission);
  }

  async removeMissionByName(name) {
    await missionData.removeMission(name);
  }
};
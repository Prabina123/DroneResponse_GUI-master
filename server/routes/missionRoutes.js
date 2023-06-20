const events = require('../events');
const logger = require('../logger/logger')

const MissionService = require('../services/missionService');
const missionService = new MissionService();

module.exports = (io) => {
  io.on(events.CONNECTION, (socket) => {
    socket.on(events.NEW_MISSION_JSON, async (mission) => {
      await missionService.addNewMission(mission);
      let missions = await missionService.getAllMissions();
      io.emit(events.ON_SYNC_MISSION_JSONS, missions);
    });

    socket.on(events.GET_ALL_MISSION_JSONS, async () => {
      let missions = await missionService.getAllMissions();
      io.emit(events.ON_SYNC_MISSION_JSONS, missions);
    });

    socket.on(events.DELETE_MISSION_JSON, async (missionName) => {
      await missionService.removeMissionByName(missionName);
      let missions = await missionService.getAllMissions();
      io.emit(events.ON_SYNC_MISSION_JSONS, missions);
    });
  });
};
// Import event names
const events = require('../events');
const logger = require('../logger/logger')

// Import service for maps
const RegionService = require('../services/regionService');
const regionService = new RegionService();

module.exports = (io) => {
  // Update a new user with the existing flight path data
  const getRegions = async (socket) => {
    const regions = await regionService.getRegions()
    // socket.emit(events.DRAW_REGIONS, regions);
    return regions;
  };

  // Add a new flight path to the source data
  const saveRegion = async (data) => {
    await regionService.createRegion(data);
    const regions = await regionService.getRegions()
    io.emit(events.DRAW_REGIONS, regions);
    return region;
  };

  io.on(events.CONNECTION, (socket) => {
    // Listen for new users to set the flight route data
    // socket.on(events.GET_REGIONS, async (callback) => {

    //   const regions = await getRegions(socket);
    //   callback(regions)
    // });
    socket.on(events.GET_REGIONS, async () => {
      socket.emit(events.DRAW_REGIONS, await regionService.getRegions());
    });

    // Listen for new flight path creation to sync the data
    // socket.on(events.SAVE_REGION, (data) => {
    //   saveRegion(data);
    socket.on(events.SAVE_REGION, async (data, callback) => {
      const region = await saveRegion(data);
      callback(region);
    });

    socket.on(events.UPDATE_REGION, async (data) => {
      await regionService.updateRegion(data.id, data.data)
      const regions = await regionService.getRegions()
      io.emit(events.DRAW_REGIONS, regions);
    });

    socket.on(events.DELETE_REGION, async (id, callback) => {
      await regionService.deleteRegion(id);
      const regions = await regionService.getRegions()
      io.emit(events.DRAW_REGIONS, regions);
      callback(id)
    });
  });
};

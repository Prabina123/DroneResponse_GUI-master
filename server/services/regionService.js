const RegionData = require('../data/regionData');
const regionData = new RegionData();

module.exports = class RegionService {
  async getRegions() {
    return await regionData.getRegions();
  }

  async createRegion(data) {
    // await regionData.createRegion(data);
    return regionData.createRegion(data);
  }

  async deleteRegion(id) {
    await regionData.deleteRegion(id);
  }

  async updateRegion(id, data) {
    await regionData.updateRegion(id, data);
  }
};

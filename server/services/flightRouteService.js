const FlightRouteData = require('../data/flightRouteData');
const flightRouteData = new FlightRouteData();

module.exports = class FlightRouteService {
  async getFlightPathSourceData() {
    return await flightRouteData.getSourceData();
  }

  async setFlightPathSourceData(data) {
    await flightRouteData.addNewSourceData(data);
  }

  async removeFlightPathData(id) {
    await flightRouteData.removeSourceData(id);
  }

  async updateFlightRoute(route) {
    await flightRouteData.updateFlightRoute(route);
  }
};

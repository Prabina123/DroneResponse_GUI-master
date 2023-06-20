// Import event names
const events = require('../events');

// Import service for maps
const FlightRouteService = require('../services/flightRouteService');
const flightRouteService = new FlightRouteService();

module.exports = (io) => {
  // Update a new user with the existing flight path data
  const newUser = async (socket) => {
    socket.emit(events.FLIGHT_ROUTE_NEW_USER, await flightRouteService.getFlightPathSourceData());
  };

  // Add a new flight path to the source data
  const addNewFlightPath = async (data) => {
    await flightRouteService.setFlightPathSourceData(data);
    io.emit(events.FLIGHT_ROUTE_DRAW, await flightRouteService.getFlightPathSourceData());
  };

  // Delete a specific flight path from the source data
  const deleteFlightPath = async (id) => {
    await flightRouteService.removeFlightPathData(id);
    io.emit(events.FLIGHT_ROUTE_REMOVED, await flightRouteService.getFlightPathSourceData());
  };

  // Update a flight route and resend the data for all users to hear
  const updateRoute = async (route) => {
    // Update the flight route
    await flightRouteService.updateFlightRoute(route);
    // Send out the new data to all users to keep updated
    io.emit(events.FLIGHT_ROUTE_NEW_USER, await flightRouteService.getFlightPathSourceData());
  }
  io.on(events.CONNECTION, (socket) => {
    // Listen for new users to set the flight route data
    socket.on(events.ON_MAP_LOAD, async () => {
      await newUser(socket);
    });

    // Listen for new flight path creation to sync the data
    socket.on(events.ON_FLIGHT_ROUTE_CREATED, async (data) => {
      await addNewFlightPath(data);
    });

    // Listen for a flight path to delete and sync the data
    socket.on(events.ON_FLIGHT_ROUTE_DELETED, async (id) => {
      await deleteFlightPath(id);
    });

    // Listen for a flight route update
    socket.on(events.FLIGHT_ROUTE_UPDATE, async (route) => {
      await updateRoute(route);
    });
  });
};

const { Mongoose } = require('mongoose');
const FlightRoute = require('./model/flightRoute');
const logger = require('../logger/logger');

module.exports = class FlightRouteData {
  constructor() {
    this.idCount = 0;
  }

  // Loads all routes from the database into a source that can be sent to the frontend
  async getSourceData() {
    let routeSources = []; 
    // Return all route from the database
    let routes = await FlightRoute.find({}).catch((err) => {
      logger.error(`Could not fetch routes from database: ${err}`);
    });
    if (routes == undefined) {
      return;
    }

    this.idCount = routes.length > 0 ? routes.length : 0;
    // Create a map of each route's ID to its data
    for (let i = 0; i < routes.length; i++) {
      routeSources.push(routes[i]);
    }
    return routeSources;
  }

  async addNewSourceData(data) {
    //Add a new path to the dataset
    if (data.data !== undefined && data.data !== null) {
      const flightRoute = new FlightRoute(data.data)

      // Save new route and ensure it is able to be found
      await flightRoute.save().then(() => {
        FlightRoute.findOne({ sourceID: data.data.sourceID }, (error, routes) => {
          if (error) {
            logger.error(`Failed to save route ${data.data.sourceID} in the database\n error: ${error}`);
          } else {
            logger.info(`New route with ID ${data.data.sourceID} added successfully`);
          }
        });
      }).catch((error) => {
        logger.error(`Error saving flight route:\n ${error.message}`);
      });
    }

    // Increment the count for each route's ID
    this.idCount++;
  }

  async removeSourceData(id) {
    // Finds and deletes a route by its ID with a call back for logging a successful removal
    await FlightRoute.deleteOne({ sourceID: id }, (error, routes) => {
      if (error) {
        logger.error(`Failed to remove flight route ${id} from the database`);
      }
      else {
        logger.info(`Flight path ${id} removed successfully from the database`);
      }
    });
  }

  async updateFlightRoute(route) {
    // Make sure to clean the MongoDB collections since two documents can have the same sourceID
    // This takes a filter as the first parameter, the second parameter indicates the parameter or object to replace it with.
    await FlightRoute.replaceOne({ sourceID: parseInt(route.sourceID) }, route, (error, route) => {
      if (error) {
        logger.error(`Failed to update the data for flight route ${route.sourceID} in the database: ${error}`);
      } else {
        logger.info(`Flight route ${route.sourceID} updated successfully`);
      }

    }).exec();
  }
};

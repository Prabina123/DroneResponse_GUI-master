const mongoose = require('mongoose');

/**
 * The commented schemas below can be added to each property as an object schema.
 * If you want the schema below to be saved in its own model, create a model for the specified schema below
 * like this js.
 */

// const geometrySchema = {
//     type: String,
//     coordinates: [[]]
// }

// const pointDataPropertySchema =
// {
//     type: String,
//     properties: {
//         color: String,
//         id: Number
//     },
//     geometry: geometrySchema
// }

// const lineDataPropertySchema =
// {
//     id: String,
//     type: String,
//     geometry: [geometrySchema]
// }

const flightRouteSchema = new mongoose.Schema({
  sourceID: Number,
  pointData: [Object],
  lineData: Object,
  routeName: String,
  author: String,
  created: {
    type: Date,
    default: Date.now
  },
  altitude: [Number],
  speed: [Number],
  maximum: {
    altitude: Number,
    speed: Number
  },
  minimum: {
    altitude: Number,
    speed: Number
  },
  distance: Number
});

// Create the collection named 'FlightRoutes'
const FlightRoute = mongoose.model('FlightRoutes', flightRouteSchema);

// To query routes in `flight route` collection
// FlightRoute.find({}, function(err, routes){
//   logger.info(routes)
// })

module.exports = FlightRoute;

# Mongoose

## About

MongoDB connection is established using Mongoose in index.js.

### Creating Collections via Models

With Mongoose you can easily create collections in the database via a model to
create the structure is as follows (Also use /server/data/model/droneRoute.js
as reference):

Mongoose allows initialization similar to instancing a class.

// schemaModel.js

```js
// Create schema
// This will be used as the reference for creating a collection(model in Mongoose)
const Schema = new mongoose.Schema({
	sample: String, // the type can be String, Object, Number, etc.
});

// Create Model
// This utilizes the schema to create a collection in the MongoDB server.

const collectionName = "Schematest"; // will be saved in the database as schematests. Mongoose automatically lowercase-and-pluralize the name.
const SchemaModel = mongoose.model(collectionName, schema);

// You can then export
module.exports = SchemaModel;
```

### C.R.U.D.

To perform crud operations you need to reference the Model of the specific collection you are looking for for this example we will be using the DroneRoute model.

We will use `/server/data/model/droneRoute.js` for reference here:

#### Create

To create a new object in the collection droneRoute we need to call the model and instantiate it with an object parameter see below for example.

```js
// data.data here is referencing the data that is passed when a new route is created.
const newRoute = new DroneRoute(data.data);
// It is important to know that since there are no validations implemented in the Mongoose schema (which you can certainly add) the parameters are not restrictive.

// Call save to save in the mongodb droneroute collection in the database.
// Check flightRouteData.js for an example.
newRoute.save();
```

#### READ

Reading data from the collection is similar to how you would read if you were in the MongoDB database.

we use the `find()` keyword. There is also the `findOne()`

```js
DroneRoute.find({}, function (err, routes) {
	console.log(routes);
});
```

#### UPDATE

```js
// This takes a filter as the first parameter, the second parameter indicates the parameter or object to replace it with.
DroneRoute.findOneAndUpdate({ sourceID: route.source }, route);
```

#### DELETE

```js
// This takes a filter as the first parameter, and a call back for the removed route.
DroneRoute.remove({ sourceID: id }, (error, routes) => {
	console.log(error ? error : routes);
});
```

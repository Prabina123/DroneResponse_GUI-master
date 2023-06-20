# Application Architecture

## Back-end Server
- Built using Node.js and <p>socket.io</p>
- Contains routes that receive and send <p>socket.io</p> messages and MQTT messages
- MongoDB database controlled using Mongoose to save flight routes, regions, and missions
- Service layer serves as middleman between the route layer and data layer
- Main logic and setup is in the [index.js](https://github.com/DroneResponse/DR-GUI/blob/master/server/index.js) file

### Route Layer
 - [Drones](https://github.com/DroneResponse/DR-GUI/blob/master/server/routes/droneRoutes.js)
    - MQTT listeners to receive drone information from the onboard pilot; data is in the format of the [Drone](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/model/Drone.ts) model as a JSON string
    - WebSocket listeners that are mostly defunct, but contain listeners for getting drones from the server when a new user opens the page (DRONE_LOAD) and to loading arming status messages (ON_LOAD_ARMING_STATUSES)
    - WebSocket emitters to send the drone data to the GUI
- [FlightRoutes](https://github.com/DroneResponse/DR-GUI/blob/master/server/routes/flightRoutes.js)
    - WebSocket listeners for creating, updating, and deleting flight routes from the GUI
    - WebSocket emitters to fetch flight routes from the database
- [Map](https://github.com/DroneResponse/DR-GUI/blob/master/server/routes/mapRoutes.js)
    - WebSocket listeners for drawing icons and other objects on the GUI map
    - Mostly defunct now
- [Missions](https://github.com/DroneResponse/DR-GUI/blob/master/server/routes/missionRoutes.js)
    - WebSocket listeners for creating and deleting saved missions from JSON files
    - WebSocket emitters to fetch missions from the database
- [Regions](https://github.com/DroneResponse/DR-GUI/blob/master/server/routes/regionRoutes.js)
    - WebSocket listeners for creating, updating, and deleting flight routes from the GUI
    - WebSocket emitters to fetch regions from the database
- [Video](https://github.com/DroneResponse/DR-GUI/blob/master/server/routes/videoRoutes.js)
    - Sets up video stream connections from the old system which streamed MPEG-4 videos over WebSockets
    - The actual video streaming logic is in the [index.js](https://github.com/DroneResponse/DR-GUI/blob/master/server/index.js#L48) file
- [Weather](https://github.com/DroneResponse/DR-GUI/blob/master/server/index.js#L48)
    - Currently unused
- [AR](https://github.com/DroneResponse/DR-GUI/blob/master/server/routes/arRoutes.js)
    - Currently unused

### Service Layer
- Each route file in the route layer has a companion service file in the service layer
- For [FlightRoutes](https://github.com/DroneResponse/DR-GUI/blob/master/server/services/flightRouteService.js), [Regions](https://github.com/DroneResponse/DR-GUI/blob/master/server/services/regionService.js), and [Missions](https://github.com/DroneResponse/DR-GUI/blob/master/server/services/missionService.js), they contain simple functions for communicating with the data layer to add, update, and delete objects in the MongoDB database.
- For [Drones](https://github.com/DroneResponse/DR-GUI/blob/master/server/services/droneService.js), the data is saved in memory on the server but is not persistent between server sessions (does not use the database). The functions keep track of drone data, the drone's socket connection ID, and status messages that have been sent.

### Data Layer
- Each service and route file also has a data file in the data layer for actually saving data
- For [Drones](https://github.com/DroneResponse/DR-GUI/blob/master/server/data/droneData.js), the drone data, socket connection ID, and previously received status messages are saved in memory.
- For [FlightRoutes](https://github.com/DroneResponse/DR-GUI/blob/master/server/data/flightRouteData.js), [Regions](https://github.com/DroneResponse/DR-GUI/blob/master/server/data/regionData.js), and [Missions](https://github.com/DroneResponse/DR-GUI/blob/master/server/data/missionData.js), there are functions that interface with Mongoose to actually save and update the objects in the MongoDB database. The models used for the database are [FlightRoute](https://github.com/DroneResponse/DR-GUI/blob/master/server/data/model/flightRoute.js), [Region](https://github.com/DroneResponse/DR-GUI/blob/master/server/data/model/regions.js), and [MissionJson](https://github.com/DroneResponse/DR-GUI/blob/master/server/data/model/missionJson.js).

## Front-end Angular Application
- Most of the information about the front-end can be found in the [Components](https://github.com/DroneResponse/DR-GUI/blob/master/docs/components.md) document.
- The GUI connects to the back-end server through several services.
- There are two separate connections, the client socket connection on port 6002 which connects to the [MapService](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/services/map.service.ts) and [MissionService](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/services/mission.service.ts) through the [MapNodeService](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/services/map-node-service/map-node.service.ts). Along with other helper functions, these set up the WebSocket listeners and emitters for map icons (most unused), flight routes, regions, and missions.
- There is a separate socket connection for drones specifically on port 6003. This connects to the [DroneService](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/services/drone-service/drone.service.ts) through the [DroneNodeService](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/services/drone-service/drone-node-service/drone-node.service.ts). This contains the WebSocket listeners to receive the drone data from the server after it is received on the server from MQTT as well as some emitters to request the drone data and status messages that are saved on the server.
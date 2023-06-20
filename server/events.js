module.exports = {
  DATA: 'data',
  END: 'end',
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  CLOSE: 'close',

  DRONE_UPDATE: 'update drones',
  DRONE_ADD: 'add drone',
  DRONE_REMOVE: 'remove drone',
  DRONE_LOAD: 'load drones',
  DRONE_GEOFENCE: 'new geofence',
  DRONE_SEND_ALERT: 'alert',
  DRONE_REMOVE_ALERT: 'remove alert',
  ON_DRONE_COMMAND: 'drone command',
  ON_DRONE_ALERT: 'alert detected',
  OFF_DRONE_ALERT: 'alert undetected',
  ON_NEW_DRONE: 'new_drone',

  ON_UPDATE_DRONE: 'update_drone',
  ON_DRONE_DISCONNECT: 'disconnect_drone',

  // For mission JSON files
  GET_ALL_MISSION_JSONS: 'get_all_mission_jsons',
  ON_SYNC_MISSION_JSONS: 'on_sync_mission_jsons',
  NEW_MISSION_JSON: 'new_mission_json',
  DELETE_MISSION_JSON: 'delete_mission_json',

  NEW_DRONE_MISSION: 'new_drone_mission',
  ON_STATE_CHANGED: 'state_changed',
  STATE_CHANGED: 'state changed',

  ARM_DRONE: 'arm drone',
  SET_GEOFENCE: 'set geofence',

  ON_ARMING_STATUS_UPDATE: 'arming_status_update',
  UPDATE_STATUS: 'update status',
  ON_LOAD_ARMING_STATUSES: 'load statuses',

  MAP_NEW_USER: 'new user',
  MAP_DRAW_OBJECTS: 'draw objects',
  ON_MAP_LOAD: 'load map',
  ON_MAP_CREATION: 'creation',

  WEATHER_CONDITION: 'weatherCondition',
  ON_WEATHER_CONNECTION: 'jetsonConnection',

  FLIGHT_ROUTE_NEW_USER: 'flightRoute newUser',
  ON_FLIGHT_ROUTE_CREATED: 'flightRouteCreation',
  FLIGHT_ROUTE_DRAW: 'flightRouteDraw',
  ON_FLIGHT_ROUTE_DELETED: 'flightRouteDeleting',
  FLIGHT_ROUTE_REMOVED: 'flightRouteRemoved',
  FLIGHT_ROUTE_UPDATE: 'flightRouteUpdate',

  ON_MISSION: 'onMission',
  SEND_MISSION: 'sendMission',

  MQTT_CONNECT: 'connect',

  AR_NEW_CLIENT: 'new_client',
  SYNC_WORLD: 'syncWorldFromServer',
  SYNC_OBJECT: 'syncObject',
  ADD_OBJECT: 'addObject',

  GET_REGIONS: 'GET_REGIONS',
  SAVE_REGION: 'SAVE_REGION',
  UPDATE_REGION: 'UPDATE_REGION',
  DELETE_REGION: 'DELETE_REGION',
  DRAW_REGIONS: 'DRAW_REGIONS',
};

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  alert_confidence_threshold: 0.8,

  mapbox:{
    // Originally used access token
    // accessToken: 'pk.eyJ1IjoiYWFncmF3YTIiLCJhIjoiY2thdHQ0bzI0MGd6bzJ0cGhmb2V6cmVsbCJ9.RuwYEyAHTh4A3jgKCnF9OQ'
    // Access token for mprieto2@nd.edu email
    accessToken: 'pk.eyJ1IjoibXByaWV0bzIiLCJhIjoiY2xmcjV6NTcyMDI1ejNzcXRnMWdvdTUxbSJ9.Votd4a7azANnCp3xE79zfA'
  },

  SB_LAT: 41.705030,
  SB_LONG: -86.241960,
  // PEPPERMINT_LAT: 41.6068926,
  // PEPPERMINT_LONG: -86.3560719,
  PEPPERMINT_LAT: 41.6100018,
  PEPPERMINT_LONG: -86.3574433,

  PEPPERMINT_ALT: 229.0237,
  ALTITUDE_API_URL: 'http://localhost:5001/v1/ned10m?locations=',

  // MAP_SOCKET_ENDPOINT: 'http://back_end_server_1:6002',
  // DRONE_SOCKET_ENDPOINT: 'http://back_end_server_1:6003',
  // VIDEO_SOCKET_ENDPOINT: 'ws://back_end_server_1:6001',
  MAP_SOCKET_ENDPOINT: 'http://localhost:6002',
  DRONE_SOCKET_ENDPOINT: 'http://localhost:6003',
  VIDEO_SOCKET_ENDPOINT: 'ws://localhost:6001',
  DRONOLOGY_ENDPOINT: 'ws://sarec1.crc.nd.edu:8777/status',

  Airmap:{
    config:{
      "airmap": {
        "api_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjcmVkZW50aWFsX2lkIjoiY3JlZGVudGlhbHxrM3Z4eERKVEU3dmtPeEhlNFkybzlJT1IwRWdrIiwiYXBwbGljYXRpb25faWQiOiJhcHBsaWNhdGlvbnw2eTR5bWx6Y2FFRE9tQlN5UTBNUGRjM215YndRIiwib3JnYW5pemF0aW9uX2lkIjoiZGV2ZWxvcGVyfGdvR2F5UWFGbkJkTWQ1ZjJPWWs4eEZrMkJad2wiLCJpYXQiOjE1OTIyODA3MjR9.xwoHNzvK1woE9Ur-7WQM_Pn0ipZl8k180W5FWJ5Dt4w",
        "client_id": "406c4c14-34d6-4be7-8624-54562174962b",
        "callback_url": null
      }
    }
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.

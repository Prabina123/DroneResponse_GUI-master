export const environment = {
  production: true,
  alert_confidence_threshold:0.8,
  mapbox:{
    accessToken: 'pk.eyJ1IjoiYWFncmF3YTIiLCJhIjoiY2thdHQ0bzI0MGd6bzJ0cGhmb2V6cmVsbCJ9.RuwYEyAHTh4A3jgKCnF9OQ'
  },
  SB_LAT: 41.705030,
  SB_LONG: -86.241960,

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

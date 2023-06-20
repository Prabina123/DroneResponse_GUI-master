export const prepState =
{
  "name": "MISSION_PREPARATION",
  "transitions": [
    {
      "target": "OnGround",
      "condition": "MissionConfigured"
    }
  ]
};

export const armState =
{
  "name": "Arm",
  "transitions": [
    {
      "target": "Takeoff",
      "condition": "succeeded_armed"
    }
  ]
};

export const takeoffState =
{
  "name": "Takeoff",
  "args": {},
  "transitions": [
    {
      "target": "BriarBreakWaypoint",
      "condition": "succeeded_takeoff"
    },
    {
      "target": "Land",
      "condition": "failed_takeoff"
    }
  ]
};

// Must rename state when using it multiple times
export const waypointState =
{
  "name": "BriarWaypoint0",
  "class": "BriarWaypoint",
  "args": {
    "waypoint": {
      "latitude": 0,
      "longitude": 0,
      "altitude": 0
    },
    "stare_position": {
      "latitude": 0,
      "longitude": 0,
      "altitude": 0
    },
    "speed": 0
  },
  "transitions": [
  ]
}

export const landState =
{
  "name": "Land",
  "transitions": [
    {
      "target": "Disarm",
      "condition": "succeeded_land"
    }
  ]
};

export const disarmState =
{
  "name": "Disarm",
  "transitions": [
    {
      "target": "mission_completed",
      "condition": "succeeded_disarm"
    }
  ]
};

export const circleTargetState =
{
  "name": "CircleTarget",
  "class": "CircleVisionTarget",
  "args": {
    "target_circle_radius": 10.0,
    "target_circle_height": 10.0,
    "target_approach_speed": 2.5,
    "circle_speed": 1.5
  },
  "transitions": [
  ]
};

export function stateCopy(state: any) {
  return JSON.parse(JSON.stringify(state));
}
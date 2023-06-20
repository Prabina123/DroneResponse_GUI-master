import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Drone } from '../model/Drone';
import { Lla } from '../model/Lla';
import { Mission } from '../model/Mission';
import { MissionItem } from '../model/MissionItem';
import { events } from '../utils/events';
import { armState, circleTargetState, disarmState, landState, prepState, stateCopy, takeoffState, waypointState } from '../utils/states';
import { MissionJson } from '../model/MissionJson';
import { IRoute } from '../model/Route';
import { Region } from '../model/Region';
import { RegionPath } from '../map-layers/RegionPath';
import { MapNodeService } from './map-node-service/map-node.service';

@Injectable({
  providedIn: 'root'
})
export class MissionService {
  // Distance to fly for the break waypoint towards the starting waypoint
  distanceToFly: number = 35;

  // Altitude from sea level
  currentAMSL: number = environment.PEPPERMINT_ALT;

  // Stores mission JSON objects
  missionJsonsData: BehaviorSubject<MissionJson[]> = new BehaviorSubject<MissionJson[]>([]);

  // Websocket service for mission messages
  MapNodeConnectionService: MapNodeService;

  constructor(mapNodeService: MapNodeService) {
    this.MapNodeConnectionService = mapNodeService;
    this.setCurrentAMSL();

    this.onSyncMissionJsons();
    this.getMissionJsons();
  }

  private setCurrentAMSL(): void {
    if (environment.production) {
      /// Find the current location of the user
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position: GeolocationPosition) => {
          // Send an API request to get the altitude at the current location
          fetch(`${environment.ALTITUDE_API_URL}${position.coords.latitude},${position.coords.longitude}`)
            .then(response => response.json())
            .then((data) => {
              this.currentAMSL = data.results[0].elevation;
            })
            .catch(err => console.log(err));
        });
      }
    }
  }

  private setMissionJsonsData(newMissionJsonsData: MissionJson[]): void {
    this.missionJsonsData.next(newMissionJsonsData);
  }

  public getMissionJsonsData(): Observable<MissionJson[]> {
    return this.missionJsonsData.asObservable();
  }

  onSyncMissionJsons(): void {
    this.MapNodeConnectionService.socket.on(events.ON_SYNC_MISSION_JSONS, (data: MissionJson[]) => {
      this.setMissionJsonsData(data);
    });
  }

  getMissionJsons(): void {
    this.MapNodeConnectionService.socket.emit(events.GET_ALL_MISSION_JSONS);
  }

  // Sends a list of mission JSONs that are meant to be run together to be saved by the server
  saveMissionJson(missionName: string, missionList: (string | ArrayBuffer)[]): void {
    let data = { name: missionName, droneCount: missionList.length, missionList: missionList };
    this.MapNodeConnectionService.socket.emit(events.NEW_MISSION_JSON, data);
  }

  deleteMissionJson(missionName: string) {
    this.MapNodeConnectionService.socket.emit(events.DELETE_MISSION_JSON, missionName);
  }

  sendNewMission(topic: string, mission: string): void {
    this.MapNodeConnectionService.socket.emit(events.NEW_DRONE_MISSION, { topic: topic, mission: mission });
  }

  // Generates GeoJSON features to display lines with points based on a mission JSON
  getMissionDisplayData(missionObj: any, index: number, pointData: GeoJSON.Feature[]) {
    const waypoints = missionObj.states.filter((state: any) => state.name.startsWith('BriarWaypoint'));

    // Create a GeoJSON feature object to store the route data
    let routeGeojson = {
      id: `MissionRoute${index}`,
      type: 'Feature' as const,
      properties: {
        name: `MissionRoutes${index}`,
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: [],
      },
    };

    // Add line and point data for each waypoint in the mission
    waypoints.forEach((point: any, index: number) => {
      const coordinates = point.args.waypoint;
      routeGeojson.geometry.coordinates.push([coordinates.longitude, coordinates.latitude]);

      // Grey is the default point color 
      let color: string = '#bababa';
      // Green color for the first point
      if (index == 0) {
        color = '#238823';
      } else if (coordinates.longitude == waypoints[0].args.waypoint.longitude &&
                  coordinates.latitude == waypoints[0].args.waypoint.latitude) {
        // Workaround to color points on region paths where the starting point is entered as a waypoint twice
        color = '#238823';
      }

      // Add a point feature to the point array for display
      pointData.push({
        type: 'Feature',
        properties: {
          color: color,
          id: pointData.length,
        },
        geometry: {
          type: 'Point',
          coordinates: [coordinates.longitude, coordinates.latitude],
        },
      });
    });
    // Set color of last point to red
    if (pointData.length != 1) {
      pointData[pointData.length - 1].properties.color = '#D2222D';
    }

    return { lines: routeGeojson, points: pointData };
  }

  makeSearchAndDetectMissionitem(
    uavid: string, assignments: any, flightRoutes: IRoute[], regions: Region[],
    drones: Drone[], assignedRegions: Map<string, string[]>): MissionItem {
    let newItem = new MissionItem(uavid);

    let type = assignments[uavid].type;
    let waypoints: Array<Lla>;
    if (type == 'route') {
      const selectedRoute = flightRoutes.find(route => route.sourceID == assignments[uavid].id);
      waypoints = selectedRoute.pointData.map((point: GeoJSON.Feature<GeoJSON.Point>, index: number) => {
        let lla = new Lla();
        lla.longitude = point.geometry.coordinates[0];
        lla.latitude = point.geometry.coordinates[1];
        lla.altitude = selectedRoute.altitude[index];
        lla.speed = selectedRoute.speed[index];
        return lla;
      });

      newItem.setRouteId(selectedRoute.routeName);
    } else if (type == 'region') {
      const region = regions.find((r: any) => r._id == assignments[uavid].id);
      const regionDrones = drones.filter(drone => assignedRegions[region._id].includes(drone.uavid));
      const regionPath = new RegionPath(
        (region.layerGeojson.features[0].geometry as GeoJSON.Polygon).coordinates,
        regionDrones.length,
        regionDrones,
        region.altitude,
        region.speed
      );
      // Get the specific path for the specific drone
      let individualPath = regionPath.pathWaypoints.find((p: any) => p.uavid == uavid);
      waypoints = individualPath.coordinates;
      newItem.setRouteId(individualPath.routeid);
    } else {
      console.log(`TYPE ERROR: ${type}`);
      return null;
    }
    newItem.setStartingLla(waypoints[0]);
    newItem.setEndingLla(waypoints[waypoints.length - 1]);
    newItem.setNavigationWaypoints(waypoints);
    newItem.setHome(waypoints[0]);
    return newItem;
  }

  // Creates a JSON file based upon the mission object and mission items
  createMission(mission: Map<string, Mission>, drones: Drone[]): string[] {
    // List to hold mission JSONs for the mission to be saved for later
    let missionList = [];
    mission.forEach((m: Mission, role: string) => {
      // Use different mission builder helpers depending on the mission role
      if (role == 'search_and_detect') {
        m.missionItems.forEach((item: MissionItem) => {
          const missionData = this.buildSearchAndDetectMission(item, drones);
          missionList.push(missionData.missionJson);
          this.sendNewMission(missionData.topic, missionData.missionJson);
        });
      } else if (role == 'saved_mission') {
        m.missionJsons.forEach((missionJson: string, uavid: string) => {
          const missionData = this.buildSavedMission(uavid, missionJson, drones);
          missionList.push(missionData.missionJson);
          this.sendNewMission(missionData.topic, missionData.missionJson);
        });
      }
    });

    return missionList;
  }

  // Builds mission JSONs for individuals mission items for search and detect missions
  buildSearchAndDetectMission(item: MissionItem, drones: Drone[]) {
    let missionObj = {
      'states': [
        stateCopy(prepState),
        stateCopy(armState),
      ]
    };

    // Get original position of the drone being flown
    const currentDroneLocation = drones.find(drone => drone.uavid == item.getUavid()).status.location;;

    // Set the takeoff altitude to that of the first waypoint
    let takeoffObj = stateCopy(takeoffState);
    takeoffObj.args.altitude = item.startingWaypoint.altitude;
    missionObj.states.push(takeoffObj);

    // Generate breakpoint on way to first waypoint to allow other drones to get air-leasing
    let breakWaypointObj = this.getStartingWaypointBreak(currentDroneLocation, item.startingWaypoint);
    missionObj.states.push(breakWaypointObj);

    item.allWaypoints.forEach((waypoint: Lla, index: number) => {
      // Create copy of the BriarWaypoint state object
      let waypointObj = stateCopy(waypointState);
      waypointObj.name = `BriarWaypoint${index}`;
      waypointObj.args.waypoint.latitude = waypoint.latitude;
      waypointObj.args.waypoint.longitude = waypoint.longitude;
      waypointObj.args.waypoint.altitude = waypoint.altitude + this.currentAMSL;
      waypointObj.args.stare_position = null;
      // waypointObj.args.stare_position.longitude = waypoint.longitude;
      // waypointObj.args.stare_position.altitude = waypoint.altitude;
      waypointObj.args.speed = waypoint.speed;

      if (index != item.allWaypoints.length - 1) {
        waypointObj.transitions.push({
          'target': `BriarWaypoint${index+1}`,
          'condition': 'succeeded_waypoints'
        });
      } else {
        waypointObj.transitions.push({
          'target': 'HomeWaypoint',
          'condition': 'succeeded_waypoints'
        });
      }
      // waypointObj.transitions.push({
      //   'target': 'CircleTarget',
      //   'condition': 'found'
      // });
      missionObj.states.push(waypointObj);
    });

    // Return to home waypoint
    let homeWaypointObj = stateCopy(waypointState);
    homeWaypointObj.name = 'HomeWaypoint';
    homeWaypointObj.args.waypoint.latitude = currentDroneLocation.latitude;
    homeWaypointObj.args.waypoint.longitude = currentDroneLocation.longitude;
    homeWaypointObj.args.waypoint.altitude = item.startingWaypoint.altitude + this.currentAMSL;
    homeWaypointObj.args.speed = 7.5;
    homeWaypointObj.transitions.push({
      'target': 'Land',
      'condition': 'succeeded_waypoints'
    });
    missionObj.states.push(homeWaypointObj);

    // let circleTargetObj = stateCopy(circleTargetState);
    // circleTargetObj.transitions.push({
    //   'target': 'BriarWaypoint0',
    //   'condition': 'succeeded_circle'
    // });
    // missionObj.states.push(circleTargetObj);
    missionObj.states.push(stateCopy(landState));
    missionObj.states.push(stateCopy(disarmState));
    const droneMission = JSON.stringify(missionObj);
    const topic = `drone/${item.getUavid()}/mission-spec`;
    return { topic: topic, missionJson: droneMission };
  }

  buildSavedMission(uavid: string, missionJson: string, drones: Drone[]) {
    const missionObj = JSON.parse(missionJson);
    const breakWaypointIndex = missionObj.states.findIndex((state: any) => state.name == 'BriarBreakWaypoint');
    const startingWaypoint = missionObj.states.find((state: any) => state.name == 'BriarWaypoint0');

    // If there is not a break waypoint or a starting waypoint, do not create a new starting waypoint index
    if ((startingWaypoint != undefined) && (breakWaypointIndex >= 0)) {
      let currentDrone = drones.find(drone => drone.uavid == uavid);
      let breakWaypointObj = this.getStartingWaypointBreak(currentDrone.status.location, startingWaypoint.args.waypoint, true);
      missionObj.states[breakWaypointIndex] = breakWaypointObj;
    }

    const droneMission = JSON.stringify(missionObj);
    const topic = `drone/${uavid}/mission-spec`;
    return { topic: topic, missionJson: droneMission };
  }

  // Generates a waypoint between the drone's starting position and
  // the first waypoint in order to open up air-leasing for other drones sooner
  getStartingWaypointBreak(startingPosition: Lla, waypoint: Lla, saved=false): any {
    let dLat = waypoint.latitude - startingPosition.latitude;
    let dLon = waypoint.longitude - startingPosition.longitude;
    let distance = Math.sqrt(dLat * dLat + dLon * dLon) * 1.113195e5;
    let distanceRatio = this.distanceToFly / distance;
    if (distanceRatio > 1) {
      distanceRatio = 1;
    }

    let newWaypoint = new Lla();
    newWaypoint.latitude = (1 - distanceRatio) * startingPosition.latitude + distanceRatio * waypoint.latitude;
    newWaypoint.longitude = (1 - distanceRatio) * startingPosition.longitude + distanceRatio * waypoint.longitude;
    newWaypoint.altitude = waypoint.altitude;
    if (!saved) {
      newWaypoint.altitude += this.currentAMSL;
    }
    newWaypoint.speed = waypoint.speed;

    let breakWaypointObj = stateCopy(waypointState);
    breakWaypointObj.name = 'BriarBreakWaypoint';
    breakWaypointObj.args.waypoint.latitude = newWaypoint.latitude;
    breakWaypointObj.args.waypoint.longitude = newWaypoint.longitude;
    breakWaypointObj.args.waypoint.altitude = newWaypoint.altitude;
    breakWaypointObj.args.stare_position = null;
    // breakWaypointObj.args.stare_position.longitude = newWaypoint.longitude;
    // breakWaypointObj.args.stare_position.altitude = newWaypoint.altitude;
    breakWaypointObj.args.speed = newWaypoint.speed;
    breakWaypointObj.transitions.push({
      'target': 'BriarWaypoint0',
      'condition': 'succeeded_waypoints'
    });

    return breakWaypointObj;
  }

}

import { Lla } from './Lla';

export class MissionItem implements MissionItemInterface {
  uavid: string;
  routeId: string;
  polygonId: string;
  startingWaypoint: Lla;
  endingWaypoint: Lla;
  home: Lla;
  allWaypoints: Lla[];

  constructor(uavid: string) {
    this.uavid = uavid;
    this.polygonId = 'None';
    this.routeId = 'None';
    this.startingWaypoint = new Lla();
    this.endingWaypoint = new Lla();
    this.home = new Lla();
    this.allWaypoints = new Array<Lla>();

  }

  getMissionItem() {
    return {
      uavid: this.uavid,
      polygonId: this.polygonId,
      routeId: this.routeId,
      startingWaypoint: this.startingWaypoint,
      endingWaypoint: this.endingWaypoint,
      home: this.home,
      allWaypoints: this.allWaypoints
    }
  }


  getUavid(): string { return this.uavid }
  getPolygonId(): string { return this.polygonId }
  getStartingLla(): Lla { return this.startingWaypoint }
  getEndingLla(): Lla { return this.endingWaypoint }
  getHome(): Lla { return this.home }
  getNavigationWaypoints(): Array<Lla> { return this.allWaypoints }
  getrouteId(): string { return this.routeId }


  setUavid(id: string): void { this.uavid = id }
  setPolygonId(id: string): void { this.polygonId = id }
  setStartingLla(lla: Lla): void { this.startingWaypoint = lla }
  setEndingLla(lla: Lla): void { this.endingWaypoint = lla }
  setHome(lla: Lla): void { this.home = lla }
  setNavigationWaypoints(waypoints: Array<Lla>): void {
    this.allWaypoints.length = 0;
    waypoints.forEach(element => {
      let lla = new Lla();
      lla.altitude = element.altitude;
      lla.latitude = element.latitude;
      lla.longitude = element.longitude;
      lla.speed = element.speed;
      this.allWaypoints.push(lla);

    });
  }
  setRouteId(id: string): void { this.routeId = id }

}

export interface MissionItemInterface {
  // unique identifier 
  uavid: string;

  // to fetch routes and all its details 
  routeId: string;

  // region of search
  polygonId: string;

  // first waypoint to start searching the area
  startingWaypoint: Lla;

  // final waypoint
  endingWaypoint: Lla;

  // registered home location of this drone
  home: Lla;

  // all waypoints assigned to a single drone in its navigation path
  allWaypoints: Array<Lla>
}

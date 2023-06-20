import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FlightPathLayer } from '../map-layers/FlightPathLayer';
import { MapService } from '../services/map.service';
import { PolygonLayer } from '../map-layers/PolygonLayer';
import { Mission } from '../model/Mission';
import { MissionService } from '../services/mission.service';
import { Drone } from '../model/Drone';
import { Subject } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { IRoute } from '../model/Route';
import { Region } from '../model/Region';
import { MissionJson } from '../model/MissionJson';

@Component({
  selector: 'app-mission-route-region',
  templateUrl: './mission-route-region.component.html',
  styleUrls: ['./mission-route-region.component.less']
})
export class MissionRouteRegionComponent {
  @Input() drones: Drone[];
  @Input() flightPathLayer: FlightPathLayer;
  @Input() polygonLayer: PolygonLayer;
  @Input() map: mapboxgl.Map;
  @Input() selectedDrones: Map<string, string>;
  @Input() selectedRole: any;
  @Input() mission: Map<string, Mission>;
  @Input() mapView: boolean;
  @Output() hideMapView: EventEmitter<any> = new EventEmitter();

  // Array with available routes and set to track selected routes
  flightRoutes: IRoute[] = [];
  assignments: any = {};

  // Array with available regions and set to track selected regions
  assignedRegions: Map<string, string[]> = new Map<string, string[]>();
  regions: Region[] = [];
  regionNames: string[] = [];
  routeNumbers: Map<string, number>  = new Map<string, number>();

  // Array with available missions and object for the selected mission
  missionJsons: MissionJson[] = [];
  selectedMission: MissionJson;

  // Keeps track of type of selection
  type: string = '';

  // Observable to emit tab changes
  tabChangeSubject: Subject<void> = new Subject<void>();

  // Keep track of last selected tab index
  lastSelectedIndex: number = 0;


  constructor(
    private mapService: MapService,
    private missionService: MissionService
  ) {
    this.mapService.getFlightPathData().subscribe((routes: IRoute[]) => {
      this.flightRoutes = routes;
    });

    this.mapService.getRegionsData().subscribe((regions: Region[]) => {
      this.regions = regions;
      // Prevents region list from being refreshed in the selection list if no new regions are added/deleted
      // Region names are used for the dropdown list because of issues with regions changing values
      // when drones are added/removed from regions
      for (let region of regions) {
        if (!this.regionNames.includes(region.name)) {
          this.regionNames = regions.map((r: Region) => r.name);
          return;
        }
      }
    });

    this.missionService.getMissionJsonsData().subscribe((missionJsons: MissionJson[]) => {
      this.missionJsons = missionJsons;
    });

    this.mapService.syncRegions();
  }

  // Function to disable already selected routes from being chosen again
  isAlreadySelectedRoute(sourceId: number): boolean {
    return Object.values(this.assignments).find((a: any) => a.id == sourceId) != undefined;
  }

  // Select a route for a specific drone from the dropdown
  onDroneRouteSelect(event: any, droneId: string): void {
    // Type will be routes, hover_points, or region
    if (!event?.type) {
      delete this.assignments[droneId];
      return;
    }
    this.checkAndRemoveDroneFromOtherRegions(droneId);

    this.type = event.type;
    // Regions not supported yet in updated UI
    if (event.type == 'region') {
      // Finds a region by name
      let region = this.regions.find((r: Region) => r.name == event.value);
      // Just for reference store region in routes
      this.assignments[droneId] = { 'id': region._id, 'type': 'region' };

      if (!this.assignedRegions[region._id]) {
        this.assignedRegions[region._id] = [droneId];
      } else {
        this.assignedRegions[region._id].push(droneId);
      }
    } else {
      this.routeNumbers.delete(droneId);
      this.assignments[droneId] = { 'id': event.value.sourceID, 'type': 'route' };
      this.flightPathLayer.displayRoute(event.value.sourceID, false);
    }
    this.showAssignedRoutesAndRegionsOnMap();
  }

  checkAndRemoveDroneFromOtherRegions(drone: string): void {
    Object.keys(this.assignedRegions).forEach((i) => {
      if (this.assignedRegions[i]?.includes(drone)) {
        this.assignedRegions[i] = this.assignedRegions[i].filter(
          (r: any) => r !== drone
        );
        let region = this.regions.find((r: Region) => r._id == i);
        let coordinates = (region.layerGeojson.features[0].geometry as GeoJSON.Polygon).coordinates;
        let polygonNumber = region.layerGeojson.features[0].properties.idnum;

        const regionDrones = this.drones.filter(drone => this.assignedRegions[i].includes(drone.uavid));
        this.polygonLayer.findSearchAreaRoutes(coordinates, polygonNumber, regionDrones, region.altitude, region.speed);
        this.mapService.updateRegion(
          region._id,
          region
        );
      }
    });
  };

  showAssignedRoutesAndRegionsOnMap(): void {
    this.polygonLayer.clearMap();
    this.flightPathLayer.clearLayer();
    setTimeout(() => {
      for (const [regionId, assignedDrones] of Object.entries(
        this.assignedRegions
      ) as any) {
        if (assignedDrones.length) {
          const region = this.regions.find((r: Region) => r._id == regionId);
          this.polygonLayer.showPolygonOnMap(
            region.layerGeojson,
            region.searchGeojson,
            region.startingPoints,
            region.layerGeojson.features[0].id as string,
            region.name
          );

          const coordinates = (region.layerGeojson.features[0].geometry as GeoJSON.Polygon).coordinates;
          const regionDrones = this.drones.filter(drone => this.assignedRegions[region._id].includes(drone.uavid));
          let regionPath = this.polygonLayer.findSearchAreaRoutes(coordinates, region.polygonNumber, regionDrones, region.altitude, region.speed);
          for (let i = 0; i < regionPath.pathWaypoints.length; ++i) {
            let start = regionPath.pathWaypoints[i];
            this.routeNumbers.set(start.uavid, i+1);
          }

          this.mapService.updateRegion(
            region._id,
            region
          );
        }
      }
      for (const route of this.flightRoutes) {
        if (this.isAlreadySelectedRoute(route.sourceID)) {
          this.flightPathLayer.displayRoute(route.sourceID, false);
        }
      }
    }, 100);
  };

  onMissionSelect(event: any): void {
    if (event == undefined) {
      this.selectedMission = undefined;
      return;
    } 
    this.selectedMission = event.value;
    let pointData = [];
    this.selectedMission.missionList.forEach((missionJson: any, index: number) => {
      const missionObj = JSON.parse(missionJson);
      const displayData = this.missionService.getMissionDisplayData(missionObj, index, pointData);
      // Display the mission on the map, do not clear map if there are multiple drones for a mission
      this.flightPathLayer.showRouteUsingData(displayData.lines, displayData.points, index == 0);
    });
  }

  // Ensure that all drones have been assigned to a route before allowing the mission to be saved
  isSaveEnabled(): boolean {
    if (this.selectedRole.role_name == 'search_and_detect') {
      return Object.keys(this.assignments).length == this.selectedDrones[this.selectedRole.role_name].length;
    } else if (this.selectedRole.role_name == 'saved_mission') {
      return this.selectedMission != undefined;
    }
  }

  // Creates Mission Item objects for each drone to eventually be parsed into a mission JSON object
  onSave(): void {
    const roleName = this.selectedRole.role_name;
    const missionDrones = this.selectedDrones[roleName];

    // Create a new mission with the the selected number of drones
    let newMission = new Mission(roleName);
    newMission.setDroneCount(missionDrones.length);

    if (roleName == 'search_and_detect') {
      missionDrones.forEach((drone: string) => {
        newMission.addDrone(drone);
        let newItem =
          this.missionService.makeSearchAndDetectMissionitem(
            drone, this.assignments, this.flightRoutes, this.regions, this.drones, this.assignedRegions);

        newMission.addMissionItem(newItem);
      });
    } else if (roleName == 'saved_mission') {
      missionDrones.forEach((drone: string) => {
        newMission.addDrone(drone);
      });

      // Map mission JSONs with drones by order in the list
      // Note: This assumes drones will all be set up relatively close to each other
      //       minimize the distance drones must fly to their starting waypoint
      this.selectedMission.missionList.forEach((missionJson: string, index: number) => {
        newMission.addMissionJson(missionDrones[index], missionJson);
      });
    }
    this.mission.set(roleName, newMission);
    this.hideMap();
  }

  hideMap() {
    this.hideMapView.emit();
  }

  tabChangeEvent(event: MatTabChangeEvent): void {
    if (this.lastSelectedIndex == 3 && event.index != 0) {
      this.flightPathLayer.clearLayer();
    }
    this.tabChangeSubject.next();
    this.lastSelectedIndex = event.index;
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { DroneService } from '../services/drone-service/drone.service';
import { MapService } from '../services/map.service';
import { Drone } from '../model/Drone';
import { default as roles } from '../utils/roles';
import { FlightPathLayer } from '../map-layers/FlightPathLayer';
import * as mapboxgl from 'mapbox-gl';
import { LayerName } from '../map-layers/CustomMapLayer';
import { faDrawPolygon, faRoute } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import { PolygonLayer } from '../map-layers/PolygonLayer';
import { Mission } from '../model/Mission';

@Component({
  selector: 'app-mission-wizard',
  templateUrl: './mission-wizard.component.html',
  styleUrls: ['./mission-wizard.component.less'],
})
export class MissionWizardComponent implements OnInit, OnDestroy {
  mapView: boolean = false;
  selectedDrones: Map<string, string> = new Map<string, string>;
  selectedRole: any = {};

  mission: Map<string, Mission> = new Map();
  roles = roles.roles;
  drones: Drone[] = [];

  map: mapboxgl.Map;
  // style = 'mapbox://styles/mapbox/outdoors-v9';
  style = 'mapbox://styles/mprieto2/clgmduw4p000u01qtaa0a4rdp';
  lat: number;
  lng: number;
  zoom: number = 16;

  // These are needed for creating the map and sharing layers among components outside MapBox
  // Layers
  flightPathLayer: FlightPathLayer;
  polygonLayer: PolygonLayer;
  layers: any[] = [];
  // GeoJSON creation
  iconGeojson = {};

  constructor(
    private mapService: MapService,
    private droneService: DroneService,
  ) {
    this.lat = environment.PEPPERMINT_LAT;
    this.lng = environment.PEPPERMINT_LONG;
  }

  ngOnInit(): void {
    // Workaround to allow maps to load on multiple pages
    if (localStorage.getItem('map_reload')) {
      localStorage.removeItem('map_reload');
      window.location.reload();
    } else {
      localStorage.setItem('map_reload', '1');
    }

    // Get active drones from server
    this.droneService.getActiveDrones().subscribe((value) => {
      this.drones = Array.from(value.values());
    });
    this.droneService.loadDrones();

    // Get map item data
    this.mapService.getMapData().subscribe((value) => {
      this.iconGeojson = value;
    });
    this.mapService.reloadMap();


    // Create a new map
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: this.zoom,
      center: [this.lng, this.lat],
    });
    this.map.once('load', () => {
      // Add FlightPathLayer to show paths in database and PolygonLayer for regions
      // Must be done here in order to use it with the MapRoutes components
      this.addPolygonLayer();
      this.addFlightPathLayer();
    });
  }

  ngOnDestroy(): void {
    // Cleanup map artifacts 
    this.map.remove();
  }

  // Adds the polygon layer to the map and toolbox
  addPolygonLayer(): void {
    this.polygonLayer = new PolygonLayer(
      LayerName.Polygon,
      this.mapService,
      this.droneService,
      this.map,
      this.iconGeojson['polygon'],
      this.iconGeojson['search'],
      this.iconGeojson['startingPoints'],
      faDrawPolygon,
    );
    this.polygonLayer.setVisibility('visible');
    this.layers.unshift(this.polygonLayer);
    this.polygonLayer.getDrawingTool().changeMode('static');
  }

  // Adds the flight path layer to the map
  addFlightPathLayer(): void {
    this.flightPathLayer = new FlightPathLayer(
      LayerName.FlightPath,
      this.map,
      this.iconGeojson['routeLines'],
      this.iconGeojson['routePoints'],
      faRoute,
      this.mapService
    );
    this.flightPathLayer.setVisibility('visible');
  }

  // Listens to selectedDronesEmitter in the MissionWorkflow component for changes in the selected drones
  selectedDronesChange(data: any) {
    this.mission.set(data.role, new Mission(data.role));
    this.selectedDrones = data.selected;
  }

  // Changes view to the map, passed to and called from MissionWorkflow component
  showMapView(id: string): void {
    this.mapView = true;
    this.selectedRole = this.roles.find((e) => e.role.role_name == id).role;
  };

  // Changes view back to the mission workflow, called from the MissionMap component
  hideMapView(): void {
    this.flightPathLayer.clearLayer();
    this.polygonLayer.clearMap();
    this.mapView = false;
    this.selectedRole = {};
  };
}
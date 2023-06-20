import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { environment } from '../../environments/environment';
import { MapService } from '../services/map.service';
import * as mapboxgl from 'mapbox-gl';
import {
  faDrawPolygon,
  faRoute,
} from '@fortawesome/free-solid-svg-icons';
import { LayerName } from '../map-layers/CustomMapLayer';
import { AirmapService } from '../services/airmap-service/airmap-service';
import { FlightPathLayer } from '../map-layers/FlightPathLayer';
import { PolygonLayer } from '../map-layers/PolygonLayer';
import { DroneService } from '../services/drone-service/drone.service';
import { MissionService } from '../services/mission.service';
import { Subject } from 'rxjs';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { Region } from '../model/Region';
import { IRoute } from '../model/Route';
import { MissionJson } from '../model/MissionJson';
import { Drone } from '../model/Drone';

@Component({
  selector: 'main-map',
  providers: [MapService, AirmapService],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.less'],
  encapsulation: ViewEncapsulation.None,
})
export class MapComponent implements OnInit, OnDestroy {

  // Default map settings
  map: mapboxgl.Map;
  // style = 'mapbox://styles/mapbox/outdoors-v9';
  style = 'mapbox://styles/mprieto2/clgmduw4p000u01qtaa0a4rdp';
  lat: number;
  lng: number;
  zoom: number = 16;

  // Active drone array
  drones: Drone[] = [];

  // Layers
  flightPathLayer: FlightPathLayer;
  polygonLayer: PolygonLayer;
  layers: any[] = [];

  // GeoJSON creation
  iconGeojson = {};

  // Route, region, and mission objects
  flightRoutes: IRoute[] = [];
  regions: Region[] = [];
  missionJsons: MissionJson[] = [];

  // Observable to emit tab changes
  tabChangeSubject: Subject<void> = new Subject<void>();

  // Keep track of last selected tab index
  lastSelectedIndex: number = 0;

  constructor(
    private mapService: MapService,
    private droneService: DroneService,
    private missionService: MissionService
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

    this.droneService.getActiveDrones().subscribe((data: Map<string, Drone>) => {
      this.drones = Array.from(data.values());
    });

    this.mapService.getMapData().subscribe((value) => {
      this.iconGeojson = value;
    });
    this.mapService.reloadMap();

    this.mapService.getFlightPathData().subscribe((routes: IRoute[]) => {
      this.flightRoutes = routes;
    });

    this.mapService.getRegionsData().subscribe((regions: Region[]) => {
      this.regions = regions;
    });

    this.missionService.getMissionJsonsData().subscribe((missionJsons: MissionJson[]) => {
      console.log
      this.missionJsons = missionJsons;
    });

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
      //..............................................
      const coordinate = [-86.3583874375729, 41.611132858179786] as mapboxgl.LngLatLike;
      const point = this.map.project(coordinate);
      console.log(point);
      //..............................................
    });
    // this.map.on('style.load', () => {
    //   this.map.addSource('mapbox-dem', {
    //   'type': 'raster-dem',
    //   'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
    //   'tileSize': 512,
    //   'maxzoom': 14
    //   });
    //   // add the DEM source as a terrain layer with exaggerated height
    //   this.map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
    // });
  }

  ngOnDestroy(): void {
    this.map.remove();
  }

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

  tabChangeEvent(event: MatTabChangeEvent): void {
    if (this.lastSelectedIndex == 3 && event.index != 0) {
      this.flightPathLayer.clearLayer();
    }
    this.tabChangeSubject.next();
    this.lastSelectedIndex = event.index;
  }
  //.....................................................
  cordsToPixels(cords: mapboxgl.LngLatLike): mapboxgl.Point {
    return this.map.project(cords);
  }
  //.....................................................
}

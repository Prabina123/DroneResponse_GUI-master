import { Component, OnInit } from '@angular/core';
import { DroneService } from '../services/drone-service/drone.service';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';

import { DroneLayer } from '../map-layers/DroneLayer';
import { MapService } from '../services/map.service';
import { Router } from '@angular/router';
import { faExpandArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { LayerName } from '../map-layers/CustomMapLayer';
import { Explain } from '../map-layers/DroneExplain';
import { events } from '../utils/events';

@Component({
  selector: 'app-geo-fence',
  templateUrl: './geo-fence.component.html',
  styleUrls: ['./geo-fence.component.less'],
})
export class GeoFenceComponent implements OnInit {
  map: mapboxgl.Map;
  style = 'mapbox://styles/mapbox/outdoors-v9';
  img_path = '../../assets/arrow.png';
  name = 'drone';

  lat = 41.70503; // South Bend Coords
  lng = -86.24196;

  polygon: GeoJSON.Feature;

  droneGeojson = {
    type: <'FeatureCollection'>'FeatureCollection',
    features: [],
  };

  layers = [];
  droneLayer: DroneLayer;
  Draw: MapboxDraw;
  explains: Explain[];

  constructor(
    private droneService: DroneService,
    private mapService: MapService,
    private router: Router
  ) {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
    this.Draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    });
  }

  ngOnInit(): void {
    this.initializeMap();

    this.map.on('load', () => {
      //this.addSource();
      //this.addLayer()
      this.map.addControl(this.Draw, 'top-left');

      this.droneLayer = new DroneLayer(
        LayerName.Drone,
        this.map,
        this.droneGeojson,
        this.droneGeojson,
        faExpandArrowsAlt,
        this.droneService,
        true,
        this.explains
      );
    });

    this.geoFenceDrawHandler();
  }

  // Add handlers for when a polygon is drawn
  geoFenceDrawHandler(): void {
    this.map.on('draw.create', (e) => {
      let polygonBtn = document.querySelector('.mapbox-gl-draw_polygon');
      polygonBtn.setAttribute('disabled', 'true');
      polygonBtn.classList.add('disabled-btn');
      this.polygon = e.features[0];
    });

    // Update on polygon editing
    this.map.on('draw.update', (e) => {
      this.polygon = e.features[0];
    });

    this.map.on('draw.delete', () => {
      let polygonBtn = document.querySelector('.mapbox-gl-draw_polygon');
      polygonBtn.removeAttribute('disabled');
      polygonBtn.classList.remove('disabled-btn');
      this.polygon = undefined;
    });
  }

  submitGeoFence(): void {
    this.droneService.sendCommandToServer(
      events.SET_GEOFENCE,
      this.droneService.getGeoFenceDrones(),
      this.polygon
    );
    this.goToConnections();
  }

  goToConnections(): void {
    this.droneService.setGeoFenceDrones([]);
    this.router.navigate(['/connections']);
  }

  initializeMap(): void {
    this.buildMap();
  }

  buildMap(): void {
    // Create a new map
    this.map = new mapboxgl.Map({
      container: 'map',
      style: this.style,
      zoom: 15,
      center: [this.lng, this.lat],
    });
    this.explains = [];
  }
}

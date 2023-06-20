import * as MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
import * as mapboxgl from 'mapbox-gl';
import * as StaticMode from '@mapbox/mapbox-gl-draw-static-mode';
import { CustomMapLayerInterface } from './CustomMapLayerInterface';
import { LayerName } from './CustomMapLayer';
import { MapService } from '../services/map.service';
import { DroneService } from '../services/drone-service/drone.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { RegionPath } from './RegionPath';
import { v4 as uuid } from 'uuid';
import { Region } from '../model/Region';
import { Drone } from '../model/Drone';

export class PolygonLayer implements CustomMapLayerInterface {
  // Object that adds drawing/editing feature to the map
  Draw: MapboxDraw;

  // GeoJSON for displaying polygons
  layerGeojson: GeoJSON.FeatureCollection;
  // GeoJSON for the search area flight paths
  searchGeojson: GeoJSON.FeatureCollection;
  // GeoJSON for the starting waypoints of the search area flight paths
  startingPointGeojson: GeoJSON.FeatureCollection;

  // Name of the layer
  name: string;

  // Map to be drawn on
  map: mapboxgl.Map;
  // Controls visibility of different layers
  view: string;
  viewSearchArea: string;
  viewStartingPointArea: string;

  // Icon for the toolbox on the map
  iconImage: IconDefinition;
  
  // Object to hold the coordinates of the region currently being created
  polygonCoordinates: any;

  regionObject: Region = new Region();

  constructor(
    name: LayerName,
    private mapService: MapService,
    private droneService: DroneService,
    map: mapboxgl.Map,
    layerGeojson: GeoJSON.FeatureCollection,
    searchGeojson: GeoJSON.FeatureCollection,
    startingPointGeojson: GeoJSON.FeatureCollection,
    iconImage: IconDefinition,
  ) {
    // MapboxDraw component initialization
    let modes = MapboxDraw.modes;
    modes.static = StaticMode;
    this.Draw = new MapboxDraw({
      displayControlsDefault: false,
      userProperties: true,
      modes: modes,

      // style code allows change to default blue outline for polygon
      styles: [
        {
          id: 'points-are-blue',
          type: 'circle',
          filter: [
            'all',
            ['==', '$type', 'Point'],
            ['==', 'meta', 'feature'],
            ['==', 'active', 'false'],
            ['has', 'user_pointColor'],
          ],
          paint: {
            'circle-radius': 10,
            'circle-color': ['get', 'user_pointColor'],
          },
        },
        {
          id: 'gl-draw-polygon-fill-inactive',
          type: 'fill',
          filter: [
            'all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static'],
          ],
          paint: {
            'fill-opacity': 0,
          },
        },
        {
          id: 'gl-draw-polygon-fill-active',
          type: 'fill',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': 'grey',
            'fill-outline-color': 'white',
            'fill-opacity': 0.1,
          },
        },
        {
          id: 'gl-draw-polygon-midpoint',
          type: 'circle',
          filter: ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
          paint: {
            'circle-radius': 3,
            'circle-color': 'navy',
          },
        },
        {
          id: 'gl-draw-polygon-stroke-inactive',
          type: 'line',
          filter: [
            'all',
            ['==', 'active', 'false'],
            ['==', '$type', 'Polygon'],
            ['!=', 'mode', 'static'],
          ],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': 'grey',
            'line-width': 0,
          },
        },
        {
          id: 'gl-draw-polygon-stroke-active',
          type: 'line',
          filter: ['all', ['==', 'active', 'true'], ['==', '$type', 'Polygon']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': 'grey',
            'line-dasharray': [0.2, 2],
            'line-width': 2,
          },
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-stroke-inactive',
          type: 'circle',
          filter: [
            'all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static'],
          ],
          paint: {
            'circle-radius': 5,
            'circle-color': '#fff',
          },
        },
        {
          id: 'gl-draw-polygon-and-line-vertex-inactive',
          type: 'circle',
          filter: [
            'all',
            ['==', 'meta', 'vertex'],
            ['==', '$type', 'Point'],
            ['!=', 'mode', 'static'],
          ],
          paint: {
            'circle-radius': 3,
            'circle-color': 'white',
          },
        },
        {
          id: 'gl-draw-polygon-fill-static',
          type: 'fill',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
          paint: {
            'fill-color': 'grey',
            'fill-outline-color': 'white',
            'fill-opacity': 0.1,
          },
        },
        {
          id: 'gl-draw-polygon-stroke-static',
          type: 'line',
          filter: ['all', ['==', 'mode', 'static'], ['==', '$type', 'Polygon']],
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': 'white',
            'line-width': 2,
          },
        },

        // can change these colors and features of polygons:
        // https://gist.github.com/dnseminara/0790e53cef9867e848e716937727ab18
      ],
    });

    this.name = name;
    this.layerGeojson = layerGeojson;
    this.searchGeojson = searchGeojson;
    this.startingPointGeojson = startingPointGeojson;
    this.map = map;
    this.iconImage = iconImage;

    // Add drawing button for polygons
    this.map.addControl(this.Draw);
    this.Draw.add(this.layerGeojson);

    // Setup later sources and features
    this.loadLayer();
    this.drawObjectsEventHandler();
    this.onLoadSync();
  }

  // Update GeoJSON object on newly drawn objects
  onLoadSync(): void {
    this.mapService.getLayerGeojsonData().subscribe((data) => {
      if (data.layer == LayerName.Polygon) {
        this.layerGeojson = data.geojson;
      }

      if (data.layer === 'search') {
        this.searchGeojson = data.geojson;
      }
      this.updateLayer();
    });
  }

  addSource(): void {
    this.map.addSource(LayerName.Polygon, {
      type: 'geojson',
      data: this.layerGeojson,
    });
  }

  getLayerGeojson(): GeoJSON.FeatureCollection {
    return this.layerGeojson;
  }

  loadLayer(): void {
    this.addSource();
    this.addLayer();
    this.addSearchLayer();
    this.addStartingPointLayer();
  }

  addLayer(): void {
    this.map.addLayer({
      id: LayerName.Polygon,
      type: 'fill',
      source: LayerName.Polygon,
      paint: {
        'fill-color': 'grey',
        'fill-outline-color': 'white',
        'fill-opacity': 0.1,
      },
    });
  }

  updateLayer(): void {
    let source: mapboxgl.GeoJSONSource = this.map.getSource(
      LayerName.Polygon
    ) as mapboxgl.GeoJSONSource;
    let searchSource: mapboxgl.GeoJSONSource = this.map.getSource(
      'search'
    ) as mapboxgl.GeoJSONSource;
    let startingPointSource: mapboxgl.GeoJSONSource = this.map.getSource(
      'startingPoints'
    ) as mapboxgl.GeoJSONSource;
    let startingPointTextSource: mapboxgl.GeoJSONSource = this.map.getSource(
      'startingPointText'
    ) as mapboxgl.GeoJSONSource;
    source.setData(this.layerGeojson);
    searchSource.setData(this.searchGeojson);
    startingPointSource.setData(this.startingPointGeojson);
    startingPointTextSource.setData(this.startingPointGeojson);
    this.Draw.deleteAll();
    this.Draw.add(this.layerGeojson);

    this.regionObject.layerGeojson = this.layerGeojson;
    this.regionObject.searchGeojson = this.searchGeojson;
    this.regionObject.startingPoints = this.startingPointGeojson;
  }

  addSearchLayer(): void {
    this.map.addSource('search', {
      type: 'geojson',
      data: this.searchGeojson,
    });
    this.map.addLayer({
      id: 'search',
      type: 'line',
      source: 'search',
      paint: {
        'line-color': 'white'
      },
    });
  }

  addStartingPointLayer(): void {
    this.map.addSource('startingPoints', {
      type: 'geojson',
      data: this.startingPointGeojson,
    });
    this.map.addLayer({
      id: 'startingPoints',
      type: 'circle',
      source: 'startingPoints',
      paint: {
        'circle-color': 'red',
        'circle-radius': 6,
      },
    });

    this.map.addSource('startingPointText', {
      type: 'geojson',
      data: this.startingPointGeojson,
    });
    this.map.addLayer({
      id: 'startingPointText',
      type: 'symbol',
      source: 'startingPointText',
      layout: {
        'text-field': ['get', 'index'],
        'text-size': 12,
        'text-variable-anchor': ['top-right', 'bottom-right', 'bottom', 'top'],
        'text-radial-offset': 0.5,
      },
    });
  }

  addSymbolLayer(): void {
    this.map.addLayer({
      id: 'regionLabel',
      type: 'symbol',
      source: LayerName.Polygon,
      paint: {
        'text-color': 'red',
      },
      layout: {
        'symbol-placement': 'point',
        'text-font': ['Open Sans Semibold'],
        'text-field': '{title}',
        'text-size': 18,
      },
    });
  }

  clearLayers(): void {
    this.Draw.deleteAll().getAll();
  }

  toggleLayer(): void {
    if (this.view === 'none') {
      this.view = 'visible';
    } else {
      this.view = 'none';
    }

    // NOTE: To get blue polygons to not show up on toggle might need to erase mapbox.draw
    this.map.setLayoutProperty('polygon', 'visibility', this.view);
    this.toggleSearchLayer();
    this.toggleStartingPointLayer();
  }

  toggleSearchLayer(): void {
    if (this.viewSearchArea === 'none') {
      this.viewSearchArea = 'visible';
    } else {
      this.viewSearchArea = 'none';
    }
    this.map.setLayoutProperty('search', 'visibility', this.viewSearchArea);
  }

  toggleStartingPointLayer(): void {
    if (this.viewStartingPointArea === 'none') {
      this.viewStartingPointArea = 'visible';
    } else {
      this.viewStartingPointArea = 'none';
    }
    this.map.setLayoutProperty(
      'startingPoints',
      'visibility',
      this.viewStartingPointArea
    );
  }

  getVisibility(): string {
    return this.view;
  }

  setVisibility(view: string): void {
    this.view = view;
    this.viewSearchArea = view;
    this.viewStartingPointArea = view;
  }

  getDrawingTool(): MapboxDraw {
    return this.Draw;
  }

  // Sets ups handler to listen for drawing events (creations and updates)
  drawObjectsEventHandler(): void {
    // Functions when a polygon is drawn
    this.map.on('draw.create', (e) => {
      // Generate ID and add polygon to the polygon GeoJSON layer
      let added = e.features[0];
      let polygonNumber = uuid();
      added.properties.idnum = polygonNumber;
      added.properties.id = `${added.type.toLowerCase()}-${polygonNumber}`;
      this.regionObject.polygonNumber = polygonNumber;
      this.layerGeojson.features.push(added);

      // Generate the search area routes
      let coordinates = added.geometry.coordinates;
      this.polygonCoordinates = coordinates;
      // this.mapService.createObject(this.name, this.layerGeojson);
      // this.mapService.createObject('search', this.searchGeojson);

      this.regionObject.layerGeojson = this.layerGeojson;
    });

    // Edit polygon search area and object when moved or edited
    this.map.on('draw.update', (e) => {
      let added = e.features[0];
      for (let i = 0; i < this.layerGeojson.features.length; i++) {
        if (added.properties.idnum === this.layerGeojson.features[i].properties.idnum) {
          // Set the polygon object to its new value
          this.layerGeojson.features[i] = e.features[0];
          this.regionObject.layerGeojson = this.layerGeojson;
          this.regionObject.polygonNumber = added.properties.idnum;
          this.polygonCoordinates = added.geometry.coordinates;

        }
      }

      // Delete old search routes GeoJSON entry
      for (let i = 0; i < this.searchGeojson.features.length; i++) {
        if (added.properties.idnum === this.searchGeojson.features[i].properties.idnum) {
          this.searchGeojson.features.splice(i, 1);
        }
      }

      // Delete old starting point GeoJSON entry
      for (let i = 0; i < this.startingPointGeojson.features.length; i++) {
        if (added.properties.idnum === this.startingPointGeojson.features[i].properties.idnum) {
          this.startingPointGeojson.features.splice(i, 1);
        }
      }

      this.updateLayer();

      // Update polygon, search area, and waypoints when drawn
      // this.mapService.createObject(this.name, this.layerGeojson);
      // this.mapService.createObject(this.name, this.searchGeojson);
      // this.mapService.createObject(this.name, this.startingPointGeojson);
      // Sends update to server
      // this.mapService.createObject(this.name, this.layerGeojson);
    });
  }

  // Adds a selected region, search area routes, and starting points to the map
  showPolygonOnMap(
    layerGeojson: any, searchGeojson: any, startingPointGeojson: any,
    polygonId: string = '', title: string = ''
  ) {
    // Check if the region is already being displayed on the map
    if (!this.layerGeojson.features.find((poly) => poly.properties.idnum == polygonId)) {
      layerGeojson.features[0].properties.title = title
      this.layerGeojson.features.push(layerGeojson.features[0]);
      // this.searchGeojson.features.push(searchGeojson.features[0]);
      // Show search area if it exists
      if (searchGeojson) {
        // this.searchGeojson.features.push(searchGeojson.features[0]);
        this.searchGeojson.features.push(searchGeojson?.features?.[0]);
      }

      // Show starting point if it exists
      if (startingPointGeojson) {
        this.startingPointGeojson.features.push(startingPointGeojson.features[0]);
      }
      // this.startingPointGeojson.features.push(startingPointGeojson.features[0]);
      this.polygonCoordinates = layerGeojson.features[0].geometry.coordinates;
    }

    this.updateLayer();
    // Avoid having layers with duplicate labels
    if (this.map.getLayer('regionLabel')) {
      this.map.removeLayer('regionLabel');
    }
    this.addSymbolLayer();
  }

  // Used for hover points
  // TODO: Once adding hover points come back here 
  changeColor({ color, drawFeatureID }): void {
    if (drawFeatureID !== '' && typeof this.Draw === 'object') {
      // Add whatever colors here...
      this.Draw.setFeatureProperty(drawFeatureID, 'pointColor', color);

      var feat = this.Draw.get(drawFeatureID);
      this.Draw.add(feat);
    }
  }

  // Used on map to delete polygons
  // TODO: Delete if we decide not to remove old toolbox
  deletePolygon(e: mapboxgl.MapMouseEvent): void {
    for (let i = 0; i < this.layerGeojson.features.length; i++) {
      if (
        this.map.queryRenderedFeatures(e.point)[0].properties.idnum ===
        this.layerGeojson.features[i].properties.idnum
      ) {
        let idnum = this.layerGeojson.features[i].properties.idnum;
        this.layerGeojson.features.splice(i, 1);
        // Search for entry in searchGeojson
        for (let j = 0; j < this.searchGeojson.features.length; j++) {
          if (idnum === this.searchGeojson.features[j].properties.idnum) {
            this.searchGeojson.features.splice(j, 1);
          }
        }
        for (let j = 0; j < this.startingPointGeojson.features.length; j++) {
          if (idnum === this.startingPointGeojson.features[j].properties.idnum) {
            this.startingPointGeojson.features.splice(j, 1);
          }
        }
      }
    }
    // Remove polygon, search area, and waypoints
    // this.mapService.createObject('startingPoints', this.startingPointGeojson);
    // this.mapService.createObject('search', this.searchGeojson);
    // this.mapService.createObject(this.name, this.layerGeojson);
  }

  clearMap(): void {
    this.layerGeojson.features = [];
    this.searchGeojson.features = [];
    this.startingPointGeojson.features = [];
    this.updateLayer();

    // Remove polygon, search area, and waypoints
    // this.mapService.createObject('startingPoints', this.startingPointGeojson);
    // this.mapService.createObject('search', this.searchGeojson);
    // this.mapService.createObject(this.name, this.layerGeojson);
  }

  // Call to generate search area routes and assign them to the region object to be saved
  findSearchAreaRoutes(searchPolygonCoordinates: any, polygonNumber: string, drones: Drone[], altitude: number, speed: number): RegionPath {
    let regionPath = this.getRegionFlightPath(searchPolygonCoordinates, polygonNumber, drones, altitude, speed);
    // this.mapService.createObject('search', this.searchGeojson);
    // this.mapService.createObject('startingPoints', this.startingPointGeojson);
    this.updateLayer();

    this.regionObject.multiLineData = this.searchGeojson.features[0].geometry;
    this.regionObject.searchGeojson = this.searchGeojson;
    this.regionObject.startingPoints = this.startingPointGeojson;

    return regionPath;
  }

  // Create new flight paths for the region search area
  getRegionFlightPath(searchPolygonCoordinates: any, polygonNumber: string, drones: Drone[], altitude: number, speed: number): RegionPath {
    this.searchGeojson.features = this.searchGeojson.features.filter((f: any) => f.properties.idnum != polygonNumber);
    this.startingPointGeojson.features = this.startingPointGeojson.features.filter((f: any) => f.properties.idnum != polygonNumber);

    let FlightPath = new RegionPath(
      searchPolygonCoordinates,
      drones.length,
      drones,
      altitude,
      speed
    );

    // Add to GeoJSON object
    this.searchGeojson.features.push({
      type: 'Feature',
      properties: {
        idnum: polygonNumber,
        id: `path-${polygonNumber}`,
      },
      geometry: {
        type: 'MultiLineString',
        coordinates: FlightPath.pathArrowArray,
      },
    });
    // Separate circle layer to show starting points
    for (let i = 0; i < FlightPath.startingPoints.length; ++i) {
      this.startingPointGeojson.features.push({
        type: 'Feature',
        properties: {
          idnum: polygonNumber,
          id: `path-${polygonNumber}`,
          index: i + 1,
        },
        geometry: {
          type: 'Point',
          coordinates: FlightPath.startingPoints[i],
        },
      });
    }
    return FlightPath;
  }
}

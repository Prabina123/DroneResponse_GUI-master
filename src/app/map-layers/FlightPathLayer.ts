import * as mapboxgl from 'mapbox-gl';
import { CustomMapLayerInterface } from './CustomMapLayerInterface';
import { LayerName } from './CustomMapLayer';
import { MapService } from '../services/map.service';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { IRoute } from '../model/Route';

export class FlightPathLayer implements CustomMapLayerInterface {
  // Layer Geojson variables
  layerGeojson: GeoJSON.FeatureCollection;
  pointLayerGeojson: GeoJSON.FeatureCollection;
  lineLayerGeojson: GeoJSON.FeatureCollection;
  map: mapboxgl.Map;
  name: LayerName;
  iconImage: IconDefinition;
  // Map to store routes by ID which contains object for flight route data
  currentRoute: IRoute;
  flightRoutes: IRoute[] = [];
  pathSources = new Map<number, IRoute>();

  constructor(
    name: LayerName,
    map: mapboxgl.Map,
    geojsonLines: GeoJSON.FeatureCollection,
    geojsonPoints: GeoJSON.FeatureCollection,
    iconImage: IconDefinition,
    private mapService: MapService
  ) {
    // Set up the sources for the line and marker layers
    this.pointLayerGeojson = geojsonPoints;
    this.lineLayerGeojson = geojsonLines;
    this.map = map;
    this.name = name;
    this.iconImage = iconImage;
    this.loadLayer();
    // Subscribe to server information
    this.onLoadSync();
  }

  onLoadSync(): void {
    this.mapService.getFlightPathData().subscribe((routes: IRoute[]) => {
      this.pathSources = new Map(); // Set the flight path source map data
      routes.forEach((route: IRoute) => {
        this.pathSources.set(route.sourceID, route);
      });
    }, (error) => {
      console.log(`Data retrieval error: ${error}`);
    });
    this.mapService.reloadMap();
  }

  getLayerGeojson(): GeoJSON.FeatureCollection {
    return this.pointLayerGeojson;
  }

  addSource(): void {
    // Add the source for the LINE layer of the flight path
    this.map.addSource(this.name + 'lines', {
      type: 'geojson',
      data: this.lineLayerGeojson,
    });
    // Add the source for the POINT layer of the flight path
    this.map.addSource(this.name + 'points', {
      type: 'geojson',
      data: this.pointLayerGeojson,
    });
  }

  loadLayer(): void {
    // Setup layer sources and features
    this.addSource();
    this.addLayer();
  }

  addLayer(): void {
    // Initialize layer for the LINES of a flight path
    this.map.addLayer({
      id: this.name + 'lines',
      type: 'line',
      source: this.name + 'lines',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
      },
      paint: {
        'line-color': '#bababa',
        'line-width': 4,
      },
    });

    // Initialize layer for the POINTS of a flight path
    this.map.addLayer({
      id: this.name + 'points',
      type: 'circle',
      source: this.name + 'points',
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#949494',
      },
    });
    this.addSymbolLayer();
  }

  updateLayer(): void {
    // Update the LINE layer for a flight route
    let lineSource: mapboxgl.GeoJSONSource = this.map.getSource(
      this.name + 'lines'
    ) as mapboxgl.GeoJSONSource;
    lineSource.setData(this.lineLayerGeojson);

    // Update the POINT layer for a flight route
    let pointSource: mapboxgl.GeoJSONSource = this.map.getSource(
      this.name + 'points'
    ) as mapboxgl.GeoJSONSource;
    pointSource.setData(this.pointLayerGeojson);
  }

  addSymbolLayer(): void {
    if (this.map.getLayer('routeLabels')) {
      this.map.removeLayer('routeLabels');
    }
    this.map.addLayer({
      id: 'routeLabels',
      type: 'symbol',
      source: this.name + 'lines',
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

  clearLayer(): void {
    // Clear the Geojson features
    this.lineLayerGeojson.features = [];
    this.pointLayerGeojson.features = [];
    this.updateLayer();
  }

  toggleLayer(): void { }

  getVisibility(): string { return '' }

  setVisibility(view: string): void { }

  newFlightPath(): void {
    // Create a new GeoJSON object for the LINE coordinates for a flight path
    let newLine: GeoJSON.Feature<GeoJSON.LineString> = {
      id: 'flightpath-line',
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [],
      },
    };
    // Create GeoJSON array for the point layer
    let points: GeoJSON.Feature[] = [];
    // Create the object to store all of the flight route data
    let flightRouteData = {
      sourceID: Math.floor(Math.random() * 1000000000),
      pointData: points,
      lineData: newLine,
      routeName: 'Flight Temporary Name',
      author: 'DroneResponse',
      created: new Date(Date.now()),
      altitude: [],
      speed: [],
      maximum: {
        altitude: 0,
        speed: 0,
      },
      minimum: {
        altitude: 0,
        speed: 0,
      },
      distance: 0,
      length: 0,
    };

    // Store the current route and edit before adding to the map
    this.currentRoute = flightRouteData;
    // Update the line layer and point layer with new information
    this.lineLayerGeojson.features = [];
    this.lineLayerGeojson.features.push(this.currentRoute.lineData);
    this.pointLayerGeojson.features = [];
    this.pointLayerGeojson.features = this.currentRoute.pointData;
  }

  finishFlightPath(): void {
    // Set all of the meta data for the current route
    this.currentRoute.distance = parseFloat(this.currentRoute.distance.toFixed(3));
    this.currentRoute.length = (this.currentRoute.lineData.geometry as GeoJSON.LineString).coordinates.length;
    this.currentRoute.maximum.altitude = Math.max(...this.currentRoute.altitude);
    this.currentRoute.maximum.speed = Math.max(...this.currentRoute.speed);
    this.currentRoute.minimum.speed = Math.min(...this.currentRoute.speed);
    this.currentRoute.minimum.altitude = Math.min(...this.currentRoute.altitude);
    // Emit the created route
    this.mapService.createFlightRoute(this.currentRoute.sourceID, this.currentRoute);
  }

  updateCurrentPath(lat: number, lng: number): void {
    // Set color of all points accordingly
    let color: string = '#D2222D';
    // Color of the first point
    if (this.currentRoute.pointData.length === 0) {
      color = '#238823';
    } else if (this.currentRoute.pointData.length > 1) {
      // Beyond the first point, use the previous point and the current point
      let len = this.currentRoute.pointData.length;
      this.currentRoute.pointData[len - 1].properties.color = '#bababa';
    }

    // Add a new point to the current flight path
    this.currentRoute.pointData.push({
      type: 'Feature',
      properties: {
        color: color,
        id: this.currentRoute.pointData.length,
      },
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
    });

    // Specify the line data geometry type as LineString
    let currentRouteGeometry = this.currentRoute.lineData.geometry as GeoJSON.LineString;

    // Access the source line data and append the new lng and lat
    currentRouteGeometry.coordinates.push([lng, lat]);
    // Update total distance only if we have 2 points or greater
    const len = currentRouteGeometry.coordinates.length;
    if (len >= 2) {
      this.currentRoute.distance += this.distanceBetweenPoints(
        currentRouteGeometry.coordinates[len - 1],
        currentRouteGeometry.coordinates[len - 2]
      );
    }

    // Update the layer accordingly
    this.updateLayer();
  }

  deleteFlightRoute(id: number): void {
    this.mapService.removeFlightRoute(id);
    this.clearLayer();
  }

  displayRoute(id: number, clearPrevious: boolean = true): void {
    // Clear the line and point layer features for the current source
    if (clearPrevious) {
      this.lineLayerGeojson.features = [];
      this.pointLayerGeojson.features = [];
    }
    // Set the line and point layer features to source ID
    const lineData = {
      ...this.pathSources.get(id)['lineData'],
      properties: {
        title: this.pathSources.get(id)['routeName'],
      },
    };
    this.lineLayerGeojson.features.push(lineData);
    this.pointLayerGeojson.features.push(...this.pathSources.get(id).pointData);
    // Update the layer
    this.updateLayer();
    this.addSymbolLayer();
  }

  showRouteUsingData(lineData: GeoJSON.Feature, pointData: GeoJSON.Feature[], clearPrevious: boolean = true): void {
    if (clearPrevious) {
      this.lineLayerGeojson.features = [];
      this.pointLayerGeojson.features = [];
    }
    // Set the line and point layer features to source ID
    this.lineLayerGeojson.features.push(lineData);
    this.pointLayerGeojson.features = pointData;
    // Update the layer
    this.updateLayer();
  }

  updateServer(sourceID: number): void {
    // Recalculate the distance for the path
    this.recalculateDistance(sourceID);
    // Update metadata for min and max
    let curr = this.pathSources.get(sourceID);
    curr.maximum.altitude = Math.max(...curr.altitude);
    curr.maximum.speed = Math.max(...curr.speed);
    curr.minimum.speed = Math.min(...curr.speed);
    curr.minimum.altitude = Math.min(...curr.altitude);
    // Update the server
    this.mapService.updateRouteList(curr);
  }

  recalculateDistance(sourceID: number): void {
    let tempDist = 0;
    let currentRoute = this.pathSources.get(sourceID);
    // Specify the line data geometry type as LineString
    let currentRouteGeometry = currentRoute.lineData.geometry as GeoJSON.LineString;
    // Loop through points and calculate the total distance
    for (let i = 1; i < currentRouteGeometry.coordinates.length; i++) {
      tempDist += this.distanceBetweenPoints(
        currentRouteGeometry.coordinates[i],
        currentRouteGeometry.coordinates[i - 1]
      );
    }
    currentRoute.distance = parseFloat(tempDist.toFixed(3));
  }

  distanceBetweenPoints(coord1: number[], coord2: number[]): number {
    let dLat = coord2[0] - coord1[0];
    let dLon = coord2[1] - coord1[1];
    let distance = Math.sqrt(dLat * dLat + dLon * dLon) * 1.113195e5;
    return distance;
  }
}

export class Region {
  _id: string;
  name: string;
  polygonNumber: string;
  altitude: number;
  speed: number;
  layerGeojson: GeoJSON.FeatureCollection;
  searchGeojson: GeoJSON.FeatureCollection;
  startingPoints: GeoJSON.FeatureCollection;
  multiLineData: GeoJSON.Geometry;
  created: Date;

  constructor() {
    this.name = '';
    this.polygonNumber = '';
    this.altitude = 0;
    this.speed = 0;
  }
};
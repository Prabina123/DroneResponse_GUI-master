export class IRoute {
  sourceID: number;
  // pointData: PointDatum[];
  pointData: GeoJSON.Feature[];
  // lineData: LineData;
  lineData: GeoJSON.Feature;
  routeName: string;
  author: string;
  created: Date;
  altitude: number[];
  speed: number[];
  maximum: {
    altitude: number;
    speed: number;
  };
  minimum: {
    altitude: number;
    speed: number;
  };
  distance: number;
  length: number;
};
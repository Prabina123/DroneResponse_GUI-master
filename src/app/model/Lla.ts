export class Lla {
  latitude: number;
  longitude: number;
  altitude: number;
  speed?: number;

  constructor() {
    this.latitude = 0;
    this.longitude = 0;
    this.altitude = 0;
    this.speed = 0;
  }
}

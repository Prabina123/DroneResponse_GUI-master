import { LngLat } from 'mapbox-gl';
import { StatusMessage } from './DroneStatus';
import { Region } from './Region';
import { IRoute } from './Route';

export class Drone {
  readonly uavid: string;
  readonly color: string;
  readonly ip: string;
  status?: StatusMessage;
}

export class DronePosition extends Drone {
  x?: number;
  y?: number;
  points?: any;
}


export class DragRegion {
  id: string;
  width: number;
  height: number;
  x: number;
  y: number;
  data?: Region;
  startingPoints?: any;
  drones?: Drone[];
  name?: string;
}

export class LinePoints {
  x: number;
  y: number;
  angle: number;
  width: number;
}

export class DragRoute {
  // id: number;
  sourceId: number;
  name?: string;
  points: LinePoints[];
  data: IRoute
  drone?: Drone;
}

export class DroneDrag {
  isDragging?: boolean;
  drone?: Drone;
  regions?: DragRegion[];
  routes?: DragRoute[];
  constructor() {
    this.isDragging = false;
  }
}
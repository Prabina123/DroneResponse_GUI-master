import { LngLat } from 'mapbox-gl';
import { StatusMessage } from './DroneStatus';
import { Region } from './Region';

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

export class DroneDrag {
  isDragging?: boolean;
  drone?: Drone;
  regions?: DragRegion[];
  constructor() {
    this.isDragging = false;
  }
}
import { Lla } from './Lla';
import { Attitude } from './Attitude';
import { Battery } from './Battery';

export class StatusMessage {
  status: string;
  mode: string;
  onboard_pilot: string;
  onboard_pilot2: string;
  airspeed: number;
  location: Lla;
  armed: boolean;
  battery: Battery;
  geofence: boolean;
  heartbeat_status: string;
  gimbal_attitude: Attitude;
  drone_attitude: Attitude;
  drone_heading: number;
}

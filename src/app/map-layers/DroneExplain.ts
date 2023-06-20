import * as mapboxgl from 'mapbox-gl';
import { environment } from 'src/environments/environment';

export class Explain {
  droneExplainBoxVisible: boolean;
  confidence: string;
  alert: string;
  map: mapboxgl.Map;
  drone: any;
  autoActions = [];
  //location: Lla;
  color: string;

  mist1: string = '../../assets/mist/mist_false_1.png'
  mist2: string = '../../assets/mist/mist_false_2.png'
  mist3: string = '../../assets/mist/mist_false_3.png'

  person1: string = '../../assets/person/person_true_1.png'
  person2: string = '../../assets/person/person_true_2.png'
  person3: string = '../../assets/person/person_true_3.png'

  image_urls = [];
  constructor(map: mapboxgl.Map) {
    this.droneExplainBoxVisible = false;
    this.map = map;
    //this.location = location;
  }

  setInformation(drone: any, type: string, alert: string, confidence: string, index: number): void {
    this.image_urls = []
    this.drone = drone;
    this.confidence = this.getCategoricalConfidence(confidence);
    this.color = this.drone.uavid;
    this.alert = alert;
    this.autoActions = Number(confidence) < environment.alert_confidence_threshold ? this.getActions(type, this.drone) : null;
    let explainBox = document.getElementById('explain-box-' + index);
    explainBox.style.backgroundColor = this.color
    this.setImageRefs(type)
    //this.image_urls=[this.mist1, this.mist2, this.mist3]
  }

  setImageRefs(alert: any): void {
    if (this.drone.uavid == 'DarkOrange') {
      this.image_urls.push(this.mist1)
      this.image_urls.push(this.mist2)
      this.image_urls.push(this.mist3)
    }
    else {
      this.image_urls.push(this.person1)
      this.image_urls.push(this.person2)
      this.image_urls.push(this.person3)
    }
  }

  setVisibility(bool: boolean): void {
    this.droneExplainBoxVisible = bool;
  }

  getColor(): string {
    return this.color;
  }

  reward(): void {
    console.log('reward drone')
  }

  suspend(): void {
    console.log('suspend drone')
  }

  configure(): void {
    console.log('configure drone')
  }

  getActions(type: string, drone: any): object[] {
    let altitude = Math.round(drone.status.location.altitude * 100) / 100;
    let velocity = Math.round(drone.status.airspeed * 100) / 100;
    let actions = {
      'mist': [
        { description: ['Reducing Altitude to 15m'], switch_control: true },
        { description: ['Reducing Velocity to 10 mph'], switch_control: true }
      ],
      'person': [
        { description: ['Mode: Search->Track'], switch_control: true },
        { description: ['Navigation: Waypoints->NED'], switch_control: false },
      ],
      'battery': [
        ['Returning to Home Base'],
        ['Return to the Nearest Landing Stattion'],
        ['Return to the Safest Landing Station']
      ],
      'path': [
        { description: ['Plan Replan', 'Avoiding Another Drone'], switch_control: false },
        { description: ['Autopilot Mode', 'Off-board'], switch_control: false }
      ],
      'rtl': [
        { description: ['Mode Switched', 'Search --> Land'], switch_control: false },
        { description: ['Landind station selected', 'Nearest'], switch_control: false }
      ]

    }

    return actions[type];
  }

  getCategoricalConfidence(confidence_str: string): string {
    let confidence = (+confidence_str) * 100
    if (confidence > 90)
      return 'Very High'
    else if (confidence > 75 && confidence < 90)
      return 'High'
    else if (confidence > 50 && confidence < 75)
      return 'Medium'
    else if (confidence > 30 && confidence < 50)
      return 'Low'
    else (confidence < 30)
      return 'Very Low'
  }

}
